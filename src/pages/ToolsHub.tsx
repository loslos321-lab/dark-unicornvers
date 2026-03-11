import { Shield, Lock, Wrench, ArrowRight, Sparkles, Key, FileLock, FileText, QrCode, Gauge, Search, Split, Clipboard, Gamepad2, Trophy, BrainCircuit, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const tools = [
  {
    key: "vector-crypto",
    title: "Vector Crypto",
    description: "End-to-end encrypted messaging, one-time secret links, and hosted rooms.",
    icon: Lock,
    path: "/vector-crypto",
    ready: true,
  },
  {
    key: "password-generator",
    title: "Password Generator",
    description: "Generate cryptographically secure passwords with custom length and character sets.",
    icon: Key,
    path: "/tools/password-generator",
    ready: true,
  },
  {
    key: "file-vault",
    title: "File Vault",
    description: "Encrypt and decrypt files directly in your browser using AES-256-GCM.",
    icon: FileLock,
    path: "/tools/file-vault",
    ready: true,
  },
  {
    key: "secure-notes",
    title: "Secure Notes",
    description: "Encrypted notes stored locally. Protected with your master password.",
    icon: FileText,
    path: "/tools/secure-notes",
    ready: true,
  },
  {
    key: "qr-crypto",
    title: "QR Code Crypto",
    description: "Convert encrypted messages to QR codes for offline transfer.",
    icon: QrCode,
    path: "/tools/qr-crypto",
    ready: true,
  },
  {
    key: "entropy",
    title: "Entropy Checker",
    description: "Analyze password strength and calculate bits of entropy.",
    icon: Gauge,
    path: "/tools/entropy",
    ready: true,
  },
{
    key: "breach-checker",
    title: "Breach Checker",
    description: "Check if your password has been leaked in data breaches using HaveIBeenPwned.",
    icon: Shield,
    path: "/tools/breach-checker",
    ready: true,
  },
  {
    key: "secret-sharing",
    title: "Secret Sharing",
    description: "Split secrets into multiple shares. Reconstruct with threshold cryptography.",
    icon: Split,
    path: "/tools/secret-sharing",
    ready: true,
  },
  {
    key: "secure-clipboard",
    title: "Secure Clipboard",
    description: "Self-destructing encrypted messages with time-limited secure links.",
    icon: Clipboard,
    path: "/tools/secure-clipboard",
    ready: true,
  },
// ... bestehende tools ...

{
  key: "phishing-detective",
  title: "Phishing Detective",
  description: "Interactive game: Spot the fake emails, websites and social engineering attempts. Test your security awareness skills in realistic scenarios.",
  icon: Target,
  path: "/tools/phishing-detective",
  ready: false,
},
{
  key: "crypto-speedrun",
  title: "Crypto Speedrun",
  description: "Race against time to crack passwords, decrypt messages and solve cryptographic puzzles. Learn why strong passwords matter.",
  icon: Zap,  // Alternativ: Trophy oder Timer
  path: "/tools/crypto-speedrun",
  ready: false,
},
{
  key: "social-engineering-quiz",
  title: "Social Engineering Defense",
  description: "Interactive dialog simulator: Detect manipulation attempts, CEO fraud and support scams. Save the company before it's too late.",
  icon: BrainCircuit,  // Alternativ: MessageCircle oder ShieldAlert
  path: "/tools/social-engineering-quiz",
  ready: false,
},
  ];

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-5 flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-bold font-mono text-foreground text-glow tracking-wide">
          SECURITY TOOLKIT
        </h1>
      </header>

      {/* Hero */}
      <section className="px-6 pt-12 pb-6 max-w-3xl">
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">
          A growing collection of privacy-first, client-side security tools.
          <br />
          Everything runs in your browser — nothing leaves your device unencrypted.
        </p>
      </section>

      {/* Tools grid */}
      <main className="flex-1 px-6 pb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
          {tools.map((tool) => (
            <ToolCard key={tool.key} tool={tool} />
          ))}
        </div>

        {/* Premium CTA */}
        <div className="mt-8 max-w-5xl rounded-lg border border-primary/30 bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-mono font-semibold text-foreground text-sm">Unlock Premium Tools</h3>
            </div>
            <p className="text-muted-foreground text-xs font-mono">
              One-time payment of $0.99 — get access to all current and future premium tools.
            </p>
          </div>
          <PurchaseButton />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4">
        <p className="text-muted-foreground font-mono text-[11px]">
          All tools run client-side. Your data never leaves your browser unencrypted.
        </p>
      </footer>
    </div>
  );
}

function PurchaseButton() {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error("Payment failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={true} className="font-mono shrink-0 opacity-50">
  Coming Soon
    </Button>
  );
}

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  const content = (
    <div
      className={`group relative rounded-lg border border-border bg-card p-6 transition-all duration-200 h-full flex flex-col ${
        tool.ready
          ? "hover:border-primary/50 hover:glow-primary cursor-pointer"
          : "opacity-50 cursor-default"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-md bg-secondary">
          <tool.icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-mono font-semibold text-foreground text-sm tracking-wide">
          {tool.title}
        </h2>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed flex-1">
        {tool.description}
      </p>

      {tool.ready && (
        <div className="mt-4 flex items-center gap-1 text-primary text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ArrowRight className="w-3 h-3" />
        </div>
      )}

      {!tool.ready && (
        <div className="mt-4 text-muted-foreground text-[10px] font-mono uppercase tracking-widest">
          Coming soon
        </div>
      )}
    </div>
  );

  if (!tool.ready) return content;

  return (
    <Link to={tool.path} className="no-underline">
      {content}
    </Link>
  );
}
