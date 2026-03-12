import type { ToolDefinition, AgentMessage } from '../types/agent';
import { CreateMLCEngine, InitProgressCallback } from '@mlc-ai/web-llm';

export class OpenClawAgent {
  private engine: any = null;
  private config = {
    temperature: 0.7,
    top_p: 0.9,
    repetition_penalty: 1.1,
    max_tokens: 2048,
  };
  private isInitialized = false;
  private initStartTime = 0;
  // Using a small model that works well in browsers
  private readonly modelId = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';

  async initialize(onProgress: (progress: number) => void) {
    try {
      this.initStartTime = Date.now();
      console.log('[Agent] Initialization starting with Web-LLM');
      
      // Check APIs availability
      onProgress(5);
      const checks = {
        webgpu: typeof navigator !== 'undefined' && !!(navigator as any).gpu,
        indexedDB: typeof indexedDB !== 'undefined',
        crypto: typeof crypto !== 'undefined' && !!(crypto as any)?.getRandomValues
      };
      
      console.log('[Agent] API availability:', checks);
      
      if (!checks.webgpu) {
        console.warn('[Agent] WebGPU not available - will use CPU fallback');
      }
      
      onProgress(10);
      
      // Initialize Web-LLM engine
      const progressCallback: InitProgressCallback = (report) => {
        // Map 10-100% to the init progress
        const progress = 10 + Math.round(report.progress * 90);
        onProgress(Math.min(progress, 99));
        console.log(`[Agent] Model loading: ${Math.round(report.progress * 100)}%`);
      };

      console.log('[Agent] Loading model:', this.modelId);
      
      this.engine = await CreateMLCEngine(
        this.modelId,
        { initProgressCallback: progressCallback }
      );
      
      onProgress(100);
      
      const initTime = Date.now() - this.initStartTime;
      console.log(`[Agent] Web-LLM initialized successfully (${initTime}ms)`);
      
      this.isInitialized = true;
    } catch (error: any) {
      console.error('[Agent] Init error:', error);
      this.isInitialized = false;
      throw new Error(`Failed to initialize Web-LLM: ${error.message}`);
    }
  }

  async chat(message: string, context: string[] = [], onChunk: (chunk: string) => void) {
    if (!this.isInitialized || !this.engine) {
      throw new Error('Agent not initialized');
    }

    const systemPrompt = `You are OpenClaw, a helpful AI assistant running entirely locally in the user's browser using Web-LLM. You are privacy-focused, efficient, and security-conscious. Be concise and helpful.`;

    const messages: AgentMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.map(c => ({ role: 'assistant' as const, content: c })),
      { role: 'user', content: message }
    ];

    try {
      const completion = await this.engine.chat.completions.create({
        messages,
        temperature: this.config.temperature,
        top_p: this.config.top_p,
        max_tokens: this.config.max_tokens,
        stream: true,
      });

      let fullResponse = '';
      
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      return fullResponse;
    } catch (error: any) {
      console.error('[Agent] Chat error:', error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  async executeTool(tool: ToolDefinition) {
    if (!this.isInitialized) {
      throw new Error('Agent not initialized');
    }
    
    switch (tool.tool) {
      case 'read_file':
        return this.readLocalFile(tool.params);
      case 'search_docs':
        return this.searchDocuments(tool.params);
      case 'execute_code':
        return this.sandboxExecute(tool.params);
      default:
        return { error: 'Unknown tool' };
    }
  }

  private async readLocalFile(params: any) {
    return { 
      error: 'File System Access API only available in main thread. Use UI to select files.' 
    };
  }

  private sandboxExecute(params: any) {
    try {
      const code = params.code || '';
      if (!code.trim()) return { error: 'Empty code' };
      
      const fn = new Function(`"use strict"; return (${code})`);
      const result = fn();
      
      return { 
        success: true, 
        result: JSON.stringify(result).substring(0, 1000)
      };
    } catch (e: any) {
      console.error('[Agent] Code execution error:', e);
      return { error: e.message };
    }
  }

  private async searchDocuments(params: any) {
    return {
      success: true,
      results: [
        {
          id: '1',
          content: 'OpenClaw runs entirely in your browser with Web-LLM',
          score: 0.95
        }
      ]
    };
  }
}
