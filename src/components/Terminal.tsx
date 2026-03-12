import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Trash2 } from 'lucide-react';

interface TerminalProps {
  onExecute: (tool: string, params?: any) => Promise<any>;
  isReady: boolean;
}

export const Terminal = ({ onExecute, isReady }: TerminalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [history, setHistory] = useState<Array<{type: 'input' | 'output' | 'error', content: string, timestamp: Date}>>([
    { type: 'output', content: '🦄 Dark Unicorn Terminal v2.0\nType "help" for available commands\nInternet: ENABLED | GitHub: ENABLED | CLI: ACTIVE', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    const command = cmd.trim();
    setCommandHistory(prev => [...prev, command]);
    setHistory(prev => [...prev, { type: 'input', content: `root@darkunicorn:~# ${command}`, timestamp: new Date() }]);
    setInput('');
    setHistoryIndex(-1);

    // Parse command
    const parts = command.split(' ');
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    try {
      let result: any;
      
      switch (cmdName) {
        case 'help':
          result = `
╔════════════════════════════════════════════════════════════╗
║              🦄 DARK UNICORN TERMINAL v2.0                 ║
╠════════════════════════════════════════════════════════════╣
║ NETWORK TOOLS                                              ║
║   curl <url>        - HTTP request to any URL             ║
║   wget <url>        - Download file from URL              ║
║   nmap <target>     - Port scan simulation                ║
║   whois <domain>    - Domain lookup                       ║
║   dig <domain>      - DNS enumeration                     ║
╠════════════════════════════════════════════════════════════╣
║ GITHUB TOOLS                                               ║
║   github-clone <repo>          - Clone repo metadata      ║
║   github-raw <repo> <file>     - Fetch raw file           ║
║   install-tool <name> <url>    - Install tool from URL    ║
║   list-tools                   - Show installed tools     ║
╠════════════════════════════════════════════════════════════╣
║ CODE EXECUTION                                             ║
║   python <code>     - Execute Python code                 ║
║   node <code>       - Execute Node.js code                ║
║   bash <command>    - Execute bash command                ║
║   exec <code>       - Execute JavaScript                  ║
╠════════════════════════════════════════════════════════════╣
║ CRYPTO & HASHING                                           ║
║   hash-md5 <text>   - Generate MD5 hash                   ║
║   hash-sha256 <txt> - Generate SHA256 hash                ║
║   base64 <text>     - Base64 encode/decode                ║
║   jwt-decode <tok>  - Decode JWT token                    ║
╠════════════════════════════════════════════════════════════╣
║ SYSTEM                                                     ║
║   ls, cat, pwd, echo, ping  - Basic shell commands        ║
║   clear             - Clear terminal                      ║
║   stats             - Show session stats                  ║
║   wipe              - Clear all session data              ║
╚════════════════════════════════════════════════════════════╝`;
          break;
          
        case 'clear':
        case 'cls':
          setHistory([]);
          return;
          
        case 'ls':
          result = 'file1.txt  script.py  data.json  payload.sh  README.md';
          break;
          
        case 'pwd':
          result = '/home/darkunicorn';
          break;
          
        case 'whoami':
          result = 'root';
          break;
          
        case 'echo':
          result = args.join(' ');
          break;
          
        case 'stats':
          const stats = await onExecute('get_stats');
          result = JSON.stringify(stats, null, 2);
          break;
          
        case 'wipe':
          await onExecute('clear_session');
          result = '🔥 All session data destroyed. Memory wiped clean.';
          break;
          
        case 'curl':
          if (args.length === 0) {
            result = 'Usage: curl <url> [-X METHOD] [-H header]';
          } else {
            const url = args[0];
            const method = args.includes('-X') ? args[args.indexOf('-X') + 1] : 'GET';
            result = await onExecute('curl', { url, method });
          }
          break;
          
        case 'wget':
          if (args.length === 0) {
            result = 'Usage: wget <url>';
          } else {
            result = await onExecute('wget', { url: args[0] });
          }
          break;
          
        case 'nmap':
          result = await onExecute('nmap', { target: args[0] || '127.0.0.1' });
          break;
          
        case 'whois':
          result = await onExecute('whois', { domain: args[0] || 'example.com' });
          break;
          
        case 'dig':
          result = await onExecute('dig', { domain: args[0] || 'example.com' });
          break;
          
        case 'github-clone':
          result = await onExecute('github-clone', { repo: args[0] });
          break;
          
        case 'github-raw':
          if (args.length < 2) {
            result = 'Usage: github-raw <owner/repo> <path/to/file>';
          } else {
            result = await onExecute('github-raw', { repo: args[0], path: args[1] });
          }
          break;
          
        case 'install-tool':
          if (args.length < 2) {
            result = 'Usage: install-tool <name> <github-url>';
          } else {
            result = await onExecute('install-tool', { name: args[0], source: args[1] });
          }
          break;
          
        case 'list-tools':
          result = await onExecute('list-tools');
          break;
          
        case 'python':
          const pyCode = args.join(' ');
          result = await onExecute('python', { code: pyCode });
          break;
          
        case 'node':
          const nodeCode = args.join(' ');
          result = await onExecute('node', { code: nodeCode });
          break;
          
        case 'bash':
        case 'exec':
          const bashCmd = args.join(' ');
          result = await onExecute('bash', { command: bashCmd });
          break;
          
        case 'hash-md5':
          result = await onExecute('hash-md5', { text: args.join(' ') });
          break;
          
        case 'hash-sha256':
          result = await onExecute('hash-sha256', { text: args.join(' ') });
          break;
          
        case 'base64':
          result = await onExecute('base64', { text: args[0], decode: args.includes('-d') });
          break;
          
        case 'jwt-decode':
          result = await onExecute('jwt-decode', { token: args[0] });
          break;
          
        default:
          // Try to execute as dynamic tool
          result = await onExecute(cmdName, Object.fromEntries(args.map(a => {
            if (a.includes('=')) {
              const [key, value] = a.split('=');
              return [key, value];
            }
            return [a, true];
          })));
      }
      
      const output = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      setHistory(prev => [...prev, { type: 'output', content: output, timestamp: new Date() }]);
    } catch (error: any) {
      setHistory(prev => [...prev, { type: 'error', content: error.message, timestamp: new Date() }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion
      const commands = ['help', 'clear', 'curl', 'wget', 'nmap', 'whois', 'dig', 'python', 'node', 'bash', 'github-clone', 'install-tool', 'list-tools', 'hash-md5', 'hash-sha256', 'base64', 'jwt-decode', 'ls', 'pwd', 'echo', 'stats', 'wipe'];
      const match = commands.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 hover:bg-red-500 text-white shadow-lg z-50"
      >
        <TerminalIcon className="w-4 h-4 mr-2" />
        Terminal
      </Button>
    );
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-4 right-4 w-64' : 'bottom-4 right-4 w-[600px] h-[400px]'} bg-slate-950 border border-red-500/50 rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-red-950/30 border-b border-red-500/30 rounded-t-lg">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-red-400" />
          <span className="text-xs font-mono text-red-400">darkunicorn@root:~#</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-red-900/50 rounded">
            {isMinimized ? <Maximize2 className="w-3 h-3 text-slate-400" /> : <Minimize2 className="w-3 h-3 text-slate-400" />}
          </button>
          <button onClick={() => setHistory([])} className="p-1 hover:bg-red-900/50 rounded" title="Clear">
            <Trash2 className="w-3 h-3 text-slate-400" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-red-900/50 rounded">
            <X className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Output */}
          <div ref={outputRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 bg-black/50">
            {history.map((line, idx) => (
              <div key={idx} className={`whitespace-pre-wrap break-all ${
                line.type === 'input' ? 'text-green-400' :
                line.type === 'error' ? 'text-red-400' :
                'text-slate-300'
              }`}>
                {line.content}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center px-3 py-2 border-t border-red-500/30 bg-slate-900/50">
            <span className="text-green-400 font-mono text-xs mr-2">root@darkunicorn:~#</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isReady}
              className="flex-1 bg-transparent border-none outline-none text-slate-200 font-mono text-xs placeholder:text-slate-600"
              placeholder={isReady ? "Enter command..." : "Initializing..."}
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
};
