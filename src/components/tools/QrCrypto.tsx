import { useState } from "react";
import { QrCode, Lock, Unlock, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { toast } from "sonner";

export default function QrCrypto() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [qrData, setQrData] = useState("");
  const [decryptedText, setDecryptedText] = useState("");

  const generateQR = async () => {
    if (!message || !password) {
      toast.error("Enter message and password");
      return;
    }
    try {
      const encrypted = await encryptMessage(message, password);
      setQrData(encrypted);
      toast.success("QR code data generated");
    } catch {
      toast.error("Failed to generate");
    }
  };

  const decryptQR = async () => {
    if (!qrData || !password) {
      toast.error("Enter QR data and password");
      return;
    }
    try {
      const decrypted = await decryptMessage(qrData, password);
      setDecryptedText(decrypted);
      toast.success("Message decrypted");
    } catch {
      toast.error("Wrong password or invalid data");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrData);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="h-full flex flex-col bg-background p-4">
      <div className="flex items-center gap-2 mb-6">
        <QrCode className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold font-mono">QR CODE CRYPTO</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <Button 
          size="sm" 
          variant={mode === "encrypt" ? "default" : "outline"}
          onClick={() => setMode("encrypt")}
          className="flex-1 font-mono"
        >
          <Lock className="w-4 h-4 mr-2" />
          ENCRYPT
        </Button>
        <Button 
          size="sm" 
          variant={mode === "decrypt" ? "default" : "outline"}
          onClick={() => setMode("decrypt")}
          className="flex-1 font-mono"
        >
          <Unlock className="w-4 h-4 mr-2" />
          DECRYPT
        </Button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        <div>
          <label className="text-xs font-mono block mb-1">
            {mode === "encrypt" ? "MESSAGE TO ENCRYPT" : "QR DATA (PASTE HERE)"}
          </label>
          <textarea
            value={mode === "encrypt" ? message : qrData}
            onChange={(e) => mode === "encrypt" ? setMessage(e.target.value) : setQrData(e.target.value)}
            placeholder={mode === "encrypt" ? "Enter secret message..." : "Paste encrypted QR data..."}
            className="w-full h-24 bg-input border border-border rounded px-3 py-2 text-sm font-mono resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-mono block mb-1">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Encryption password..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        {mode === "encrypt" ? (
          <Button onClick={generateQR} className="w-full gap-2 font-mono">
            <QrCode className="w-4 h-4" />
            GENERATE QR DATA
          </Button>
        ) : (
          <Button onClick={decryptQR} className="w-full gap-2 font-mono">
            <Unlock className="w-4 h-4" />
            DECRYPT MESSAGE
          </Button>
        )}

        {qrData && mode === "encrypt" && (
          <div className="p-3 bg-muted border border-border rounded space-y-2">
            <p className="text-xs font-mono text-muted-foreground">ENCRYPTED DATA (COPY TO QR GENERATOR):</p>
            <div className="font-mono text-xs break-all max-h-20 overflow-y-auto bg-background p-2 rounded border">
              {qrData}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="flex-1 gap-1">
                <Copy className="w-3 h-3" />
                COPY
              </Button>
            </div>
          </div>
        )}

        {decryptedText && mode === "decrypt" && (
          <div className="p-3 bg-muted border border-primary/30 rounded">
            <p className="text-xs font-mono text-primary mb-1">DECRYPTED MESSAGE:</p>
            <p className="font-mono text-sm whitespace-pre-wrap break-all">{decryptedText}</p>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground font-mono mt-4 p-2 bg-muted rounded">
          Tip: Use any QR code generator (like qr-code-generator.com) with the encrypted data, 
          then scan and paste back here to decrypt.
        </div>
      </div>
    </div>
  );
}
