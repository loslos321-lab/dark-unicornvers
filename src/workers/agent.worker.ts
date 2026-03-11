import * as Comlink from 'comlink';
import { OpenClawAgent } from './agent.core';

const agent = new OpenClawAgent();
let isInitialized = false;
let initializationError: string | null = null;

const api = {
  async initialize() {
    if (isInitialized) {
      console.log('[Worker] Already initialized');
      return;
    }
    
    if (initializationError) {
      console.log('[Worker] Previous init error, attempting again:', initializationError);
      initializationError = null;
    }
    
    try {
      console.log('[Worker] Beginning agent initialization');
      
      await agent.initialize((progress: number) => {
        self.postMessage({ type: 'download_progress', progress });
      });
      
      isInitialized = true;
      console.log('[Worker] Initialization successful');
      self.postMessage({ type: 'ready' });
    } catch (err: any) {
      const errMsg = err?.message || String(err) || 'Unknown initialization error';
      console.error('[Worker] Initialization failed:', errMsg);
      initializationError = errMsg;
      self.postMessage({ type: 'error', data: errMsg });
      throw err;
    }
  },

  async *chat(message: string, history: string[]) {
    if (!isInitialized) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }
    
    try {
      const generator = agent.chat(message, history);
      
      for await (const chunk of generator) {
        yield chunk;
      }
    } catch (err: any) {
      console.error('[Worker] Chat error:', err);
      self.postMessage({ 
        type: 'error', 
        data: err?.message || 'Chat failed' 
      });
      throw err;
    }
  },

  async executeTool(tool: any) {
    if (!isInitialized) {
      throw new Error('Agent not initialized');
    }
    
    try {
      return await agent.executeTool(tool);
    } catch (err: any) {
      console.error('[Worker] Tool execution error:', err);
      self.postMessage({ 
        type: 'error', 
        data: err?.message || 'Tool execution failed' 
      });
      throw err;
    }
  },

  getStatus() {
    return { 
      initialized: isInitialized,
      error: initializationError
    };
  }
};

Comlink.expose(api);

console.log('[Worker] Agent worker loaded and exposed');
