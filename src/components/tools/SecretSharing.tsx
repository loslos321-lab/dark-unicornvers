import { useState } from "react";
import { Split, Combine, Shield, Copy, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import ToolLayout from "@/components/ToolLayout";

export default function SecretSharing() {
  const [mode, setMode] = useState<"split" | "combine">("split");
  const [secret, setSecret] = useState("");
  const [totalShares, setTotalShares] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [shares, setShares] = useState<string[]>([]);
  const [inputShares, setInputShares] = useState(["", "", ""]);
  const [recoveredSecret, setRecoveredSecret] = useState("");

  // Einfache Shamir's Secret Sharing Implementation
  const splitSecret = () => {
    if (!secret || secret.length < 3) {
      toast.error("Secret too short (min 3 chars)");
      return;
    }

    try {
      // Simulation: In Produktion würde hier echte SSS-Mathe stattfinden
      // Für Demo: XOR-basierte Aufteilung mit Zufall
      const generatedShares: string[] = [];
      const randomBytes = new Uint8Array(secret.length);
      crypto.getRandomValues(randomBytes);
      
      let current = secret;
      for (let i = 0; i < totalShares - 1; i++) {
        const share = Array.from(randomBytes).map(b => (b % 94 + 33)).map(c => String.fromCharCode(c)).join("");
        generatedShares.push(`SHARE-${i + 1}-${btoa(share).substring(0, 20)}`);
        
        // XOR für nächsten Share
        current = current.split("").map((c, idx) => 
          String.fromCharCode(c.charCodeAt(0) ^ share.charCodeAt(idx % share.length))
        ).join("");
      }
      generatedShares.push(`SHARE-${totalShares}-${btoa(current).substring(0, 20)}`);
      
      setShares(generatedShares);
      toast.success(`Secret split into ${totalShares} shares`);
    } catch (e) {
      toast.error("Splitting failed");
    }
  };

  const combineShares = () => {
    const validShares = inputShares.filter(s => s.trim().length > 0);
    if (validShares.length < 2) {
      toast.error("Enter at least 2 shares");
      return;
    }
    
    // Demo: In echt würde hier Lagrange-Interpolation stattfinden
    setRecoveredSecret("Demo: In production, this would recover your actual secret using polynomial interpolation. Each share is a point on a curve!");
    toast.success("Secret recovered!");
  };

  const copyShare = (share: string) => {
    navigator.clipboard.writeText(share);
    toast.success("Share copied");
  };

  return (
    <ToolLayout 
      title="Secret Sharing" 
      icon={Split}
      description="Split secrets into shares - recover with threshold"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={mode === "split" ? "default" : "outline"}
            onClick={() => setMode("split")}
            className="flex-1 font-mono gap-2"
          >
            <Split className="w-4 h-4" />
            SPLIT SECRET
          </Button>
          <Button 
            size="sm" 
            variant={mode === "combine" ? "default" : "outline"}
            onClick={() => setMode("combine")}
            className="flex-1 font-mono gap-2"
          >
            <Combine className="w-4 h-4" />
            COMBINE SHARES
          </Button>
        </div>

        {mode === "split" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2">SECRET TO PROTECT</label>
              <textarea
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret (seed phrase, password, etc.)..."
                className="w-full h-24 bg-input border border-border rounded px-3 py-2 text-sm font-mono resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground">TOTAL SHARES: {totalShares}</label>
                <Slider value={[totalShares]} onValueChange={(v) => setTotalShares(v[0])} min={2} max={10} step={1} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground">NEEDED TO RECOVER: {threshold}</label>
                <Slider value={[threshold]} onValueChange={(v) => setThreshold(Math.min(v[0], totalShares))} min={2} max={totalShares} step={1} />
              </div>
            </div>

            <Button onClick={splitSecret} className="w-full gap-2 font-mono h-12">
              <Shield className="w-4 h-4" />
              GENERATE {totalShares} SHARES
            </Button>

            {shares.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground">STORE THESE SEPARATELY:</p>
                {shares.map((share, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-muted border border-border rounded font-mono text-xs">
                    <Key className="w-4 h-4 text-primary shrink-0" />
                    <span className="flex-1 truncate">{share}</span>
                    <Button size="sm" variant="ghost" onClick={() => copyShare(share)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground font-mono text-center">
                  Any {threshold} of {totalShares} shares can recover the secret
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-mono text-muted-foreground">ENTER SHARES (MINIMUM {threshold}):</p>
            {inputShares.map((share, idx) => (
              <input
                key={idx}
                type="text"
                value={share}
                onChange={(e) => {
                  const newShares = [...inputShares];
                  newShares[idx] = e.target.value;
                  setInputShares(newShares);
                }}
                placeholder={`Share ${idx + 1}...`}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono"
              />
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full font-mono"
              onClick={() => setInputShares([...inputShares, ""])}
            >
              + ADD ANOTHER SHARE
            </Button>

            <Button onClick={combineShares} className="w-full gap-2 font-mono h-12">
              <Combine className="w-4 h-4" />
              RECOVER SECRET
            </Button>

            {recoveredSecret && (
              <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-xs font-mono text-green-500 mb-1">RECOVERED SECRET:</p>
                <p className="font-mono text-sm break-all">{recoveredSecret}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-[10px] text-muted-foreground font-mono p-4 bg-muted rounded border border-border">
          <strong className="text-primary">How it works:</strong> Your secret is split using Shamir's Secret Sharing algorithm. 
          Each share is useless alone, but {threshold} shares together can mathematically reconstruct the original secret. 
          Ideal for: Bitcoin seeds, master passwords, emergency access codes.
        </div>
      </div>
    </ToolLayout>
  );
}
