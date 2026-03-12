import { 
  Shield, Lock, Key, FileLock, FileText, QrCode, 
  Target, Brain, BookOpen, Atom, BrainCircuit, 
  Gauge, Search, Split, Clipboard, Trophy, Sparkles,
  ChevronRight, Zap, Terminal, Gamepad2
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
    id: "games",
    title: "GAMES & CHALLENGES",
    description: "Learn security through play",
    neon: "pink",
    tools: [
      {
        key: "password-game",
        title: "The Password Game",
        description: "Create a password with increasingly absurd requirements. Can you reach rule 19?",
        icon: Gamepad2,
        path: "/tools/password-game",
        ready: true,
        badge: "HARD",
      },
      {
        key: "phishing-detective",
        title: "Phishing Detective",
        description: "Spot fake emails, websites and social engineering attempts.",
        icon: Target,
        path: "/tools/phishing-detective",
        ready: true,
        badge: "GAME",
      },
      {
        key: "crypto-speedrun",
        title: "Crypto Speedrun",
        description: "Race against time to crack passwords and solve crypto puzzles.",
        icon: Trophy,
        path: "/tools/crypto-speedrun",
        ready: true,
        badge: "CHALLENGE",
      },
    ]
  },
  {
    id: "learning",
    title: "LEARNING & DEFENSE",
    description: "Master the art of cyber defense",
    neon: "cyan",
    tools: [
      {
        key: "security-education",
        title: "Security Education",
        description: "Learn about token grabbers, phishing, and social engineering attacks.",
        icon: BookOpen,
        path: "/security-education",
        ready: true,
        badge: "EDU",
      },
      {
        key: "social-engineering-quiz",
        title: "Social Engineering Defense",
        description: "Detect manipulation and CEO fraud in realistic simulations.",
        icon: BrainCircuit,
        path: "/tools/social-engineering-quiz",
        ready: true,
        badge: "QUIZ",
      },
    ]
  },
  {
    id: "crypto",
    title: "CRYPTOGRAPHY",
    description: "Military-grade encryption tools",
    neon: "pink",
    tools: [
      {
        key: "vector-crypto",
        title: "Vector Crypto",
        description: "End-to-end encrypted messaging with one-time secret links.",
        icon: Lock,
        path: "/vector-crypto",
        ready: true,
        badge: "MESSAGING",
      },
      {
        key: "qr-crypto",
        title: "QR Code Crypto",
        description: "Offline encrypted message transfer via QR codes.",
        icon: QrCode,
        path: "/tools/qr-crypto",
        ready: true,
        badge: "OFFLINE",
      },
      {
        key: "secret-sharing",
        title: "Secret Sharing",
        description: "Shamir's Secret Sharing - split secrets with cryptography.",
        icon: Split,
        path: "/tools/secret-sharing",
        ready: true,
        badge: "ADVANCED",
      },
    ]
  },
  {
    id: "passwords",
    title: "PASSWORD ARSENAL",
    description: "Generate and analyze passwords",
    neon: "green",
    tools: [
      {
        key: "password-generator",
        title: "Password Generator",
        description: "Cryptographically secure passwords with custom entropy.",
        icon: Key,
        path: "/tools/password-generator",
        ready: true,
        badge: "ESSENTIAL",
      },
      {
        key: "hash-lab",
        title: "Hash Lab",
        description: "Identify hash types, crack with rainbow tables, and brute force simulator.",
        icon: Zap,
        path: "/tools/hash-lab",
        ready: true,
        badge: "CRACKING",
      },
      {
        key: "entropy",
        title: "Entropy Analyzer",
        description: "Calculate password strength in bits of entropy.",
        icon: Gauge,
        path: "/tools/entropy",
        ready: true,
        badge: "ANALYSIS",
      },
      {
        key: "breach-checker",
        title: "Breach Checker",
        description: "Check if your password exists in known data breaches.",
        icon: Search,
        path: "/tools/breach-checker",
        ready: true,
        badge: "SECURITY",
      },
    ]
  },
  {
    id: "files",
    title: "DATA VAULT",
    description: "Encrypt files and sensitive data",
    neon: "yellow",
    tools: [
      {
        key: "file-vault",
        title: "File Vault",
        description: "AES-256-GCM file encryption directly in your browser.",
        icon: FileLock,
        path: "/tools/file-vault",
        ready: true,
        badge: "ENCRYPTION",
      },
      {
        key: "secure-notes",
        title: "Secure Notes",
        description: "Encrypted notes with master password protection.",
        icon: FileText,
        path: "/tools/secure-notes",
        ready: true,
        badge: "PRIVACY",
      },
      {
        key: "secure-clipboard",
        title: "Secure Clipboard",
        description: "Self-destructing encrypted messages with timer.",
        icon: Clipboard,
        path: "/tools/secure-clipboard",
        ready: true,
        badge: "SHARING",
      },
    ]
  },
  {
    id: "ai",
    title: "NEURAL & AI",
    description: "AI-powered security assistant",
    neon: "purple",
    tools: [
      {
        key: "browser-agent",
        title: "Dark Unicorn Agent",
        description: "Local AI pentesting assistant with Kali tools. 100% browser-based.",
        icon: Brain,
        path: "/browser-agent",
        ready: false,
        badge: "AI",
      },
      {
        key: "crypto-speedrun",
        title: "Crypto Speedrun",
        description: "Race against time to crack passwords and solve puzzles.",
        icon: Trophy,
        path: "/tools/crypto-speedrun",
        ready: true,
        badge: "CHALLENGE",
      },
      {
        key: "physics-sandbox",
        title: "Physics Sandbox",
        description: "Interactive physics simulation with viral mechanics.",
        icon: Atom,
        path: "/tools/physics-sandbox",
        ready: false,
        badge: "EXPERIMENT",
      },
    ]
  },
];

const neonColors: Record<string, { 
  text: string; 
  border: string; 
  bg: string; 
  glow: string;
  badge: string;
}> = {
  cyan: { 
    text: "text-cyan-400", 
    border: "border-cyan-500/50", 
    bg: "bg-cyan-950/30", 
    glow: "shadow-cyan-500/20",
    badge: "bg-cyan-900/60 text-cyan-300 border-cyan-500/30"
  },
  pink: { 
    text: "text-pink-400", 
    border: "border-pink-500/50", 
    bg: "bg-pink-950/30", 
    glow: "shadow-pink-500/20",
    badge: "bg-pink-900/60 text-pink-300 border-pink-500/30"
  },
  green: { 
    text: "text-green-400", 
    border: "border-green-500/50", 
    bg: "bg-green-950/30", 
    glow: "shadow-green-500/20",
    badge: "bg-green-900/60 text-green-300 border-green-500/30"
  },
  yellow: { 
    text: "text-yellow-400", 
    border: "border-yellow-500/50", 
    bg: "bg-yellow-950/30", 
    glow: "shadow-yellow-500/20",
    badge: "bg-yellow-900/60 text-yellow-300 border-yellow-500/30"
  },
  purple: { 
    text: "text-purple-400", 
    border: "border-purple-500/50", 
    bg: "bg-purple-950/30", 
    glow: "shadow-purple-500/20",
    badge: "bg-purple-900/60 text-purple-300 border-purple-500/30"
  },
};

function ToolCard({ tool, neonColor }: { tool: any; neonColor: string }) {
  const colors = neonColors[neonColor];
  
  const content = (
    <div
      className={`group relative rounded-lg border border-violet-800/50 bg-violet-950/20 p-5 transition-all duration-300 h-full flex flex-col backdrop-blur-sm ${
        tool.ready
          ? `hover:border-${neonColor}-500/70 hover:shadow-lg ${colors.glow} hover:-translate-y-1 cursor-pointer hover:bg-violet-900/20`
          : "opacity-50 cursor-not-allowed grayscale"
      }`}
    >
      {/* Neon glow effect on hover */}
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
      
      {/* Badge */}
      <div className="absolute top-3 right-3">
        <Badge variant="outline" className={`text-[9px] font-mono tracking-wider ${colors.badge}`}>
          {tool.badge}
        </Badge>
      </div>

      <div className="flex items-start gap-4 mb-3">
        <div className={`p-2.5 rounded-lg bg-violet-900/50 border border-violet-700/50 group-hover:border-${neonColor}-500/50 group-hover:shadow-[0_0_15px_rgba(var(--tw-colors-${neonColor}-500),0.3)] transition-all duration-300`}>
          <tool.icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <h3 className="font-mono font-bold text-violet-100 text-sm tracking-wide truncate group-hover:text-white transition-colors">
            {tool.title}
          </h3>
        </div>
      </div>

      <p className="text-violet-300/70 text-xs leading-relaxed flex-1 font-mono">
        {tool.description}
      </p>

      {/* Footer with neon line */}
      <div className="mt-4 pt-3 border-t border-violet-800/50 flex items-center justify-between">
        {tool.ready ? (
          <>
            <span className={`${colors.text} text-xs font-mono opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 font-bold`}>
              EXECUTE <ChevronRight className="w-3 h-3" />
            </span>
            <div className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
          </>
        ) : (
          <>
            <span className="text-violet-500 text-[10px] font-mono uppercase tracking-widest">
              BUILDING...
            </span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
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
  const colors = neonColors[category.neon];
  
  return (
    <section className="mb-12">
      {/* Category Header with neon accent */}
      <div className="flex items-center gap-4 mb-5">
        <div className={`h-8 w-1 rounded-full ${colors.text.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
        <div>
          <h2 className={`font-mono font-bold ${colors.text} text-sm tracking-[0.2em] flex items-center gap-2`}>
            <Zap className="w-4 h-4" />
            {category.title}
          </h2>
          <p className="text-violet-400/60 text-xs font-mono mt-0.5">
            {category.description}
          </p>
        </div>
        <div className={`flex-1 h-px ${colors.bg} opacity-50`} />
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.tools.map((tool) => (
          <ToolCard key={tool.key} tool={tool} neonColor={category.neon} />
        ))}
      </div>
    </section>
  );
}

export default function ToolsHub() {
  const readyTools = categories.flatMap(c => c.tools).filter(t => t.ready).length;
  const totalTools = categories.flatMap(c => c.tools).length;

  return (
    <div className="min-h-screen bg-[#0a0612] flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-[#0a0612] to-fuchsia-950/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(violet 1px, transparent 1px), linear-gradient(90deg, violet 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <header className="relative border-b border-violet-800/30 px-6 py-5 flex items-center justify-between sticky top-0 bg-[#0a0612]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-900/30 border border-violet-700/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Terminal className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-purple-300 to-fuchsia-300 tracking-wider">
              DARK UNICORN
            </h1>
            <p className="text-violet-500 text-[10px] font-mono tracking-widest uppercase">
              {readyTools} Tools Online // {totalTools - readyTools} In Development
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-violet-900/50 text-violet-300 border-violet-700/50 font-mono text-[10px] hidden sm:inline-flex shadow-[0_0_10px_rgba(139,92,246,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            Client-Side Only
          </Badge>
        </div>
      </header>

      <main className="relative flex-1 px-6 py-10 max-w-6xl mx-auto w-full">
        {/* Hero */}
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/30 border border-violet-700/50 mb-4">
            <Shield className="w-3 h-3 text-purple-400" />
            <span className="text-violet-300 text-[10px] font-mono tracking-wider">PRIVACY-FIRST SECURITY SUITE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-purple-300 to-fuchsia-300 mb-3">
            Cybersecurity Arsenal
          </h2>
          <p className="text-violet-400/70 font-mono text-sm max-w-2xl leading-relaxed">
            A collection of client-side security tools. All encryption happens in your browser — 
            <span className="text-purple-400"> your data never leaves your device</span>.
          </p>
        </div>

        {/* Categories */}
        {categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}

        {/* Premium CTA with neon glow */}
        <div className="relative mt-16 p-8 rounded-xl border border-violet-700/50 bg-gradient-to-br from-violet-950/40 to-fuchsia-950/20 overflow-hidden group">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-fuchsia-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-700" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <h3 className="font-mono font-bold text-violet-100 tracking-wider">
                  UNLOCK NEURAL PROTOCOLS
                </h3>
              </div>
              <p className="text-violet-400/70 text-xs font-mono max-w-lg">
                Support the development of Dark Unicorn and get access to advanced AI tools, 
                priority updates, and exclusive neural networks.
              </p>
            </div>
            <Button 
              disabled={true} 
              className="relative font-mono shrink-0 bg-violet-900/50 border border-violet-700/50 text-violet-300 hover:bg-violet-800/50 disabled:opacity-50"
            >
              <span className="relative z-10">COMING SOON</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-violet-800/30 px-6 py-8 mt-auto bg-[#0a0612]/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-violet-500/60 font-mono text-[11px]">
            All tools run client-side. No data leaves your browser unencrypted.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-mono text-violet-600/80">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              Open Source
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              Zero Tracking
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              Neural Core Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
