import { useState, useMemo } from "react";
import { Gauge, Shield, AlertTriangle, CheckCircle, Hash } from "lucide-react";
import ToolLayout from "@/components/ToolLayout";

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
    let percentage: number;

    if (entropy < 40) {
      strength = "weak";
      color = "text-destructive";
      time = "Instantly";
      percentage = 25;
    } else if (entropy < 60) {
      strength = "medium";
      color = "text-orange-500";
      time = "Minutes to hours";
      percentage = 50;
    } else if (entropy < 80) {
      strength = "strong";
      color = "text-yellow-500";
      time = "Years";
      percentage = 75;
    } else {
      strength = "very-strong";
      color = "text-green-500";
      time = "Centuries";
      percentage = 100;
    }

    return { entropy: Math.round(entropy), strength, color, time, percentage, charsetSize };
  }, [password]);

  return (
    <ToolLayout 
      title="Entropy Checker" 
      icon={Gauge}
      description="Analyze password strength and crack time"
    >
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <label className="text-xs font-mono text-muted-foreground block mb-2">PASSWORD TO ANALYZE</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full bg-input border border-border rounded px-3 py-3 text-sm font-mono"
          />
        </div>

        {analysis && (
          <div className="space-y-4">
            <div className="p-6 bg-muted border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground">ENTROPY</span>
                <span className={`text-3xl font-bold font-mono ${analysis.color}`}>
                  {analysis.entropy} <span className="text-base">bits</span>
                </span>
              </div>
              
              <div className="w-full bg-background h-3 rounded-full overflow-hidden border border-border">
                <div 
                  className={`h-full transition-all duration-500 ${
                    analysis.strength === 'weak' ? 'bg-destructive' : 
                    analysis.strength === 'medium' ? 'bg-orange-500' : 
                    analysis.strength === 'strong' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${analysis.percentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {analysis.strength === 'weak' ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                  <span className="text-[10px] font-mono text-muted-foreground">STRENGTH</span>
                </div>
                <p className={`text-lg font-mono uppercase ${analysis.color}`}>{analysis.strength}</p>
              </div>

              <div className="p-4 bg-muted rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-mono text-muted-foreground">CRACK TIME</span>
                </div>
                <p className="text-lg font-mono text-foreground">{analysis.time}</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-mono text-muted-foreground">CHARACTER SET</span>
              </div>
              <p className="text-sm font-mono mb-3">{analysis.charsetSize} unique characters</p>
              <div className="flex gap-2 text-[10px] flex-wrap">
                <span className={`px-3 py-1 rounded font-mono ${/[a-z]/.test(password) ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-muted border border-border text-muted-foreground'}`}>a-z</span>
                <span className={`px-3 py-1 rounded font-mono ${/[A-Z]/.test(password) ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-muted border border-border text-muted-foreground'}`}>A-Z</span>
                <span className={`px-3 py-1 rounded font-mono ${/[0-9]/.test(password) ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-muted border border-border text-muted-foreground'}`}>0-9</span>
                <span className={`px-3 py-1 rounded font-mono ${/[^a-zA-Z0-9]/.test(password) ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-muted border border-border text-muted-foreground'}`}>!@#</span>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground font-mono p-4 bg-muted/50 rounded border border-border">
              Based on brute-force calculation at 100 billion guesses/second (high-end GPU cluster).
              Actual security may vary based on attack methods.
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
