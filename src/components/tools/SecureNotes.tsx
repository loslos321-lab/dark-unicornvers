import { useState, useEffect } from "react";
import { FileText, Lock, Save, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { toast } from "sonner";
import ToolLayout from "@/components/ToolLayout";

interface Note {
  id: string;
  title: string;
  content: string;
  created: number;
}

export default function SecureNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("secure_notes_encrypted");
    if (saved) {
      setSavedNote(saved);
    }
  }, []);

  const unlockVault = async () => {
    try {
      if (savedNote) {
        await decryptMessage(savedNote, password);
      }
      setIsUnlocked(true);
      toast.success("Vault unlocked");
    } catch {
      toast.error("Wrong password");
    }
  };

  const saveNote = async () => {
    if (!title || !content) {
      toast.error("Enter title and content");
      return;
    }
    try {
      const encrypted = await encryptMessage(content, password);
      localStorage.setItem("secure_notes_encrypted", encrypted);
      localStorage.setItem("secure_notes_title", title);
      toast.success("Note encrypted and saved");
      setSavedNote(encrypted);
    } catch {
      toast.error("Failed to save");
    }
  };

  if (!isUnlocked) {
    return (
      <ToolLayout 
        title="Secure Notes" 
        icon={FileText}
        description="AES-256 encrypted notes stored locally"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Lock className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-sm font-bold font-mono">ENTER MASTER PASSWORD</h2>
          <div className="w-full max-w-xs space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password..."
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono pr-10"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button onClick={unlockVault} className="w-full font-mono gap-2">
              <Shield className="w-4 h-4" />
              UNLOCK
            </Button>
          </div>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout 
      title="Secure Notes" 
      icon={FileText}
      description="Your encrypted note storage"
    >
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Shield className="w-3 h-3 text-green-500" />
            <span>Vault Unlocked</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setIsUnlocked(false)}>
            <Lock className="w-4 h-4 mr-1" />
            Lock
          </Button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono"
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your secure note here..."
          className="w-full h-64 bg-input border border-border rounded px-3 py-2 text-sm font-mono resize-none"
        />

        <Button onClick={saveNote} className="w-full gap-2 font-mono h-12">
          <Save className="w-4 h-4" />
          ENCRYPT & SAVE TO LOCAL STORAGE
        </Button>

        <div className="text-[10px] text-muted-foreground font-mono p-3 bg-muted rounded border border-border">
          * Notes are encrypted with AES-256-GCM and stored in browser local storage only. 
          If you forget the password, the data is lost forever.
        </div>
      </div>
    </ToolLayout>
  );
}
