import { useState, useEffect } from "react";
import { FileText, Lock, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  created: number;
}

export default function SecureNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("secure_notes_encrypted");
    if (saved) setNotes([{ id: "vault", title: "Encrypted Vault", content: saved, created: Date.now() }]);
  }, []);

  const unlockVault = async () => {
    try {
      const encrypted = localStorage.getItem("secure_notes_encrypted");
      if (encrypted) {
        await decryptMessage(encrypted, password);
      }
      setIsUnlocked(true);
      toast.success("Vault unlocked");
    } catch {
      toast.error("Wrong password");
    }
  };

  const saveNote = async () => {
    if (!title || !content) return;
    try {
      const encrypted = await encryptMessage(content, password);
      localStorage.setItem("secure_notes_encrypted", encrypted);
      toast.success("Note encrypted and saved");
      setTitle("");
      setContent("");
    } catch {
      toast.error("Failed to save");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-full flex flex-col bg-background p-4 items-center justify-center">
        <Lock className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-sm font-bold font-mono mb-4">ENTER MASTER PASSWORD</h2>
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
          <Button onClick={unlockVault} className="w-full font-mono">
            UNLOCK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold font-mono">SECURE NOTES</h2>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setIsUnlocked(false)}>
          <Lock className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
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
          className="w-full flex-1 min-h-[200px] bg-input border border-border rounded px-3 py-2 text-sm font-mono resize-none"
        />

        <div className="flex gap-2">
          <Button onClick={saveNote} className="flex-1 gap-2 font-mono">
            <Save className="w-4 h-4" />
            ENCRYPT & SAVE
          </Button>
        </div>

        <div className="text-[10px] text-muted-foreground font-mono mt-4">
          * Notes are encrypted with AES-256-GCM and stored in browser memory only.
        </div>
      </div>
    </div>
  );
}
