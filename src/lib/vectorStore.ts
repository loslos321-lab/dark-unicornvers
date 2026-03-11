import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { VectorDocument } from '../types/agent';

interface VectorDB extends DBSchema {
  documents: {
    key: string;
    value: VectorDocument;
    indexes: { 'by-timestamp': number };
  };
  chats: {
    key: string;
    value: {
      id: string;
      messages: Array<{ role: string; content: string }>;
      timestamp: number;
    };
  };
}

export class LocalVectorStore {
  private db: IDBPDatabase<VectorDB> | null = null;
  private dbName = 'openclaw-db';

  async init() {
    this.db = await openDB<VectorDB>(this.dbName, 1, {
      upgrade(db) {
        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('by-timestamp', 'timestamp');
        }
        
        // Chats store
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }
      },
    });
  }

  async addDocument(content: string, metadata: any = {}) {
    if (!this.db) throw new Error('DB not initialized');
    
    // Simple hash-based embedding (no ML needed)
    const embedding = this.simpleEmbed(content);
    
    const doc: VectorDocument = {
      id: crypto.randomUUID(),
      content,
      embedding,
      metadata,
      timestamp: Date.now(),
    };

    await this.db.add('documents', doc);
    return doc.id;
  }

  async search(query: string, topK: number = 5) {
    if (!this.db) throw new Error('DB not initialized');
    
    const queryEmbed = this.simpleEmbed(query);
    const allDocs = await this.db.getAll('documents');
    
    const scored = allDocs.map(doc => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbed, doc.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async saveChatSession(sessionId: string, messages: any[]) {
    if (!this.db) throw new Error('DB not initialized');
    
    await this.db.put('chats', {
      id: sessionId,
      messages,
      timestamp: Date.now(),
    });
  }

  async getChatSession(sessionId: string) {
    if (!this.db) throw new Error('DB not initialized');
    
    return await this.db.get('chats', sessionId);
  }

  async getAllChats() {
    if (!this.db) throw new Error('DB not initialized');
    
    return await this.db.getAll('chats');
  }

  async clearAll() {
    if (!this.db) throw new Error('DB not initialized');
    
    await this.db.clear('documents');
    await this.db.clear('chats');
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
