import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Copy, Check, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { encryptMessage } from "@/lib/crypto";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SecretLinks() {
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [myLinks, setMyLinks] = useState<{ id: string; created: number; viewed: boolean }[]>([]);

  const createLink = async () => {
    if (!message.trim() || !password.trim()) {
      toast.error("Enter a message and encryption password");
      return;
    }
    setCreating(true);
    try {
      const encrypted = await encryptMessage(message, password);

      let passwordHash: string | null = null;
      if (usePassword && linkPassword.trim()) {
        // Hash entry password server-side with bcrypt
        const { data: hash, error: hashError } = await supabase.rpc("hash_password_bcrypt", { password: linkPassword });
        if (hashError || !hash) throw new Error("Failed to hash password");
        passwordHash = hash;
      }

      const { data, error } = await supabase
        .from("secret_links")
        .insert({
          encrypted_message: encrypted,
          password_protected: usePassword && !!linkPassword.trim(),
          password_hash: passwordHash,
        })
        .select("id")
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/secret/${data.id}`;
      setGeneratedLink(link);
      setMyLinks((prev) => [...prev, { id: data.id, created: Date.now(), viewed: false }]);
      setMessage("");
      toast.success("One-time link created!");
    } catch {
      toast.error("Failed to create link");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkStatus = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("secret_links")
        .select("viewed, viewed_at")
        .eq("id", id)
        .single();

      if (error) throw error;

      setMyLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, viewed: data.viewed } : l))
      );

      if (data.viewed) {
        toast.info(`Opened at ${new Date(data.viewed_at!).toLocaleString()}`);
      } else {
        toast.info("Not yet opened");
      }
    } catch {
      toast.error("Could not check status");
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-accent font-mono flex items-center gap-2">
          <Link2 className="w-4 h-4" /> ONE-TIME LINKS
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Create a self-destructing encrypted link. The message is destroyed after being read once.
        </p>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Secret Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="This message will self-destruct..."
            maxLength={50000}
            className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Encryption Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password to encrypt..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1 opacity-70">
            Share this password separately with the recipient
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUsePassword(!usePassword)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              usePassword ? "bg-primary border-primary" : "border-border"
            }`}
          >
            {usePassword && <Check className="w-3 h-3 text-primary-foreground" />}
          </button>
          <span className="text-xs text-muted-foreground">Require entry password to open link</span>
        </div>

        {usePassword && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
              <Lock className="w-3 h-3" /> Entry Password
            </label>
            <input
              type="password"
              value={linkPassword}
              onChange={(e) => setLinkPassword(e.target.value)}
              placeholder="Password to open the link..."
              className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        <Button size="sm" onClick={createLink} disabled={creating} className="w-full">
          <Shield className="w-3 h-3 mr-1" />
          {creating ? "Creating..." : "Create One-Time Link"}
        </Button>

        {generatedLink && (
          <div className="bg-secondary/50 rounded p-3 border border-primary/30">
            <span className="text-xs text-primary block mb-2 font-mono">LINK READY:</span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={generatedLink}
                className="flex-1 bg-input border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground truncate"
              />
              <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 opacity-70">
              ⚠ This link will only work once. After viewing, the message is permanently deleted.
            </p>
          </div>
        )}

        {myLinks.length > 0 && (
          <div className="mt-2">
            <span className="text-xs text-muted-foreground mb-2 block">Your Links (this session)</span>
            <div className="flex flex-col gap-2">
              {myLinks.map((link) => (
                <div
                  key={link.id}
                  className="bg-secondary/50 rounded p-2 border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {link.viewed ? (
                      <Eye className="w-3 h-3 text-accent shrink-0" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-primary shrink-0" />
                    )}
                    <span className="text-xs font-mono text-muted-foreground truncate">
                      ...{link.id.slice(-8)}
                    </span>
                    <span
                      className={`text-xs font-mono ${
                        link.viewed ? "text-accent" : "text-primary"
                      }`}
                    >
                      {link.viewed ? "OPENED" : "PENDING"}
                    </span>
                  </div>
                  <button
                    onClick={() => checkStatus(link.id)}
                    className="text-xs text-primary hover:underline shrink-0 ml-2"
                  >
                    Check
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
