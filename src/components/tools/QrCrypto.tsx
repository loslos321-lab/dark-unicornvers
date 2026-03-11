import { useState } from "react";
import { QrCode, Lock, Unlock, Copy, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { toast } from "sonner";
import ToolLayout from "@/components/ToolLayout";

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
      toast.success("QR data generated");
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
    <ToolLayout 
      title="QR Code Crypto" 
      icon={QrCode}
      description="Encrypt messages for QR code transfer"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={mode === "encrypt" ? "default" : "outline"}
            onClick={() => setMode("encrypt")}
            className="flex-1 font-mono gap-2"
          >
            <Lock className="w-4 h-4" />
            ENCRYPT TO QR
          </Button>
          <Button 
            size="sm" 
            variant={mode === "decrypt" ? "default" : "outline"}
            onClick={() => setMode("decrypt")}
            className="flex-1 font-mono gap-2"
          >
            <Scan className="w-4 h-4" />
            DECRYPT FROM QR
          </Button>
        </div>

        <div>
          <label className="text-xs font-mono text-muted-foreground block mb-2">
            {mode === "encrypt" ? "MESSAGE TO ENCRYPT" : "QR DATA (PASTE HERE)"}
          </label>
          <textarea
            value={mode === "encrypt" ? message : qrData}
            onChange={(e) => mode === "encrypt" ? setMessage(e.target.value) : setQrData(e.target.value)}
            placeholder={mode === "encrypt" ? "Enter secret message..." : "Paste encrypted QR data..."}
            className="w-full h-32 bg-input border border-border rounded px-3 py-2 text-sm font-mono resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-mono text-muted-foreground block mb-2">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Encryption password..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        {mode === "encrypt" ? (
          <Button onClick={generateQR} className="w-full gap-2 font-mono h-12">
            <QrCode className="w-4 h-4" />
            GENERATE ENCRYPTED QR DATA
          </Button>
        ) : (
          <Button onClick={decryptQR} className="w-full gap-2 font-mono h-12">
            <Unlock className="w-4 h-4" />
            DECRYPT MESSAGE
          </Button>
        )}

        {qrData && mode === "encrypt" && (
          <div className="p-4 bg-muted border border-border rounded-lg space-y-3">
            <p className="text-xs font-mono text-muted-foreground">ENCRYPTED DATA (COPY TO QR GENERATOR):</p>
            <div className="font-mono text-xs break-all max-h-32 overflow-y-auto bg-background p-3 rounded border">
              {qrData}
            </div>
            <Button size="sm" variant="outline" onClick={copyToClipboard} className="w-full gap-2 font-mono">
              <Copy className="w-4 h-4" />
              COPY TO CLIPBOARD
            </Button>
          </div>
        )}

        {decryptedText && mode === "decrypt" && (
          <div className="p-4 bg-muted border border-primary/30 rounded-lg">
            <p className="text-xs font-mono text-primary mb-2">DECRYPTED MESSAGE:</p>
            <p className="font-mono text-sm whitespace-pre-wrap break-all">{decryptedText}</p>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground font-mono p-3 bg-muted rounded border border-border">
          Tip: Use any QR code generator (like qr-code-generator.com) with the encrypted data, 
          then scan and paste back here to decrypt. The data never touches our servers.
        </div>
      </div>
    </ToolLayout>
  );
}
