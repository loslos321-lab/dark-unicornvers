import type { VectorDocument } from '../types/agent';

/**
 * In-Memory Vector Store
 * All data is lost when the session ends (browser/tab closed)
 * This ensures maximum privacy - nothing persists on disk
 */
export class LocalVectorStore {
  private documents: VectorDocument[] = [];
  private chats: Array<{id: string, messages: any[], timestamp: number}> = [];
  private initialized = false;

  async init() {
    // No persistent storage - everything stays in memory
    this.initialized = true;
    console.log('[VectorStore] In-memory mode initialized. Data will be destroyed on tab close.');
  }

  async addDocument(content: string, metadata: any = {}) {
    if (!this.initialized) throw new Error('VectorStore not initialized');
    
    const embedding = this.simpleEmbed(content);
    
    const doc: VectorDocument = {
      id: crypto.randomUUID(),
      content,
      embedding,
      metadata,
      timestamp: Date.now(),
    };

    this.documents.push(doc);
    return doc.id;
  }

  async search(query: string, topK: number = 5) {
    if (!this.initialized) throw new Error('VectorStore not initialized');
    
    if (this.documents.length === 0) {
      return [];
    }
    
    const queryEmbed = this.simpleEmbed(query);
    
    const scored = this.documents.map(doc => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbed, doc.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async saveChatSession(sessionId: string, messages: any[]) {
    if (!this.initialized) throw new Error('VectorStore not initialized');
    
    const existingIndex = this.chats.findIndex(c => c.id === sessionId);
    if (existingIndex >= 0) {
      this.chats[existingIndex] = {
        id: sessionId,
        messages,
        timestamp: Date.now(),
      };
    } else {
      this.chats.push({
        id: sessionId,
        messages,
        timestamp: Date.now(),
      });
    }
  }

  async getChatSession(sessionId: string) {
    if (!this.initialized) throw new Error('VectorStore not initialized');
    return this.chats.find(c => c.id === sessionId) || null;
  }

  async getAllChats() {
    if (!this.initialized) throw new Error('VectorStore not initialized');
    return this.chats;
  }

  async clearAll() {
    this.documents = [];
    this.chats = [];
    console.log('[VectorStore] All in-memory data cleared');
  }

  getStats() {
    return {
      documents: this.documents.length,
      chats: this.chats.length,
      mode: 'IN-MEMORY (volatile)',
      warning: 'Data will be lost when you close this tab'
    };
  }

  private simpleEmbed(text: string): number[] {
    // Simple character-based embedding (no ML dependency)
    const embedding = new Array(384).fill(0);
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      embedding[(i * 7 + charCode) % 384] += Math.sin(charCode / 256);
    }
    
    return embedding.map(v => v / Math.sqrt(text.length || 1));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dotProduct / denom : 0;
  }
}
