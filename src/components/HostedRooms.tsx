import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DoorOpen, Plus, Lock, Send, LogOut, RefreshCw, Users, Copy, Check } from "lucide-react";

interface Room {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export default function HostedRooms() {
  const [view, setView] = useState<"list" | "create" | "chat">("list");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joiningRoom, setJoiningRoom] = useState<Room | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [username] = useState(() => "user-" + Math.random().toString(36).slice(2, 6));
  const [copied, setCopied] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchRooms();
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    // Use the public_rooms view that excludes password_hash
    const { data, error } = await supabase.from("public_rooms")
      .select("id, name, created_by, created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      console.error("Fetch rooms error:", error);
      toast.error(`Failed to load rooms: ${error.message}`);
      return;
    }
    setRooms((data as Room[]) || []);
  };

  const createRoom = async () => {
    if (!roomName.trim() || !roomPassword.trim()) {
      toast.error("Room name and password are required");
      return;
    }
    // Hash password server-side with bcrypt
    const { data: hash, error: hashError } = await supabase.rpc("hash_password_bcrypt", { password: roomPassword });
    if (hashError || !hash) {
      toast.error("Failed to create room");
      return;
    }
    const { error } = await supabase.from("hosted_rooms").insert({
      name: roomName.trim(),
      password_hash: hash,
      created_by: username,
    });
    if (error) {
      console.error("Create room error:", error);
      if (error.code === "23505") toast.error("Room name already taken");
      else toast.error(`Failed to create room: ${error.message}`);
      return;
    }
    toast.success(`Room "${roomName}" created`);
    setRoomName("");
    setRoomPassword("");
    setView("list");
    fetchRooms();
  };

  const attemptJoin = async () => {
    if (!joiningRoom || !joinPassword.trim()) {
      toast.error("Enter room password");
      return;
    }
    // Verify password server-side via bcrypt RPC
    const { data: isValid, error: rpcError } = await supabase.rpc("check_room_password", {
      room_id: joiningRoom.id,
      attempt: joinPassword,
    });
    if (rpcError || !isValid) {
      toast.error("Wrong password");
      return;
    }
    // Join the realtime channel
    const channel = supabase.channel(`hosted-${joiningRoom.id}`, {
      config: { broadcast: { self: true } },
    });
    channel
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as ChatMessage]);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setActiveRoom(joiningRoom);
          setView("chat");
          setJoiningRoom(null);
          setJoinPassword("");
          toast.success(`Joined "${joiningRoom.name}"`);
        }
      });
    channelRef.current = channel;
  };

  const leaveRoom = () => {
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    setActiveRoom(null);
    setMessages([]);
    setView("list");
    fetchRooms();
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !channelRef.current) return;
    await channelRef.current.send({
      type: "broadcast",
      event: "chat",
      payload: {
        id: crypto.randomUUID(),
        sender: username,
        text: chatInput.trim(),
        timestamp: Date.now(),
      },
    });
    setChatInput("");
  };

  const copyRoomName = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Chat view
  if (view === "chat" && activeRoom) {
    return (
      <div className="h-full flex flex-col bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-mono font-semibold text-foreground truncate">
              {activeRoom.name}
            </span>
          </div>
          <Button size="sm" variant="ghost" onClick={leaveRoom}>
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="px-3 py-1.5 border-b border-border bg-secondary/30">
          <span className="text-xs text-primary font-mono">● {username}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8 font-mono">
              No messages yet. Say something!
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === username ? "items-end" : "items-start"
              }`}
            >
              <span className="text-xs text-muted-foreground font-mono mb-0.5">
                {m.sender === username ? "you" : m.sender}
              </span>
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-mono max-w-[85%] break-words ${
                  m.sender === username
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground border border-border"
                }`}
              >
                {m.text}
              </div>
              <span className="text-xs text-muted-foreground/50 mt-0.5">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 border-t border-border flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-input border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="sm" onClick={sendMessage} disabled={!chatInput.trim()}>
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Join password prompt
  if (joiningRoom) {
    return (
      <div className="h-full flex flex-col bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground font-mono">
            JOIN: {joiningRoom.name}
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            This room requires a password to enter.
          </p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Room Password</label>
            <input
              type="password"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attemptJoin()}
              placeholder="Enter room password..."
              className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={attemptJoin} className="flex-1">
              <DoorOpen className="w-3 h-3 mr-1" /> Enter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setJoiningRoom(null);
                setJoinPassword("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Create room view
  if (view === "create") {
    return (
      <div className="h-full flex flex-col bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground font-mono">CREATE ROOM</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Room Name</label>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="my-secret-room"
              maxLength={64}
              className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Entry Password</label>
            <input
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              placeholder="Set a password for this room..."
              className="w-full bg-input border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share the room name and password with others so they can join.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={createRoom} className="flex-1">
              <Plus className="w-3 h-3 mr-1" /> Create
            </Button>
            <Button size="sm" variant="outline" onClick={() => setView("list")}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Room list view
  return (
    <div className="h-full flex flex-col bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground font-mono">HOSTED ROOMS</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={fetchRooms} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={() => setView("create")}>
            <Plus className="w-3 h-3 mr-1" /> New
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {rooms.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8 font-mono">
            {loading ? "Loading..." : "No rooms yet. Create one!"}
          </p>
        )}
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-secondary/30 border border-border rounded-lg p-3 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-primary shrink-0" />
                <span className="text-xs font-mono font-semibold text-foreground truncate">
                  {room.name}
                </span>
                <button
                  onClick={() => copyRoomName(room.name)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                by {room.created_by} · {new Date(room.created_at).toLocaleDateString()}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setJoiningRoom(room)}>
              <DoorOpen className="w-3 h-3 mr-1" /> Join
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
