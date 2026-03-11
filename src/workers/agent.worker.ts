import * as Comlink from 'comlink';
import { OpenClawAgent } from './agent.core';

const agent = new OpenClawAgent();
let isInitialized = false;

const api = {
  async initialize() {
    if (isInitialized) return;
    
    await agent.initialize((progress: number) => {
      self.postMessage({ type: 'download_progress', progress });
    });
    
    isInitialized = true;
  },

  async *chat(message: string, history: string[]) {
    const generator = agent.chat(message, history);
    
    for await (const chunk of generator) {
      yield chunk;
    }
  },

  async executeTool(tool: any) {
    return await agent.executeTool(tool);
  },

  getStatus() {
    return { initialized: isInitialized };
  }
};

Comlink.expose(api);
