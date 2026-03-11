import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Send, Download, Upload, Hash, Users, Copy, Check } from "lucide-react";
import { encryptMessage, decryptMessage, embedInCanvas, extractFromImage } from "@/lib/crypto";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: string;
  encrypted: string;
  timestamp: number;
}

export default function CryptoPanel({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement> }) {
  const [mode, setMode] = useState<"send" | "decode">("send");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [username] = useState(() => "agent-" + Math.random().toString(36).slice(2, 6));
  const [messages, setMessages] = useState<Message[]>([]);
  const [decryptedText, setDecryptedText] = useState("");
  const [decryptInput, setDecryptInput] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinRoom = () => {
    if (!roomCode.trim()) { toast.error("Enter a room code"); return; }
    const channel = supabase.channel(`crypto-room-${roomCode}`, {
      config: { broadcast: { self: true } },
    });
    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages(prev => [...prev, payload as Message]);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setJoined(true);
          toast.success(`Joined room: ${roomCode}`);
        }
      });
    channelRef.current = channel;
  };

  const leaveRoom = () => {
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    setJoined(false);
    setMessages([]);
  };

  const sendEncrypted = async () => {
    if (!message.trim() || !password.trim()) {
      toast.error("Enter message and password");
      return;
    }
    try {
      const encrypted = await encryptMessage(message, password);
      if (joined && channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "message",
          payload: {
            id: crypto.randomUUID(),
            sender: username,
            encrypted,
            timestamp: Date.now(),
          },
        });
        setMessage("");
        toast.success("Encrypted message sent");
      } else {
        setDecryptInput(encrypted);
        setMode("decode");
        toast.success("Message encrypted — paste or share the payload");
      }
    } catch {
      toast.error("Encryption failed");
    }
  };

  const handleDecrypt = async () => {
    if (!decryptInput.trim() || !decryptPassword.trim()) {
      toast.error("Enter payload and password");
      return;
    }
    try {
      const text = await decryptMessage(decryptInput, decryptPassword);
      setDecryptedText(text);
      toast.success("Decrypted successfully");
    } catch {
      toast.error("Decryption failed — wrong password or corrupted data");
      setDecryptedText("");
    }
  };

  const exportSteganographic = async () => {
    if (!canvasRef.current || !message.trim() || !password.trim()) {
      toast.error("Enter message and password, then export");
      return;
    }
    try {
      const encrypted = await encryptMessage(message, password);
      const dataUrl = embedInCanvas(canvasRef.current, encrypted);
      const link = document.createElement("a");
      link.download = `crypto-field-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Encrypted image exported");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  };

  const importSteganographic = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      try {
        const extracted = extractFromImage(img);
        setDecryptInput(extracted);
        setMode("decode");
        toast.success("Payload extracted from image");
      } catch {
        toast.error("No valid data found in image");
      }
    };
    img.src = URL.createObjectURL(file);
    e.target.value = "";
  };

  const copyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const decryptRoomMessage = async (encrypted: string) => {
    if (!password.trim()) {
      toast.error("Enter password to decrypt room messages");
      return;
    }
    try {
      const text = await decryptMessage(encrypted, password);
      toast.success("Decrypted: " + text);
    } catch {
      toast.error("Wrong password for this message");
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-accent font-mono flex items-center gap-2">
          <Hash className="w-4 h-4" /> CRYPTO TRANSFER
        </h2>
      </div>

      {/* Room */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Room</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="room-code"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value)}
            disabled={joined}
            className="flex-1 bg-input border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="sm" variant={joined ? "destructive" : "default"} onClick={joined ? leaveRoom : joinRoom}>
            {joined ? "Leave" : "Join"}
          </Button>
        </div>
        {joined && (
          <p className="text-xs text-primary mt-1 font-mono">
            ● Connected as {username}
          </p>
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setMode("send")}
          className={`flex-1 py-2 text-xs font-mono transition-colors ${
            mode === "send" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="w-3 h-3 inline mr-1" /> ENCRYPT
        </button>
        <button
          onClick={() => setMode("decode")}
          className={`flex-1 py-2 text-xs font-mono transition-colors ${
            mode === "decode" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Unlock className="w-3 h-3 inline mr-1" /> DECRYPT
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {mode === "send" ? (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter secret message..."
                maxLength={50000}
                className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Encryption key..."
                className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={sendEncrypted} className="w-full">
                <Send className="w-3 h-3 mr-1" />
                {joined ? "Send to Room" : "Encrypt"}
              </Button>
              <Button size="sm" variant="outline" onClick={exportSteganographic} className="w-full">
                <Download className="w-3 h-3 mr-1" /> Export as Image
              </Button>
            </div>

            {/* Room messages */}
            {joined && messages.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground mb-2 block">Room Messages</span>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {messages.map(m => (
                    <div key={m.id} className="bg-secondary/50 rounded p-2 border border-border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-mono text-primary">{m.sender}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(m.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate">{m.encrypted.slice(0, 40)}...</p>
                      <button
                        onClick={() => decryptRoomMessage(m.encrypted)}
                        className="text-xs text-accent hover:underline mt-1"
                      >
                        Decrypt
                      </button>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Encrypted Payload</label>
              <textarea
                value={decryptInput}
                onChange={e => setDecryptInput(e.target.value)}
                placeholder="Paste encrypted payload..."
                className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
              />
              {decryptInput && (
                <button onClick={() => copyPayload(decryptInput)} className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy payload"}
                </button>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Password</label>
              <input
                type="password"
                value={decryptPassword}
                onChange={e => setDecryptPassword(e.target.value)}
                placeholder="Decryption key..."
                className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={handleDecrypt} className="w-full">
                <Unlock className="w-3 h-3 mr-1" /> Decrypt
              </Button>
              <Button size="sm" variant="outline" onClick={importSteganographic} className="w-full">
                <Upload className="w-3 h-3 mr-1" /> Import from Image
              </Button>
              <input ref={fileInputRef} type="file" accept="image/png" onChange={handleFileUpload} className="hidden" />
            </div>
            {decryptedText && (
              <div className="bg-secondary/50 rounded p-3 border border-primary/30 glow-primary">
                <span className="text-xs text-primary block mb-1 font-mono">DECRYPTED:</span>
                <p className="text-sm text-foreground font-mono break-all">{decryptedText}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
