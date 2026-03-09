import { Lock, Unlock, Download, Upload, Users, Globe, Info } from "lucide-react";

const steps = [
  { icon: Lock, title: "Encrypt", desc: "Type a message and password, then hit Encrypt to generate a payload." },
  { icon: Unlock, title: "Decrypt", desc: "Paste an encrypted payload with the correct password to reveal the message." },
  { icon: Download, title: "Steganography Export", desc: "Hide encrypted data inside the vector field image as a PNG download." },
  { icon: Upload, title: "Steganography Import", desc: "Upload a PNG with hidden data to extract and decrypt the payload." },
  { icon: Users, title: "Private Rooms", desc: "Join a room code to exchange encrypted messages in real-time with others." },
  { icon: Globe, title: "Public Chat", desc: "Use the public lobby to chat openly with everyone online — no password needed." },
];

export default function HowToUse() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-semibold text-primary font-mono">HOW TO USE</h3>
      </div>
      <div className="space-y-2">
        {steps.map((s) => (
          <div key={s.title} className="flex items-start gap-3 p-2 rounded bg-secondary/30 border border-border">
            <s.icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-foreground">{s.title}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
