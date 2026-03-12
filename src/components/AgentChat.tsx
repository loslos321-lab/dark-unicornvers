import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Trash2 } from 'lucide-react';

interface AgentChatProps {
  messages: Array<{ role: string; content: string }>;
  loading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onClear: () => void;
}

export const AgentChat = ({
  messages,
  loading,
  error,
  onSendMessage,
  onClear
}: AgentChatProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const maxLength = 500;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const message = inputRef.current?.value.trim();
    if (message && message.length > 0 && !loading) {
      onSendMessage(message);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-96 bg-slate-950 border border-cyan-500 border-opacity-30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500 border-opacity-20 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-mono font-semibold text-cyan-400">OpenClaw Chat</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          disabled={loading || messages.length === 0}
          className="text-red-400 hover:text-red-300 hover:bg-red-950"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm font-mono">
              <div className="mb-2">Welcome to OpenClaw</div>
              <div className="text-xs">100% Privacy. 100% Local. 100% Yours.</div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-xs font-mono text-cyan-400 opacity-70">
                  [{msg.role.toUpperCase()}]
                </div>
                <div
                  className={`text-sm px-3 py-2 rounded-lg max-w-xs ${
                    msg.role === 'user'
                      ? 'bg-cyan-950 bg-opacity-50 text-cyan-100 ml-auto'
                      : 'bg-lime-950 bg-opacity-30 text-lime-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 opacity-70 font-mono">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-950 bg-opacity-50 border border-red-500 border-opacity-50 rounded px-3 py-2 text-xs text-red-200 font-mono">
              ⚠ {error}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-cyan-500 border-opacity-20 bg-slate-900 bg-opacity-50 p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Type your question... (Max 500 chars)"
            onKeyDown={handleKeyDown}
            disabled={loading}
            maxLength={maxLength}
            className="bg-slate-800 border-cyan-500 border-opacity-30 text-cyan-100 placeholder:text-slate-500 focus:border-cyan-400 text-sm font-mono"
          />
          <Button
            onClick={handleSend}
            disabled={loading}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {inputRef.current?.value.length || 0} / {maxLength}
        </div>
      </div>
    </div>
  );
};
