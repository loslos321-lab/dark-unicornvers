import { useState, useRef } from "react";
import { FileLock, Upload, Download, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { toast } from "sonner";
import ToolLayout from "@/components/ToolLayout";
import { validateFileSize } from "@/lib/xss";

export default function FileVault() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 10;

  const handleEncrypt = async () => {
    if (!file || !password) {
      toast.error("Select file and enter password");
      return;
    }
    
    // Security: Validate file size
    if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
      toast.error(`File too large (max ${MAX_FILE_SIZE_MB}MB)`);
      return;
    }
    
    // Security: Validate password strength
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
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
    
    // Security: Validate file size
    if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
      toast.error(`File too large (max ${MAX_FILE_SIZE_MB}MB)`);
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
    <ToolLayout 
      title="File Vault" 
      icon={FileLock}
      description="Encrypt and decrypt files with AES-256-GCM"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors hover:bg-muted/30"
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
          <label className="text-xs font-mono text-muted-foreground">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter encryption password..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleEncrypt} 
            disabled={processing || !file}
            className="gap-2 font-mono h-12"
          >
            <Lock className="w-4 h-4" />
            ENCRYPT
          </Button>
          <Button 
            onClick={handleDecrypt} 
            disabled={processing || !file}
            variant="secondary"
            className="gap-2 font-mono h-12"
          >
            <Unlock className="w-4 h-4" />
            DECRYPT
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <FileLock className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              Files are encrypted client-side using AES-256-GCM before leaving your browser. 
              The encrypted file will have .encrypted extension. Max file size: {MAX_FILE_SIZE_MB}MB.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
