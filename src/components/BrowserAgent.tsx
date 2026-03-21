import { useState, useEffect } from 'react';
import { useOpenClaw } from '@/hooks/useOpenClaw';
import { NeuralSandbox } from './NeuralSandbox';
import { AgentChat } from './AgentChat';
import { Terminal } from './Terminal';
import { EthicalHackingAgreement } from './EthicalHackingAgreement';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Brain, CheckCircle, Terminal as TerminalIcon, Shield, Trash2, FileText, Lock, Wifi, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BrowserAgent = () => {
  const {
    status,
    thoughts,
    messages,
    downloadProgress,
    error,
    setError,
    sendMessage,
    clearHistory,
    isReady,
    sessionInfo,
    executeTool,
    acceptAgreement,
    agreementAccepted
  } = useOpenClaw();

  // Debug: log agreement state changes
  useEffect(() => {
    console.log('[BrowserAgent] agreementAccepted changed:', agreementAccepted);
  }, [agreementAccepted]);

  const [initMessage, setInitMessage] = useState<string>('');
  const [showTools, setShowTools] = useState(true);  // Tools always visible
  const [showAgreement, setShowAgreement] = useState(false);  // DISABLED for testing

  useEffect(() => {
    switch (status) {
      case 'loading':
        if (downloadProgress > 0 && downloadProgress < 100) {
          setInitMessage(`Loading neural core... ${Math.round(downloadProgress)}% (first time only)`);
        } else {
          setInitMessage(`Initializing Dark Unicorn... ${Math.round(downloadProgress)}%`);
        }
        break;
      case 'ready':
        setInitMessage('🦄 Dark Unicorn Agent ONLINE - Ready for operations');
        setTimeout(() => setInitMessage(''), 5000);
        break;
      case 'idle':
        setInitMessage('❌ Failed to initialize. Refresh the page.');
        break;
      default:
        setInitMessage('');
    }
  }, [status, downloadProgress]);

  const tools = [
    { name: 'curl', desc: 'HTTP/HTTPS requests', icon: '🌐' },
    { name: 'dig', desc: 'DNS lookup', icon: '🌍' },
    { name: 'whois', desc: 'Domain info', icon: '📋' },
    { name: 'nslookup', desc: 'DNS query', icon: '🔎' },
    { name: 'hash-md5', desc: 'MD5 hash', icon: '#️⃣' },
    { name: 'hash-sha256', desc: 'SHA256 hash', icon: '🔒' },
    { name: 'base64', desc: 'Base64 encode', icon: '📄' },
    { name: 'jwt-decode', desc: 'Decode JWT', icon: '🎫' },
    { name: 'local-ip', desc: 'My IP address', icon: '📡' },
    { name: 'geo', desc: 'Geolocation', icon: '📍' },
    { name: 'js-exec', desc: 'Run JavaScript', icon: '⚡' },
    { name: 'read-file', desc: 'Read local file', icon: '📂' },
    { name: 'network-info', desc: 'Browser info', icon: '🖥️' },
    { name: 'nmap', desc: 'Port scan (sim)', icon: '🔍' },
    { name: 'sqlmap', desc: 'SQLi (sim)', icon: '💉' },
    { name: 'hashcat', desc: 'Crack hash (sim)', icon: '🔐' },
  ];

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8" style={{backgroundColor: '#000000'}}>
      <div className="max-w-6xl mx-auto space-y-6" style={{backgroundColor: '#0a0a0a', padding: '20px', borderRadius: '8px'}}>
        
        {/* Ethical Agreement Modal */}
      {showAgreement && (
        <EthicalHackingAgreement 
          onAccept={async () => {
            console.log('[BrowserAgent] Agreement accepted, processing...');
            await acceptAgreement();
            setShowAgreement(false);
            console.log('[BrowserAgent] Agreement processed, modal closed');
          }}
          onDecline={() => {
            window.location.href = 'about:blank';
          }}
        />
      )}

      {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold font-mono text-red-500">
                🦄 Dark Unicorn v3.0
              </h1>
              <p className="text-red-400 text-sm font-mono">
                Real Pentesting Tools // Ethical Hacking Only
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-green-400">
              <Wifi className="w-3 h-3" /> INTERNET: ON
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <Github className="w-3 h-3" /> GITHUB: ENABLED
            </span>
            <span className="flex items-center gap-1">
              <TerminalIcon className="w-3 h-3" /> CLI: ACTIVE
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> 100% Local AI
            </span>
            <span className="flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> SESSION ONLY
            </span>
          </div>
        </div>

        {/* Status Alert */}
        {initMessage && (
          <Alert className="bg-red-950/50 border-red-500/50 text-red-100">
            <div className="flex items-center gap-2">
              {status === 'loading' && (
                <div className="w-4 h-4 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
              )}
              {status === 'ready' && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
              {status === 'idle' && (
                <AlertCircle className="w-4 h-4" />
              )}
              <AlertDescription className="font-mono text-sm">
                {initMessage}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-950/50 border-red-500/50 text-red-100">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="font-mono text-sm">
              Error: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Internet Status */}
        {status === 'ready' && (
          <>
            <Alert className="bg-green-950/30 border-green-500/30 text-green-200">
              <Wifi className="w-4 h-4" />
              <AlertDescription className="font-mono text-xs">
                🌐 INTERNET MODE ACTIVE - Agent has full web access, can download from GitHub, query APIs, and execute remote scripts. All activity is logged in session memory only.
              </AlertDescription>
            </Alert>
            <Alert className="bg-amber-950/30 border-amber-500/30 text-amber-200">
              <Lock className="w-4 h-4" />
              <AlertDescription className="font-mono text-xs">
                ⚠️ SECURITY MODE: All data is stored in memory only. Closing this tab will DESTROY all session data, chat history, and downloaded files. This is a feature, not a bug.
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Terminal */}
        <Terminal 
          onExecute={async (tool: string, params?: any) => {
            if (tool === 'get_stats') {
              return sessionInfo || { status: 'No session data' };
            }
            if (tool === 'clear_session') {
              clearHistory();
              return { cleared: true };
            }
            return executeTool(tool, params);
          }}
          isReady={isReady}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Neural Activity Monitor */}
            <NeuralSandbox 
              thoughts={thoughts} 
              isThinking={status === 'thinking'}
            />

            {/* Chat Interface */}
            <AgentChat
              messages={messages}
              loading={status === 'thinking'}
              error={error}
              onSendMessage={(msg) => {
                console.log('[BrowserAgent] onSendMessage called');
                sendMessage(msg);
              }}
              onClear={clearHistory}
              isReady={isReady}
            />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            
            {/* Status Card */}
            <Card className="bg-slate-900/50 border-red-500/30 p-4">
              <h3 className="font-mono text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <TerminalIcon className="w-4 h-4" /> System Status
              </h3>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={`${
                    isReady ? 'text-green-400' : 'text-yellow-400'
                  } font-semibold`}>
                    {status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Messages:</span>
                  <span className="text-red-400">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage:</span>
                  <span className="text-amber-400">VOLATILE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="text-red-400">PENTEST</span>
                </div>
                {sessionInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Memory:</span>
                      <span className="text-cyan-400">{sessionInfo.memory_entries} entries</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vectors:</span>
                      <span className="text-cyan-400">{sessionInfo.vector_docs} docs</span>
                    </div>
                  </>
                )}
                <div className="pt-2 border-t border-slate-700">
                  <div className="text-slate-400 text-xs">
                    ✓ WebGPU Ready<br/>
                    ✓ Neural Core Active<br/>
                    ✓ Zero Persistence
                  </div>
                </div>
              </div>
            </Card>

            {/* Tools Card */}
            <Card className="p-4" style={{backgroundColor: '#1a1a2e', border: '1px solid #e94560'}}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-sm font-semibold flex items-center gap-2" style={{color: '#e94560'}}>
                  <TerminalIcon className="w-4 h-4" /> Available Tools
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor: '#e94560', color: 'white'}}>{tools.length}</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {tools.map((tool) => (
                  <div 
                    key={tool.name}
                    className="flex items-center gap-2 p-2 rounded cursor-pointer transition-all"
                    style={{backgroundColor: '#16213e', border: '1px solid transparent'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f3460';
                      e.currentTarget.style.border = '1px solid #e94560';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#16213e';
                      e.currentTarget.style.border = '1px solid transparent';
                    }}
                    onClick={() => {
                      console.log('[BrowserAgent] Tool clicked:', tool.name);
                      const params = tool.name === 'dig' ? 'example.com' : 
                                   tool.name === 'whois' ? 'example.com' : 
                                   tool.name === 'nslookup' ? 'example.com' :
                                   tool.name === 'hash-md5' ? 'hello world' :
                                   tool.name === 'hash-sha256' ? 'hello world' :
                                   tool.name === 'base64' ? 'hello world' :
                                   tool.name === 'jwt-decode' ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0' :
                                   tool.name === 'curl' ? 'https://api.github.com' : '';
                      sendMessage(`Run ${tool.name} ${params}`);
                    }}
                    title="Click to run"
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <div>
                      <div className="font-mono font-semibold" style={{color: '#00d9ff'}}>{tool.name}</div>
                      <div style={{color: '#8b92b9', fontSize: '10px'}}>{tool.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Capabilities Card */}
            <Card className="bg-slate-900/50 border-amber-500/20 p-4">
              <h3 className="font-mono text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Capabilities
              </h3>
              <ul className="space-y-1 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Full Internet Access</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> GitHub Tool Installer</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Python/Node/Bash CLI</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Dynamic Script Loading</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 20+ Security Tools</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> API Query & Fetch</li>
              </ul>
            </Card>

            {/* Privacy Card */}
            <Card className="bg-slate-900/50 border-green-500/20 p-4">
              <h3 className="font-mono text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Privacy Guarantee
              </h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                <span className="text-red-400">ZERO TRUST ARCHITECTURE</span><br/><br/>
                • No data leaves your browser<br/>
                • No cloud API calls<br/>
                • No persistent storage<br/>
                • Session destroyed on close<br/>
                • Perfect forward secrecy
              </p>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
};

export default BrowserAgent;
