import { Lock, Unlock, Download, Upload, Users, Globe, Info, DoorOpen, Sliders, Shield, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Shield,
    title: "What is Vector Crypto?",
    desc: "A real-time encrypted communication tool with steganography. Send secret messages, hide data in images, and chat in public or private rooms — all in your browser.",
    highlight: true,
  },
  {
    icon: Lock,
    title: "1. Encrypt a Message",
    desc: "Go to the CRYPTO tab → enter your message and a password → hit Encrypt. You'll get an encrypted payload you can share.",
  },
  {
    icon: Unlock,
    title: "2. Decrypt a Message",
    desc: "Switch to Decode mode → paste the encrypted payload → enter the same password → hit Decrypt to reveal the message.",
  },
  {
    icon: Download,
    title: "3. Hide in Image (Export)",
    desc: "After encrypting, click 'Export to Image' to embed the payload invisibly into the vector field background as a PNG file.",
  },
  {
    icon: Upload,
    title: "4. Extract from Image (Import)",
    desc: "Upload a PNG that has hidden data → the encrypted payload is extracted automatically → enter the password to decrypt.",
  },
  {
    icon: Users,
    title: "5. Private Crypto Rooms",
    desc: "Enter a room code in the CRYPTO tab to create a private channel. Share the code with others to exchange encrypted messages in real-time.",
  },
  {
    icon: DoorOpen,
    title: "6. Hosted Rooms",
    desc: "Go to ROOMS to create or join password-protected persistent chat rooms. Create a room, set a password, and share both with your contacts.",
  },
  {
    icon: Globe,
    title: "7. Public Lobby",
    desc: "The PUBLIC tab is an open chat room for everyone. No passwords needed — just say hello! Great for finding others to connect with.",
  },
  {
    icon: Sliders,
    title: "8. Customize the Field",
    desc: "Use the FIELD tab to tweak the animated vector background — change colors, density, speed, and glow effects.",
  },
  {
    icon: MessageSquare,
    title: "💡 Tip: Chats Stay Alive",
    desc: "Your chat messages persist as long as you keep this tab open. Switch between tabs freely without losing your conversation history.",
  },
];

export default function HowToUse() {
  return (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-primary font-mono">GETTING STARTED</h3>
      </div>
      <div className="space-y-2">
        {steps.map((s) => (
          <div
            key={s.title}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              "highlight" in s && s.highlight
                ? "bg-primary/10 border-primary/30"
                : "bg-secondary/30 border-border hover:border-primary/20"
            }`}
          >
            <s.icon className={`w-4 h-4 mt-0.5 shrink-0 ${
              "highlight" in s && s.highlight ? "text-primary" : "text-accent"
            }`} />
            <div>
              <span className="text-xs font-semibold text-foreground">{s.title}</span>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 pb-4">
        <p className="text-xs text-muted-foreground/70 text-center font-mono">
          AES-256-GCM · End-to-End · Zero Storage
        </p>
      </div>
    </div>
  );
}
