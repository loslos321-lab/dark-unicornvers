import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { decryptMessage } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, ArrowLeft } from "lucide-react";

type ViewState = "loading" | "password" | "decrypt" | "revealed" | "gone" | "error";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30000;

const SecretView = () => {
  const { id } = useParams();
  const [state, setState] = useState<ViewState>("loading");
  const [entryPassword, setEntryPassword] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState(0);

  useEffect(() => {
    if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
      setState("error");
      return;
    }
    fetchSecret();
  }, [id]);

  const fetchSecret = async () => {
    try {
      const { data, error: rpcError } = await (supabase.rpc as any)("get_secret_link_meta", { link_id: id });
      if (rpcError || !data || data.length === 0) { setState("error"); return; }
      const meta = data[0] as { is_viewed: boolean; is_password_protected: boolean };
      if (meta.is_viewed) { setState("gone"); return; }
      setState(meta.is_password_protected ? "password" : "decrypt");
    } catch { setState("error"); }
  };

  const checkRateLimit = () => {
    if (attempts >= MAX_ATTEMPTS) {
      const now = Date.now();
      if (now < lockoutEnd) {
        setError(`Too many attempts. Wait ${Math.ceil((lockoutEnd - now) / 1000)}s`);
        return false;
      }
      setAttempts(0);
    }
    return true;
  };

  const handleEntryPasswordSubmit = async () => {
    if (!checkRateLimit()) return;
    setError("");
    try {
      const { data } = await supabase.rpc("verify_secret_link_password", { link_id: id, attempt: entryPassword });
      if (!data) { incrementAttempts(); setError("Invalid password"); return; }
      setState("decrypt");
    } catch { incrementAttempts(); setError("Verification failed"); }
  };

  const handleDecrypt = async () => {
    if (!checkRateLimit()) return;
    setError("");
    try {
      // Atomically mark as viewed and get encrypted content via RPC
      const { data: encryptedContent, error: rpcError } = await supabase.rpc("view_secret_link", { link_id: id });
      if (rpcError || !encryptedContent) { incrementAttempts(); setError("Not found or already viewed"); return; }
      const decrypted = await decryptMessage(encryptedContent, decryptPassword);
      setDecryptedText(decrypted);
      setState("revealed");
    } catch { incrementAttempts(); setError("Wrong password"); }
  };

  const incrementAttempts = () => {
    setAttempts(prev => {
      const next = prev + 1;
      if (next >= MAX_ATTEMPTS) setLockoutEnd(Date.now() + LOCKOUT_DURATION);
      return next;
    });
  };

  if (state === "error") return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Invalid link</h1><Link to="/" className="text-primary hover:underline mt-4 inline-block"><ArrowLeft className="inline mr-2 h-4 w-4" />Back</Link></div></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        {state === "loading" && <div className="text-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div><p>Loading...</p></div>}
        
        {state === "gone" && <div className="text-center space-y-4"><Lock className="h-12 w-12 text-destructive mx-auto" /><h2 className="text-2xl font-bold">Message destroyed</h2><p className="text-muted-foreground">Already viewed or doesn't exist.</p><Link to="/" className="text-primary hover:underline inline-block"><ArrowLeft className="inline mr-2 h-4 w-4" />Back</Link></div>}

        {state === "password" && <div className="space-y-4"><Lock className="h-12 w-12 text-primary mx-auto" /><h2 className="text-xl font-bold text-center">Password Protected</h2><input type="password" value={entryPassword} onChange={(e) => setEntryPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleEntryPasswordSubmit()} placeholder="Entry password..." className="w-full bg-input border border-border rounded px-3 py-2 text-sm" />{error && <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{error}</div>}<Button onClick={handleEntryPasswordSubmit} className="w-full" disabled={!entryPassword}>Continue</Button></div>}

        {state === "decrypt" && <div className="space-y-4"><Unlock className="h-12 w-12 text-primary mx-auto" /><h2 className="text-xl font-bold text-center">Decrypt Message</h2><input type="password" value={decryptPassword} onChange={(e) => setDecryptPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleDecrypt()} placeholder="Decryption password..." className="w-full bg-input border border-border rounded px-3 py-2 text-sm" />{error && <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{error}</div>}<Button onClick={handleDecrypt} className="w-full" disabled={!decryptPassword}>Decrypt</Button></div>}

        {state === "revealed" && <div className="space-y-4"><h2 className="text-xl font-bold text-center text-primary">Decrypted:</h2><div className="bg-muted p-4 rounded-lg border border-border font-mono text-sm whitespace-pre-wrap break-all max-h-96 overflow-y-auto">{decryptedText}</div><div className="flex items-center justify-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded"><Lock className="h-4 w-4" /><span>Message destroyed</span></div><Link to="/" className="text-primary hover:underline inline-flex items-center justify-center w-full"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></div>}
      </div>
    </div>
  );
};

export default SecretView;
