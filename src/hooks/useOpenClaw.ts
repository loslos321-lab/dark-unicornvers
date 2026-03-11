import { useEffect, useRef, useState, useCallback } from 'react';
import * as Comlink from 'comlink';
import { LocalVectorStore } from '@/lib/vectorStore';

export const useOpenClaw = () => {
  const workerRef = useRef<Worker | null>(null);
  const agentRef = useRef<any>(null);
  const vectorStoreRef = useRef<LocalVectorStore | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'thinking'>('idle');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  useEffect(() => {
    const initWorker = async () => {
      try {
        setStatus('loading');
        
        // Initialize vector store
        const vectorStore = new LocalVectorStore();
        await vectorStore.init();
        vectorStoreRef.current = vectorStore;

        // Initialize worker
        workerRef.current = new Worker(
          new URL('../workers/agent.worker.ts', import.meta.url),
          { type: 'module' }
        );

        // Message handler for streaming
        workerRef.current.onmessage = (e) => {
          const { type, data, progress } = e.data;
          
          switch (type) {
            case 'token':
              setThoughts(prev => [...prev, data]);
              break;
            case 'download_progress':
              setDownloadProgress(progress || 0);
              break;
            case 'tool_detected':
              console.log('Tool detected:', data);
              break;
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Worker error:', error);
          setError(error.message);
        };

        // Wrap worker with Comlink
        agentRef.current = Comlink.wrap(workerRef.current);

        // Initialize agent
        await agentRef.current.initialize();
        setStatus('ready');
        setError(null);
      } catch (err: any) {
        console.error('Init error:', err);
        setError(err.message);
        setStatus('idle');
      }
    };

    initWorker();

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!agentRef.current) {
      setError('Agent not ready');
      return;
    }

    try {
      setStatus('thinking');
      setThoughts([]);
      setError(null);

      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: message }]);

      // Get chat history summaries
      const history = messages.slice(-5).map(m => m.content);

      // Stream response from agent
      const generator = await agentRef.current.chat(message, history);
      
      let fullResponse = '';
      for await (const chunk of generator) {
        fullResponse += chunk;
        setThoughts(prev => {
          const last = prev[prev.length - 1] || '';
          const updated = [...prev.slice(0, -1), last + chunk];
          return updated;
        });
      }

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);

      // Save to vector store
      if (vectorStoreRef.current) {
        await vectorStoreRef.current.addDocument(fullResponse, {
          userQuery: message,
          timestamp: Date.now()
        });
      }

      setStatus('ready');
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message);
      setStatus('ready');
    }
  }, [messages]);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    setThoughts([]);
    if (vectorStoreRef.current) {
      await vectorStoreRef.current.clearAll();
    }
  }, []);

  return {
    status,
    thoughts,
    messages,
    downloadProgress,
    error,
    sendMessage,
    clearHistory,
    isReady: status === 'ready' || status === 'thinking'
  };
};
