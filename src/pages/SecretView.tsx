import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Lock, Unlock, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { decryptMessage } from "@/lib/crypto";
import { supabase } from "@/integrations/supabase/client";

type LinkState = "loading" | "password" | "decrypt" | "revealed" | "gone" | "error";

export default function SecretView() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LinkState>("loading");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [entryPassword, setEntryPassword] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setState("error"); return; }

    const load = async () => {
      const { data, error } = await supabase
        .from("secret_links")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setState("gone");
        return;
      }

      if (data.viewed) {
        setState("gone");
        return;
      }

      setEncryptedMessage(data.encrypted_message);
      setPasswordProtected(data.password_protected);

      if (data.password_protected) {
        setState("password");
      } else {
        setState("decrypt");
      }
    };

    load();
  }, [id]);

  const verifyEntryPassword = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(entryPassword);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { data: link } = await supabase
      .from("secret_links")
      .select("password_hash")
      .eq("id", id!)
      .single();

    if (link?.password_hash === hash) {
      setState("decrypt");
    } else {
      setError("Wrong entry password");
    }
  };

  const revealMessage = async () => {
    if (!decryptPassword.trim()) {
      setError("Enter the decryption password");
      return;
    }
    try {
      const text = await decryptMessage(encryptedMessage, decryptPassword);
      setDecryptedText(text);

      // Mark as viewed and effectively destroy
      await supabase
        .from("secret_links")
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .eq("id", id!);

      setState("revealed");
    } catch {
      setError("Wrong decryption password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-bold text-foreground font-mono">SECRET MESSAGE</h1>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {state === "loading" && (
              <p className="text-sm text-muted-foreground text-center font-mono animate-pulse">
                Loading...
              </p>
            )}

            {state === "gone" && (
              <div className="text-center flex flex-col items-center gap-3">
                <AlertTriangle className="w-10 h-10 text-accent" />
                <p className="text-sm text-foreground font-mono">This message has been destroyed</p>
                <p className="text-xs text-muted-foreground">
                  It was either already viewed or doesn't exist.
                </p>
              </div>
            )}

            {state === "error" && (
              <div className="text-center">
                <p className="text-sm text-destructive font-mono">Invalid link</p>
              </div>
            )}

            {state === "password" && (
              <>
                <div className="text-center flex flex-col items-center gap-2">
                  <Lock className="w-8 h-8 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    This message is password-protected. Enter the entry password to proceed.
                  </p>
                </div>
                <input
                  type="password"
                  value={entryPassword}
                  onChange={(e) => { setEntryPassword(e.target.value); setError(""); }}
                  placeholder="Entry password..."
                  className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button onClick={verifyEntryPassword} className="w-full">
                  <Unlock className="w-4 h-4 mr-1" /> Verify
                </Button>
              </>
            )}

            {state === "decrypt" && (
              <>
                <div className="text-center flex flex-col items-center gap-2">
                  <Lock className="w-8 h-8 text-accent" />
                  <p className="text-sm text-foreground font-mono">Message found</p>
                  <p className="text-xs text-muted-foreground">
                    Enter the decryption password to reveal. The message will be destroyed after viewing.
                  </p>
                </div>
                <input
                  type="password"
                  value={decryptPassword}
                  onChange={(e) => { setDecryptPassword(e.target.value); setError(""); }}
                  placeholder="Decryption password..."
                  className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button onClick={revealMessage} variant="destructive" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Reveal & Destroy
                </Button>
              </>
            )}

            {state === "revealed" && (
              <>
                <div className="bg-secondary/50 rounded p-4 border border-primary/30">
                  <span className="text-xs text-primary block mb-2 font-mono">DECRYPTED MESSAGE:</span>
                  <p className="text-sm text-foreground font-mono break-all whitespace-pre-wrap">
                    {decryptedText}
                  </p>
                </div>
                <p className="text-xs text-accent text-center font-mono">
                  ⚠ This message has been permanently destroyed
                </p>
              </>
            )}

            <Link
              to="/"
              className="text-xs text-primary hover:underline flex items-center gap-1 justify-center mt-2"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Vector Crypto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
