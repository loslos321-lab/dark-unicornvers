import { useState, useEffect } from "react";
import { Copy, RefreshCw, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    };

    let charset = "";
    if (options.uppercase) charset += chars.uppercase;
    if (options.lowercase) charset += chars.lowercase;
    if (options.numbers) charset += chars.numbers;
    if (options.symbols) charset += chars.symbols;

    if (charset === "") {
      toast.error("Select at least one character type");
      return;
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    
    setPassword(result);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  return (
    <div className="h-full flex flex-col bg-background p-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold font-mono">PASSWORD GENERATOR</h2>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto">
        <div className="relative">
          <div className="bg-muted border border-border rounded-lg p-4 font-mono text-sm break-all min-h-[60px] flex items-center">
            {password}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span>LENGTH</span>
            <span>{length} chars</span>
          </div>
          <Slider
            value={[length]}
            onValueChange={(v) => setLength(v[0])}
            min={8}
            max={64}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={options.uppercase} onCheckedChange={(c) => setOptions({...options, uppercase: c as boolean})} />
            <span className="font-mono text-xs">UPPERCASE (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={options.lowercase} onCheckedChange={(c) => setOptions({...options, lowercase: c as boolean})} />
            <span className="font-mono text-xs">LOWERCASE (a-z)</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={options.numbers} onCheckedChange={(c) => setOptions({...options, numbers: c as boolean})} />
            <span className="font-mono text-xs">NUMBERS (0-9)</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={options.symbols} onCheckedChange={(c) => setOptions({...options, symbols: c as boolean})} />
            <span className="font-mono text-xs">SYMBOLS (!@#$...)</span>
          </label>
        </div>

        <Button onClick={generatePassword} className="w-full gap-2 font-mono">
          <RefreshCw className="w-4 h-4" />
          GENERATE NEW
        </Button>

        <div className="text-[10px] text-muted-foreground font-mono text-center">
          Entropy: ~{Math.round(length * Math.log2((options.uppercase ? 26 : 0) + (options.lowercase ? 26 : 0) + (options.numbers ? 10 : 0) + (options.symbols ? 14 : 0)))} bits
        </div>
      </div>
    </div>
  );
}
