import { 
  Shield, Lock, Key, FileLock, FileText, QrCode, 
  Target, Brain, BookOpen, Atom, BrainCircuit, 
  Gauge, Search, Split, Clipboard, Trophy, Sparkles,
  Wrench, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

// Tools organized by category
const categories = [
  {
    id: "learning",
    title: "Learning & Defense",
    description: "Learn to protect yourself from cyber threats",
    color: "emerald",
    tools: [
      {
        key: "security-education",
        title: "Security Education",
        description: "Learn about Discord token grabbers, phishing attacks, and social engineering.",
        icon: BookOpen,
        path: "/security-education",
        ready: true,
        badge: "Education",
      },
      {
        key: "phishing-detective",
        title: "Phishing Detective",
        description: "Interactive game: Spot fake emails, websites and social engineering attempts.",
        icon: Target,
        path: "/tools/phishing-detective",
        ready: true,
        badge: "Game",
      },
      {
        key: "social-engineering-quiz",
        title: "Social Engineering Defense",
        description: "Detect manipulation attempts and CEO fraud in dialog simulations.",
        icon: BrainCircuit,
        path: "/tools/social-engineering-quiz",
        ready: true,
        badge: "Quiz",
      },
    ]
  },
  {
    id: "crypto",
    title: "Cryptography",
    description: "Encryption, hashing, and secure communication",
    color: "blue",
    tools: [
      {
        key: "vector-crypto",
        title: "Vector Crypto",
        description: "End-to-end encrypted messaging with one-time secret links.",
        icon: Lock,
        path: "/vector-crypto",
        ready: true,
        badge: "Messaging",
      },
      {
        key: "qr-crypto",
        title: "QR Code Crypto",
        description: "Convert encrypted messages to QR codes for offline transfer.",
        icon: QrCode,
        path: "/tools/qr-crypto",
        ready: true,
        badge: "Offline",
      },
      {
        key: "secret-sharing",
        title: "Secret Sharing",
        description: "Split secrets using threshold cryptography (Shamir's Secret Sharing).",
        icon: Split,
        path: "/tools/secret-sharing",
        ready: true,
        badge: "Advanced",
      },
    ]
  },
  {
    id: "passwords",
    title: "Password Tools",
    description: "Generate, check, and manage passwords securely",
    color: "amber",
    tools: [
      {
        key: "password-generator",
        title: "Password Generator",
        description: "Cryptographically secure passwords with custom character sets.",
        icon: Key,
        path: "/tools/password-generator",
        ready: true,
        badge: "Essential",
      },
      {
        key: "entropy",
        title: "Entropy Checker",
        description: "Analyze password strength and calculate bits of entropy.",
        icon: Gauge,
        path: "/tools/entropy",
        ready: true,
        badge: "Analysis",
      },
      {
        key: "breach-checker",
        title: "Breach Checker",
        description: "Check if your password has been leaked using HaveIBeenPwned.",
        icon: Search,
        path: "/tools/breach-checker",
        ready: true,
        badge: "Security",
      },
    ]
  },
  {
    id: "files",
    title: "File & Data",
    description: "Encrypt files and notes locally",
    color: "purple",
    tools: [
      {
        key: "file-vault",
        title: "File Vault",
        description: "Encrypt and decrypt files using AES-256-GCM directly in your browser.",
        icon: FileLock,
        path: "/tools/file-vault",
        ready: true,
        badge: "Encryption",
      },
      {
        key: "secure-notes",
        title: "Secure Notes",
        description: "Encrypted notes stored locally with master password protection.",
        icon: FileText,
        path: "/tools/secure-notes",
        ready: true,
        badge: "Privacy",
      },
      {
        key: "secure-clipboard",
        title: "Secure Clipboard",
        description: "Self-destructing encrypted messages with time-limited links.",
        icon: Clipboard,
        path: "/tools/secure-clipboard",
        ready: true,
        badge: "Sharing",
      },
    ]
  },
  {
    id: "ai",
    title: "AI & Advanced",
    description: "AI-powered security tools and experiments",
    color: "rose",
    tools: [
      {
        key: "browser-agent",
        title: "Dark Unicorn Agent",
        description: "Local AI pentesting assistant with Kali tools. Runs 100% in browser.",
        icon: Brain,
        path: "/browser-agent",
        ready: false,
        badge: "AI",
      },
      {
        key: "crypto-speedrun",
        title: "Crypto Speedrun",
        description: "Race against time to crack passwords and solve crypto puzzles.",
        icon: Trophy,
        path: "/tools/crypto-speedrun",
        ready: true,
        badge: "Challenge",
      },
      {
        key: "physics-sandbox",
        title: "Physics Sandbox",
        description: "Viral physics simulator with interactive elements.",
        icon: Atom,
        path: "/tools/physics-sandbox",
        ready: false,
        badge: "Fun",
      },
    ]
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-950/30", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-900/50 text-emerald-300" },
  blue: { bg: "bg-blue-950/30", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-900/50 text-blue-300" },
  amber: { bg: "bg-amber-950/30", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-900/50 text-amber-300" },
  purple: { bg: "bg-purple-950/30", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-900/50 text-purple-300" },
  rose: { bg: "bg-rose-950/30", border: "border-rose-500/30", text: "text-rose-400", badge: "bg-rose-900/50 text-rose-300" },
};

function PurchaseButton() {
  return (
    <Button disabled={true} className="font-mono shrink-0 opacity-50">
      Coming Soon
    </Button>
  );
}

function ToolCard({ tool }: { tool: any }) {
  const content = (
    <div
      className={`group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 h-full flex flex-col ${
        tool.ready
          ? "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer"
          : "opacity-60 cursor-not-allowed grayscale"
      }`}
    >
      {/* Badge */}
      <div className="absolute top-3 right-3">
        <Badge variant="secondary" className="text-[10px] font-mono">
          {tool.badge}
        </Badge>
      </div>

      <div className="flex items-start gap-4 mb-3">
        <div className="p-2.5 rounded-lg bg-secondary">
          <tool.icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <h3 className="font-mono font-semibold text-foreground text-sm tracking-wide truncate">
            {tool.title}
          </h3>
        </div>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed flex-1">
        {tool.description}
      </p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
        {tool.ready ? (
          <>
            <span className="text-primary text-xs font-mono opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1">
              Open <ChevronRight className="w-3 h-3" />
            </span>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </>
        ) : (
          <>
            <span className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider">
              In Development
            </span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </>
        )}
      </div>
    </div>
  );

  if (!tool.ready) return content;

  return (
    <Link to={tool.path} className="block">
      {content}
    </Link>
  );
}

function CategorySection({ category }: { category: typeof categories[0] }) {
  const colors = colorClasses[category.color];
  
  return (
    <section className="mb-10">
      {/* Category Header */}
      <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border} mb-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-1 h-6 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
          <div>
            <h2 className={`font-mono font-bold ${colors.text} text-base`}>
              {category.title}
            </h2>
            <p className="text-slate-500 text-xs font-mono mt-0.5">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.tools.map((tool) => (
          <ToolCard key={tool.key} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export default function ToolsHub() {
  const readyTools = categories.flatMap(c => c.tools).filter(t => t.ready).length;
  const totalTools = categories.flatMap(c => c.tools).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-5 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-foreground tracking-wide">
              SECURITY TOOLKIT
            </h1>
            <p className="text-slate-500 text-[10px] font-mono">
              {readyTools} of {totalTools} tools ready
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-[10px] hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
            All client-side
          </Badge>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        {/* Intro */}
        <div className="mb-10">
          <h2 className="text-2xl font-mono font-bold text-foreground mb-2">
            Privacy-First Security Tools
          </h2>
          <p className="text-slate-400 font-mono text-sm max-w-2xl leading-relaxed">
            A curated collection of client-side security tools. 
            Everything runs in your browser — your data never leaves your device unencrypted.
          </p>
        </div>

        {/* Categories */}
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}

        {/* Premium CTA */}
        <div className="mt-12 p-6 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-mono font-semibold text-foreground">
                  Unlock Premium Tools
                </h3>
              </div>
              <p className="text-slate-400 text-xs font-mono max-w-lg">
                Support development and get access to advanced features, 
                priority updates, and exclusive tools. One-time payment.
              </p>
            </div>
            <PurchaseButton />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 font-mono text-[11px]">
            All tools run client-side. No data leaves your browser unencrypted.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Open Source
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Zero Tracking
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
