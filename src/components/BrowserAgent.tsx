import { useState, useEffect } from 'react';
import { useOpenClaw } from '@/hooks/useOpenClaw';
import { NeuralSandbox } from './NeuralSandbox';
import { AgentChat } from './AgentChat';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Brain, CheckCircle } from 'lucide-react';

export const BrowserAgent = () => {
  const {
    status,
    thoughts,
    messages,
    downloadProgress,
    error,
    sendMessage,
    clearHistory,
    isReady
  } = useOpenClaw();

  const [initMessage, setInitMessage] = useState<string>('');

  useEffect(() => {
    switch (status) {
      case 'loading':
        if (downloadProgress > 0 && downloadProgress < 100) {
          setInitMessage(`Downloading AI model... ${Math.round(downloadProgress)}% (first time only, ~600MB)`);
        } else {
          setInitMessage(`Initializing agent... ${Math.round(downloadProgress)}%`);
        }
        break;
      case 'ready':
        setInitMessage('Agent online - ready to help!');
        setTimeout(() => setInitMessage(''), 3000);
        break;
      case 'idle':
        setInitMessage('Failed to initialize. Refresh the page.');
        break;
      default:
        setInitMessage('');
    }
  }, [status, downloadProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold font-mono text-cyan-400">
              OpenClaw Browser Agent
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-mono">
            100% Local • 100% Private • 100% Hardware-Accelerated
          </p>
        </div>

        {/* Status Alert */}
        {initMessage && (
          <Alert className="bg-cyan-950 bg-opacity-50 border-cyan-500 border-opacity-50 text-cyan-100">
            <div className="flex items-center gap-2">
              {status === 'loading' && (
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              )}
              {status === 'ready' && (
                <CheckCircle className="w-4 h-4" />
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
          <Alert className="bg-red-950 bg-opacity-50 border-red-500 border-opacity-50 text-red-100">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="font-mono text-sm">
              Error: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Neural Sandbox Visualization */}
            <NeuralSandbox 
              thoughts={thoughts} 
              isThinking={status === 'thinking'}
            />

            {/* Chat Interface */}
            <AgentChat
              messages={messages}
              loading={status === 'thinking'}
              error={error}
              onSendMessage={sendMessage}
              onClear={clearHistory}
            />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            
            {/* Status Card */}
            <Card className="bg-slate-900 bg-opacity-50 border-cyan-500 border-opacity-30 p-4">
              <h3 className="font-mono text-sm font-semibold text-cyan-400 mb-3">
                System Status
              </h3>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={`${
                    isReady ? 'text-lime-400' : 'text-yellow-400'
                  } font-semibold`}>
                    {status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Messages:</span>
                  <span className="text-cyan-400">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hardware:</span>
                  <span className="text-cyan-400">Local</span>
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <div className="text-slate-400 text-xs">
                    ✓ WebGPU Ready
                    <br />
                    ✓ IndexedDB Active
                    <br />
                    ✓ Zero Backend
                  </div>
                </div>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="bg-slate-900 bg-opacity-50 border-lime-500 border-opacity-20 p-4">
              <h3 className="font-mono text-sm font-semibold text-lime-400 mb-3">
                Capabilities
              </h3>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                <li>✓ Natural Language Chat</li>
                <li>✓ Local File Access*</li>
                <li>✓ Vector Search (RAG)</li>
                <li>✓ Code Execution</li>
                <li>✓ Chat History</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3 italic">
                *Requires File System Access API support
              </p>
            </Card>

            {/* Privacy Card */}
            <Card className="bg-slate-900 bg-opacity-50 border-purple-500 border-opacity-20 p-4">
              <h3 className="font-mono text-sm font-semibold text-purple-400 mb-3">
                Privacy Guarantee
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                All processing happens in your browser. No data is sent to servers. Your privacy is absolute.
              </p>
            </Card>

          </div>
        </div>

        {/* Debug Info */}
        {status === 'thinking' && (
          <Card className="bg-slate-900 bg-opacity-50 border-cyan-500 border-opacity-30 p-4">
            <h3 className="font-mono text-xs font-semibold text-cyan-400 mb-2">
              Thought Stream
            </h3>
            <div className="font-mono text-xs text-cyan-200 space-y-1 max-h-24 overflow-y-auto">
              {thoughts.map((thought, idx) => (
                <div key={idx} className="text-slate-400">
                  {thought}
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};

export default BrowserAgent;
