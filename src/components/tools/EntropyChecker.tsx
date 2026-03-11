import { useState, useMemo } from "react";
import { Gauge, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function EntropyChecker() {
  const [password, setPassword] = useState("");

  const analysis = useMemo(() => {
    if (!password) return null;

    const length = password.length;
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;

    const entropy = length * Math.log2(charsetSize || 1);
    
    let strength: "weak" | "medium" | "strong" | "very-strong";
    let color: string;
    let time: string;

    if (entropy < 40) {
      strength = "weak";
      color = "text-destructive";
      time = "Instantly";
    } else if (entropy < 60) {
      strength = "medium";
      color = "text-orange-500";
      time = "Minutes to hours";
    } else if (entropy < 80) {
      strength = "strong";
      color = "text-yellow-500";
      time = "Years";
    } else {
      strength = "very-strong";
      color = "text-green-500";
      time = "Centuries";
    }

    return { entropy: Math.round(entropy), strength, color, time, charsetSize };
  }, [password]);

  return (
    <div className="h-full flex flex-col bg-background p-4">
      <div className="flex items-center gap-2 mb-6">
        <Gauge className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold font-mono">ENTROPY CHECKER</h2>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="text-xs font-mono block mb-1">PASSWORD TO ANALYZE</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        {analysis && (
          <div className="space-y-3">
            <div className="p-4 bg-muted border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">ENTROPY</span>
                <span className={`text-2xl font-bold font-mono ${analysis.color}`}>
                  {analysis.entropy} <span className="text-sm">bits</span>
                </span>
              </div>
              
              <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${analysis.strength === 'weak' ? 'bg-destructive w-1/4' : analysis.strength === 'medium' ? 'bg-orange-500 w-2/4' : analysis.strength === 'strong' ? 'bg-yellow-500 w-3/4' : 'bg-green-500 w-full'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded border border-border">
                <div className="flex items-center gap-2 mb-1">
                  {analysis.strength === 'weak' ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                  <span className="text-[10px] font-mono text-muted-foreground">STRENGTH</span>
                </div>
                <p className={`text-sm font-mono uppercase ${analysis.color}`}>{analysis.strength}</p>
              </div>

              <div className="p-3 bg-muted rounded border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-mono text-muted-foreground">CRACK TIME</span>
                </div>
                <p className="text-sm font-mono text-foreground">{analysis.time}</p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded border border-border">
              <p className="text-[10px] font-mono text-muted-foreground mb-1">CHARACTER SET</p>
              <p className="text-xs font-mono">{analysis.charsetSize} unique characters</p>
              <div className="flex gap-2 mt-2 text-[10px]">
                <span className={`px-2 py-0.5 rounded ${/[a-z]/.test(password) ? 'bg-green-500/20 text-green-500' : 'bg-muted'}`}>a-z</span>
                <span className={`px-2 py-0.5 rounded ${/[A-Z]/.test(password) ? 'bg-green-500/20 text-green-500' : 'bg-muted'}`}>A-Z</span>
                <span className={`px-2 py-0.5 rounded ${/[0-9]/.test(password) ? 'bg-green-500/20 text-green-500' : 'bg-muted'}`}>0-9</span>
                <span className={`px-2 py-0.5 rounded ${/[^a-zA-Z0-9]/.test(password) ? 'bg-green-500/20 text-green-500' : 'bg-muted'}`}>!@#</span>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground font-mono p-2 bg-muted/50 rounded">
              Based on brute-force calculation at 100 billion guesses/second (high-end GPU cluster).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
