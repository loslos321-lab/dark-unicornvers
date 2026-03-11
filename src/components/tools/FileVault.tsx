import { useState, useRef } from "react";
import { FileLock, Upload, Download, Lock, Unlock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { toast } from "sonner";

export default function FileVault() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEncrypt = async () => {
    if (!file || !password) {
      toast.error("Select file and enter password");
      return;
    }
    
    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const encrypted = await encryptMessage(content, password);
        
        const blob = new Blob([encrypted], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name}.encrypted`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success("File encrypted and downloaded");
        setFile(null);
        setPassword("");
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error("Encryption failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) {
      toast.error("Select file and enter password");
      return;
    }
    
    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const decrypted = await decryptMessage(content, password);
        
        const blob = new Blob([decrypted], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(".encrypted", "");
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success("File decrypted and downloaded");
        setFile(null);
        setPassword("");
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error("Decryption failed - wrong password?");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background p-4">
      <div className="flex items-center gap-2 mb-6">
        <FileLock className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold font-mono">FILE VAULT</h2>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-mono">
            {file ? file.name : "Click to select file"}
          </p>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter encryption password..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleEncrypt} 
            disabled={processing || !file}
            className="gap-2 font-mono"
          >
            <Lock className="w-4 h-4" />
            ENCRYPT
          </Button>
          <Button 
            onClick={handleDecrypt} 
            disabled={processing || !file}
            variant="secondary"
            className="gap-2 font-mono"
          >
            <Unlock className="w-4 h-4" />
            DECRYPT
          </Button>
        </div>

        <div className="p-4 bg-muted rounded border border-border">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
              Files are encrypted/decrypted client-side using AES-256-GCM. 
              The encrypted file will have .encrypted extension. 
              Large files (&gt;10MB) may take a moment to process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
