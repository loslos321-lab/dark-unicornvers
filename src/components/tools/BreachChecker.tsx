import { useState } from "react";
import { Shield, Search, AlertTriangle, CheckCircle, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ToolLayout from "@/components/ToolLayout";

export default function BreachChecker() {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<null | { count: number; safe: boolean }>(null);

  const checkBreach = async () => {
    if (!password) {
      toast.error("Enter a password to check");
      return;
    }

    setChecking(true);
    try {
      // SHA-1 Hash des Passworts erstellen
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
      
      // k-Anonymity: Nur ersten 5 Zeichen senden
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);
      
      // HaveIBeenPwned API abfragen
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      
      // Prüfen ob unser Suffix in der Liste ist
      const lines = text.split("\n");
      let count = 0;
      
      for (const line of lines) {
        const [hashSuffix, occurrences] = line.split(":");
        if (hashSuffix.trim() === suffix) {
          count = parseInt(occurrences.trim());
          break;
        }
      }
      
      setResult({ count, safe: count === 0 });
      
      if (count > 0) {
        toast.error(`Found in ${count.toLocaleString()} data breaches!`);
      } else {
        toast.success("Password not found in any known breaches");
      }
    } catch (error) {
      toast.error("Check failed - please try again");
    } finally {
      setChecking(false);
    }
  };

  return (
    <ToolLayout 
      title="Breach Checker" 
      icon={Shield}
      description="Check if your password has been leaked in data breaches"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Hash className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              Uses k-anonymity: Only the first 5 characters of your password's SHA-1 hash are sent to HaveIBeenPwned. 
              Your actual password never leaves this browser.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-muted-foreground block mb-2">PASSWORD TO CHECK</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setResult(null);
            }}
            placeholder="Enter password..."
            className="w-full bg-input border border-border rounded px-3 py-3 text-sm font-mono"
          />
        </div>

        <Button 
          onClick={checkBreach} 
          disabled={checking || !password}
          className="w-full gap-2 font-mono h-12"
        >
          <Search className="w-4 h-4" />
          {checking ? "CHECKING..." : "CHECK BREACH STATUS"}
        </Button>

        {result && (
          <div className={`p-6 rounded-lg border-2 ${result.safe ? 'border-green-500/50 bg-green-500/10' : 'border-destructive/50 bg-destructive/10'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.safe ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-destructive" />
              )}
              <div>
                <h3 className={`text-lg font-bold font-mono ${result.safe ? 'text-green-500' : 'text-destructive'}`}>
                  {result.safe ? "PASSWORD SAFE" : "PASSWORD BREACHED!"}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {result.safe 
                    ? "Not found in any known data leaks" 
                    : `Found in ${result.count.toLocaleString()} data breaches`}
                </p>
              </div>
            </div>
            
            {!result.safe && (
              <div className="mt-4 p-3 bg-background/50 rounded border border-destructive/30">
                <p className="text-xs font-mono text-destructive">
                  ⚠️ This password is compromised. Never use it! Change it immediately if you're using it anywhere.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-[10px] text-muted-foreground font-mono p-3 bg-muted rounded border border-border">
          Powered by HaveIBeenPwned API. Your password is hashed locally and only a partial hash prefix is transmitted.
        </div>
      </div>
    </ToolLayout>
  );
}
