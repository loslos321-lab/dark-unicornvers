import * as Comlink from 'comlink';
import { OpenClawAgent } from './agent.core';

const agent = new OpenClawAgent();
let isInitialized = false;
let initializationError: string | null = null;

const api = {
  async initialize(onProgress?: (progress: number) => void) {
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
        if (onProgress) {
          onProgress(progress);
        }
      });
      
      isInitialized = true;
      console.log('[Worker] Initialization successful');
    } catch (err: any) {
      const errMsg = err?.message || String(err) || 'Unknown initialization error';
      console.error('[Worker] Initialization failed:', errMsg);
      initializationError = errMsg;
      throw err;
    }
  },

  async chat(message: string, history: string[], onChunk: (chunk: string) => void) {
    if (!isInitialized) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }
    
    try {
      const generator = agent.chat(message, history);
      
      for await (const chunk of generator) {
        onChunk(chunk);
      }
      
      return true;
    } catch (err: any) {
      console.error('[Worker] Chat error:', err);
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
