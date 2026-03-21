import { useEffect, useRef, useState, useCallback } from 'react';
import * as Comlink from 'comlink';
import { LocalVectorStore } from '@/lib/vectorStore';

export const useOpenClaw = () => {
  const workerRef = useRef<Worker | null>(null);
  const agentRef = useRef<any>(null);
  const vectorStoreRef = useRef<LocalVectorStore | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 1; // Less retries since model download takes time
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'thinking'>('idle');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const agreementAcceptedRef = useRef(false);

  const initializeAgent = useCallback(async () => {
    try {
      setStatus('loading');
      console.log(`[OpenClaw] Initialization attempt ${retryCountRef.current + 1}/${maxRetries + 1}`);
      
      // Cleanup previous worker if exists
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch (e) {
          console.warn('[OpenClaw] Error terminating previous worker:', e);
        }
      }
      
      // Initialize vector store
      try {
        const vectorStore = new LocalVectorStore();
        await Promise.race([
          vectorStore.init(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Vector store init timeout')), 5000)
          )
        ]);
        vectorStoreRef.current = vectorStore;
        console.log('[OpenClaw] Vector store initialized');
      } catch (err: any) {
        console.warn('[OpenClaw] Vector store init failed, continuing:', err.message);
        // Continue without vector store
      }

      // Initialize worker with enhanced error handling
      return new Promise((resolve, reject) => {
        try {
          const worker = new Worker(
            new URL('../workers/agent.worker.ts', import.meta.url),
            { type: 'module' }
          );

          // No timeout - model download can take very long on slow connections
          // Progress is shown via onProgress callback

          worker.onerror = (event) => {
            console.error('[OpenClaw] Worker error:', event.message, event.filename, event.lineno);
            worker.terminate();
            reject(new Error(`Worker error: ${event.message}`));
          };

          // Wrap worker with Comlink
          const wrappedAgent = Comlink.wrap(worker) as any;
          
          // Initialize agent with progress callback
          const onProgress = Comlink.proxy((progress: number) => {
            setDownloadProgress(progress);
          });

          wrappedAgent.initialize(onProgress)
            .then(() => {
              workerRef.current = worker;
              agentRef.current = wrappedAgent;
              console.log('[OpenClaw] Agent initialized successfully');
              
              // Sync agreement if already accepted locally
              if (agreementAcceptedRef.current) {
                console.log('[OpenClaw] Syncing pre-accepted agreement to worker...');
                wrappedAgent.acceptEthicalAgreement?.().catch((err: any) => {
                  console.warn('[OpenClaw] Post-init agreement sync failed:', err?.message);
                });
              }
              
              setStatus('ready');
              setError(null);
              retryCountRef.current = 0;
              resolve(true);
            })
            .catch((err) => {
              reject(err);
            });
        } catch (err) {
          reject(err);
        }
      });
    } catch (err: any) {
      const errMsg = err?.message || String(err) || 'Unknown error';
      console.error('[OpenClaw] Init failed:', errMsg);
      
      if (retryCountRef.current < maxRetries && !errMsg.includes('timeout')) {
        retryCountRef.current += 1;
        console.log(`[OpenClaw] Retrying in 2s... (${retryCountRef.current}/${maxRetries})`);
        setError(`Connection failed, retrying... (${retryCountRef.current}/${maxRetries})`);
        
        return new Promise(resolve => {
          setTimeout(() => {
            initializeAgent().then(resolve).catch(() => resolve(false));
          }, 2000);
        });
      } else {
        setError(`Failed after ${maxRetries + 1} attempts: ${errMsg}`);
        setStatus('idle');
        return false;
      }
    }
  }, []);

  useEffect(() => {
    initializeAgent();

    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch (e) {
          console.warn('[OpenClaw] Error on cleanup:', e);
        }
      }
    };
  }, [initializeAgent]);

  const acceptAgreement = useCallback(async () => {
    // Set both state and ref immediately
    setAgreementAccepted(true);
    agreementAcceptedRef.current = true;
    console.log('[OpenClaw] Ethical agreement accepted (local)');
    
    // Also notify worker if available
    if (agentRef.current) {
      try {
        await agentRef.current.acceptEthicalAgreement?.();
        console.log('[OpenClaw] Ethical agreement synced to worker');
      } catch (err: any) {
        // Worker call failed, but local state is already set
        console.warn('[OpenClaw] Worker sync failed (non-critical):', err.message);
      }
    }
  }, []);

  // Send message without useCallback to always have latest state
  const sendMessage = async (message: string, skipAgreementCheck = false) => {
    console.log('[OpenClaw] sendMessage called, agreementAccepted:', agreementAcceptedRef.current, 'skipCheck:', skipAgreementCheck);
    
    if (!agentRef.current || status === 'loading') {
      setError(status === 'loading' ? 'Agent still initializing' : 'Agent not ready');
      return;
    }
    
    // Only check agreement if not explicitly skipped (frontend handles it)
    if (!skipAgreementCheck && !agreementAcceptedRef.current) {
      console.log('[OpenClaw] Agreement not accepted, blocking message');
      setError('You must accept the ethical hacking agreement first');
      return;
    }

    try {
      setStatus('thinking');
      setThoughts([]);
      setError(null);

      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: message }]);

      try {
        // Get chat history summaries
        const history = messages.slice(-5).map(m => m.content);

        let fullResponse = '';
        
        // Create callback for streaming chunks using Comlink proxy
        const onChunk = Comlink.proxy((chunk: string) => {
          fullResponse += chunk;
          setThoughts(prev => {
            const last = prev[prev.length - 1] || '';
            const updated = [...prev.slice(0, -1), last + chunk];
            return updated;
          });
        });

        // Call chat with callback and get full response
        fullResponse = await Promise.race([
          agentRef.current.chat(message, history, onChunk),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Chat timeout')), 60000)
          )
        ]) as string;

        // Add assistant response
        setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);

        // Save to vector store
        if (vectorStoreRef.current) {
          try {
            await vectorStoreRef.current.addDocument(fullResponse, {
              userQuery: message,
              timestamp: Date.now()
            });
          } catch (vstoreErr) {
            console.warn('[OpenClaw] Vector store save failed:', vstoreErr);
          }
        }

        setStatus('ready');
      } catch (chatErr: any) {
        console.error('[OpenClaw] Chat error:', chatErr);
        setMessages(prev => prev.slice(0, -1)); // Remove user message on error
        setError(chatErr.message || 'Chat failed');
        setStatus('ready');
      }
    } catch (err: any) {
      console.error('[OpenClaw] Message error:', err);
      setError(err.message || 'Operation failed');
      setStatus('ready');
    }
  };

  const clearHistory = useCallback(async () => {
    setMessages([]);
    setThoughts([]);
    if (vectorStoreRef.current) {
      await vectorStoreRef.current.clearAll();
    }
    // Also clear agent session
    if (agentRef.current) {
      try {
        await agentRef.current.clearSession?.();
      } catch (e) {
        // Method might not exist
      }
    }
    setSessionInfo(null);
  }, []);

  const executeTool = useCallback(async (tool: string, params?: any) => {
    if (!agentRef.current || status !== 'ready') {
      return { error: 'Agent not ready' };
    }
    try {
      // Handle special internal commands
      if (tool === 'get_stats') {
        return vectorStoreRef.current?.getStats() || { error: 'No stats' };
      }
      if (tool === 'clear_session') {
        await clearHistory();
        return { cleared: true };
      }
      return await agentRef.current.executeTool({ tool, params: params || {} });
    } catch (err: any) {
      return { error: err.message };
    }
  }, [status, clearHistory]);

  // Update session info periodically
  useEffect(() => {
    if (status !== 'ready') return;
    
    const updateStats = async () => {
      if (vectorStoreRef.current) {
        setSessionInfo(vectorStoreRef.current.getStats());
      }
    };
    
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [status]);

  return {
    status,
    thoughts,
    messages,
    downloadProgress,
    error,
    setError,
    sendMessage,
    clearHistory,
    executeTool,
    sessionInfo,
    acceptAgreement,
    agreementAccepted,
    isReady: status === 'ready' || status === 'thinking'
  };
};
