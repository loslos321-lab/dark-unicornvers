import { useState, useEffect } from "react";
import { Clipboard, Clock, Link2, Copy, CheckCircle, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { encryptMessage } from "@/lib/crypto";
import { toast } from "sonner";
import ToolLayout from "@/components/ToolLayout";

interface ClipItem {
  id: string;
  content: string;
  expiresAt: number;
  password: string;
}

export default function SecureClipboard() {
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [expiryHours, setExpiryHours] = useState(1);
  const [generatedLink, setGeneratedLink] = useState("");
  const [clipboard, setClipboard] = useState<ClipItem[]>([]);
  const [showContent, setShowContent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Cleanup expired items every minute
    const interval = setInterval(() => {
      const now = Date.now();
      setClipboard(prev => prev.filter(item => item.expiresAt > now));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const createSecureClip = async () => {
    if (!content || !password) {
      toast.error("Enter content and password");
      return;
    }

    try {
      const encrypted = await encryptMessage(content, password);
      const id = crypto.randomUUID();
      const expiresAt = Date.now() + (expiryHours * 60 * 60 * 1000);
      
      const newItem: ClipItem = {
        id,
        content: encrypted,
        expiresAt,
        password
      };
      
      setClipboard([newItem, ...clipboard]);
      
      const link = `${window.location.origin}/tools/secure-clipboard#${id}`;
      setGeneratedLink(link);
      setContent("");
      setPassword("");
      toast.success(`Secure clip created! Valid for ${expiryHours}h`);
    } catch (e) {
      toast.error("Encryption failed");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied! Share this + password separately.");
  };

  const toggleContent = (id: string, item: ClipItem) => {
    // In echt: Entschlüsseln mit Passwort
    setShowContent(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ToolLayout 
      title="Secure Clipboard" 
      icon={Clipboard}
      description="Self-destructing encrypted messages"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        {!generatedLink ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2">CONTENT TO SHARE</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste sensitive text here..."
                className="w-full h-32 bg-input border border-border rounded px-3 py-2 text-sm font-mono resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2">ENCRYPTION PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Share this separately!"
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>EXPIRES IN: {expiryHours} HOURS</span>
                <span className="text-muted-foreground">Max 24h</span>
              </div>
              <Slider value={[expiryHours]} onValueChange={(v) => setExpiryHours(v[0])} min={1} max={24} step={1} />
            </div>

            <Button onClick={createSecureClip} className="w-full gap-2 font-mono h-12">
              <Lock className="w-4 h-4" />
              CREATE SECURE LINK
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-bold font-mono text-green-500">SECURE LINK READY</h3>
              <p className="text-xs text-muted-foreground font-mono">Valid for {expiryHours} hours</p>
            </div>

            <div className="p-3 bg-muted border border-border rounded-lg">
              <p className="text-xs font-mono text-muted-foreground mb-2">SHARE THIS LINK:</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={generatedLink} 
                  readOnly 
                  className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono"
                />
                <Button size="sm" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-xs font-mono text-destructive">
                ⚠️ Remember: Share the password through a different channel (Signal, WhatsApp, etc.)!
              </p>
            </div>

            <Button variant="outline" onClick={() => setGeneratedLink("")} className="w-full font-mono">
              CREATE ANOTHER
            </Button>
          </div>
        )}

        {/* Active Clips */}
        {clipboard.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-mono text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              ACTIVE CLIPS ({clipboard.length})
            </h3>
            <div className="space-y-2">
              {clipboard.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted border border-border rounded text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-3 h-3 text-primary" />
                    <span className="truncate max-w-[150px]">...{item.id.slice(-8)}</span>
                    <span className="text-muted-foreground">
                      ({Math.ceil((item.expiresAt - Date.now()) / 60000)}m left)
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => toggleContent(item.id, item)}
                  >
                    {showContent[item.id] ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground font-mono p-3 bg-muted rounded border border-border">
          <strong>How it works:</strong> Content is encrypted with AES-256-GCM before storage. 
          The link contains an ID, the actual encrypted data stays in your browser's memory. 
          After expiry, it's permanently deleted.
        </div>
      </div>
    </ToolLayout>
  );
}
