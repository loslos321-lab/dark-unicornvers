import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

const PUBLIC_ROOM = "vector-crypto-public-lobby";

export default function PublicChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [username] = useState(() => "anon-" + Math.random().toString(36).slice(2, 6));
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase.channel(`public-${PUBLIC_ROOM}`, {
      config: { broadcast: { self: true } },
    });
    channel
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as ChatMessage]);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
        }
      });
    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim() || !channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "chat",
      payload: {
        id: crypto.randomUUID(),
        sender: username,
        text: text.trim(),
        timestamp: Date.now(),
      },
    });
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary font-mono flex items-center gap-2">
          <Globe className="w-4 h-4" /> PUBLIC LOBBY
        </h2>
        <span className={`text-xs font-mono ${connected ? "text-primary" : "text-muted-foreground"}`}>
          {connected ? "● Live" : "Connecting..."}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <Globe className="w-8 h-8 text-primary/30 mx-auto" />
            <p className="text-xs text-muted-foreground font-mono">
              No messages yet. Say hello!
            </p>
            <p className="text-xs text-muted-foreground/60">
              Messages are live and ephemeral — visible to everyone online.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded p-2 border ${
              m.sender === username
                ? "bg-primary/10 border-primary/20 ml-6"
                : "bg-secondary/50 border-border mr-6"
            }`}
          >
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-xs font-mono text-accent">{m.sender}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs text-foreground break-words">{m.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2 font-mono">
          Chatting as <span className="text-primary">{username}</span>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="sm" onClick={sendMessage} disabled={!text.trim()}>
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
