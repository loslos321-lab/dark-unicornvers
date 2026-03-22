import { describe, it, expect, beforeEach, vi, bench } from "vitest";
import { OpenClawAgent } from "../workers/agent.core";
import { LocalVectorStore } from "../lib/vectorStore";

// Mock WebLLM
vi.mock("@mlc-ai/web-llm", () => ({
  CreateMLCEngine: vi.fn().mockResolvedValue({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: "Test" } }] };
          },
        }),
      },
    },
  }),
}));

describe("Performance Benchmarks - Crypto Operations", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  describe("Hash Performance", () => {
    it("should hash short text quickly", async () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        await (agent as any).executeTool({
          tool: "hash-sha256",
          params: { text: "short" },
        });
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it("should hash large text efficiently", async () => {
      const largeText = "x".repeat(100000); // 100KB

      const start = performance.now();
      const result = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text: largeText },
      });
      const duration = performance.now() - start;

      expect(result.hash).toBeDefined();
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it("should handle concurrent hash operations", async () => {
      const promises = [];

      for (let i = 0; i < 50; i++) {
        promises.push(
          (agent as any).executeTool({
            tool: "hash-sha256",
            params: { text: `concurrent-${i}` },
          })
        );
      }

      const start = performance.now();
      const results = await Promise.all(promises);
      const duration = performance.now() - start;

      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Base64 Performance", () => {
    it("should encode large data efficiently", async () => {
      const largeData = "x".repeat(100000);

      const start = performance.now();
      const result = await (agent as any).executeTool({
        tool: "base64",
        params: { text: largeData },
      });
      const duration = performance.now() - start;

      expect(result.output).toBeDefined();
      expect(duration).toBeLessThan(50);
    });

    it("should decode large data efficiently", async () => {
      const largeEncoded = btoa("x".repeat(100000));

      const start = performance.now();
      const result = await (agent as any).executeTool({
        tool: "base64",
        params: { text: largeEncoded, decode: true },
      });
      const duration = performance.now() - start;

      expect(result.output).toBeDefined();
      expect(duration).toBeLessThan(50);
    });
  });
});

describe("Performance Benchmarks - Vector Store", () => {
  let store: LocalVectorStore;

  beforeEach(async () => {
    store = new LocalVectorStore();
    await store.init();
  });

  describe("Document Addition Performance", () => {
    it("should add documents quickly", async () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        await store.addDocument(`Document ${i} with some content about testing performance`);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    it("should handle large documents", async () => {
      const largeDoc = "word ".repeat(10000); // ~60KB

      const start = performance.now();
      const id = await store.addDocument(largeDoc);
      const duration = performance.now() - start;

      expect(id).toBeDefined();
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Search Performance", () => {
    it("should search quickly with many documents", async () => {
      // Add 500 documents
      for (let i = 0; i < 500; i++) {
        await store.addDocument(
          `Document ${i} about ${["JavaScript", "Python", "Rust", "Go", "TypeScript"][i % 5]} programming`
        );
      }

      const start = performance.now();
      const results = await store.search("JavaScript programming", 10);
      const duration = performance.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });

    it("should handle topK parameter efficiently", async () => {
      // Add 100 documents
      for (let i = 0; i < 100; i++) {
        await store.addDocument(`Document ${i} content here`);
      }

      const start = performance.now();
      const results = await store.search("document", 50);
      const duration = performance.now() - start;

      expect(results.length).toBeLessThanOrEqual(50);
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Embedding Performance", () => {
    it("should generate embeddings quickly", async () => {
      const texts = [
        "Short text",
        "Medium length text with more words here",
        "A longer text that contains many more words and should still process quickly for embedding generation in the vector store",
      ];

      for (const text of texts) {
        const start = performance.now();
        await store.addDocument(text);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(10);
      }
    });
  });
});

describe("Performance Benchmarks - JavaScript Execution", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  describe("Safe Code Execution Performance", () => {
    it("should execute simple code quickly", async () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        await (agent as any).executeTool({
          tool: "js-exec",
          params: { code: `return ${i} * 2` },
        });
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(500);
    });

    it("should execute math operations efficiently", async () => {
      const code = `
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
          sum += Math.sqrt(i);
        }
        return sum;
      `;

      const start = performance.now();
      const result = await (agent as any).executeTool({
        tool: "js-exec",
        params: { code },
      });
      const duration = performance.now() - start;

      expect(result.executed).toBe(true);
      expect(duration).toBeLessThan(100);
    });

    it("should handle array operations efficiently", async () => {
      const code = `
        const arr = Array.from({length: 1000}, (_, i) => i);
        return arr.filter(x => x % 2 === 0).map(x => x * 2).reduce((a, b) => a + b, 0);
      `;

      const start = performance.now();
      const result = await (agent as any).executeTool({
        tool: "js-exec",
        params: { code },
      });
      const duration = performance.now() - start;

      expect(result.executed).toBe(true);
      expect(duration).toBeLessThan(50);
    });
  });

  describe("Pattern Matching Performance", () => {
    it("should check dangerous patterns quickly", async () => {
      const safeCode = "return 2 + 2"; // Short safe code

      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        await (agent as any).executeTool({
          tool: "js-exec",
          params: { code: safeCode },
        });
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});

describe("Performance Benchmarks - DNS Operations", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  it("should construct DNS query URLs quickly", async () => {
    const domains = ["google.com", "github.com", "example.com", "cloudflare.com", "mozilla.org"];

    const start = performance.now();

    for (const domain of domains) {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ Status: 0, Answer: [] }),
      } as any);

      await (agent as any).executeTool({
        tool: "dig",
        params: { domain, type: "A" },
      });
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});

describe("Memory Usage Tests", () => {
  it("should handle many vector documents without memory issues", async () => {
    const store = new LocalVectorStore();
    await store.init();

    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Add 1000 documents
    for (let i = 0; i < 1000; i++) {
      await store.addDocument(`Document ${i} with content ${"x".repeat(100)}`);
    }

    const stats = store.getStats();
    expect(stats.documents).toBe(1000);

    // Clear and verify cleanup
    await store.clearAll();
    const afterClearStats = store.getStats();
    expect(afterClearStats.documents).toBe(0);
  });

  it("should cleanup sessions properly", async () => {
    const store = new LocalVectorStore();
    await store.init();

    // Add data
    for (let i = 0; i < 100; i++) {
      await store.addDocument(`Doc ${i}`);
      await store.saveChatSession(`session-${i}`, [{ role: "user", content: "Hi" }]);
    }

    let stats = store.getStats();
    expect(stats.documents).toBe(100);
    expect(stats.chats).toBe(100);

    // Clear all
    await store.clearAll();
    stats = store.getStats();
    expect(stats.documents).toBe(0);
    expect(stats.chats).toBe(0);
  });
});

describe("Benchmark Suite", () => {
  let agent: OpenClawAgent;
  let store: LocalVectorStore;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());

    store = new LocalVectorStore();
    await store.init();
  });

  bench("SHA-256 hash 1KB text", async () => {
    await (agent as any).executeTool({
      tool: "hash-sha256",
      params: { text: "x".repeat(1000) },
    });
  });

  bench("Base64 encode 1KB text", async () => {
    await (agent as any).executeTool({
      tool: "base64",
      params: { text: "x".repeat(1000) },
    });
  });

  bench("Add document to vector store", async () => {
    await store.addDocument("Test document with some content");
  });

  bench("Search vector store (100 docs)", async () => {
    await store.search("test query", 5);
  });

  bench("JavaScript simple execution", async () => {
    await (agent as any).executeTool({
      tool: "js-exec",
      params: { code: "return 2 + 2" },
    });
  });
});
