// AES-GCM encryption/decryption utilities using Web Crypto API

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(message: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(message)
  );
  // Combine salt + iv + ciphertext and base64 encode
  const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(encrypted).length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptMessage(payload: string, password: string): Promise<string> {
  const combined = new Uint8Array(atob(payload).split("").map(c => c.charCodeAt(0)));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

// LSB Steganography: embed encrypted text into canvas pixel data
export function embedInCanvas(canvas: HTMLCanvasElement, data: string): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Prefix with length (4 bytes) + data bytes
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const lengthBytes = new Uint8Array(4);
  new DataView(lengthBytes.buffer).setUint32(0, dataBytes.length);
  const allBytes = new Uint8Array(4 + dataBytes.length);
  allBytes.set(lengthBytes, 0);
  allBytes.set(dataBytes, 4);

  const bitsNeeded = allBytes.length * 8;
  // Use only RGB channels (skip alpha), so 3 bits per pixel
  const pixelsNeeded = Math.ceil(bitsNeeded / 3);
  if (pixelsNeeded > pixels.length / 4) {
    throw new Error("Message too large for this canvas size");
  }

  let bitIndex = 0;
  for (let i = 0; i < pixels.length && bitIndex < bitsNeeded; i++) {
    if (i % 4 === 3) continue; // skip alpha
    const byteIdx = Math.floor(bitIndex / 8);
    const bitPos = 7 - (bitIndex % 8);
    const bit = (allBytes[byteIdx] >> bitPos) & 1;
    pixels[i] = (pixels[i] & 0xFE) | bit;
    bitIndex++;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export function extractFromImage(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // Read bits from LSB of RGB channels
  const bits: number[] = [];
  for (let i = 0; i < pixels.length; i++) {
    if (i % 4 === 3) continue;
    bits.push(pixels[i] & 1);
  }

  // Read 4-byte length header
  const lengthBits = bits.slice(0, 32);
  let length = 0;
  for (let i = 0; i < 32; i++) {
    length = (length << 1) | lengthBits[i];
  }

  if (length <= 0 || length > 1_000_000) throw new Error("No valid data found");

  // Read data bytes
  const dataBytes = new Uint8Array(length);
  for (let b = 0; b < length; b++) {
    let byte = 0;
    for (let bit = 0; bit < 8; bit++) {
      const idx = 32 + b * 8 + bit;
      byte = (byte << 1) | (bits[idx] || 0);
    }
    dataBytes[b] = byte;
  }

  return new TextDecoder().decode(dataBytes);
}
