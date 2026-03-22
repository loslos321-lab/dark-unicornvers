import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { OpenClawAgent } from "../workers/agent.core";
import { LocalVectorStore } from "../lib/vectorStore";

// Mock WebLLM
vi.mock("@mlc-ai/web-llm", () => ({
  CreateMLCEngine: vi.fn().mockResolvedValue({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: "Test response from AI" } }] };
          },
        }),
      },
    },
  }),
}));

describe("Integration Tests - Agent Core + Vector Store", () => {
  let agent: OpenClawAgent;
  let vectorStore: LocalVectorStore;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    vectorStore = new LocalVectorStore();

    await agent.initialize(vi.fn());
    await vectorStore.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("End-to-End Tool Execution Flow", () => {
    it("should execute DNS lookup and store result", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          Status: 0,
          Answer: [{ name: "example.com", type: 1, TTL: 300, data: "93.184.216.34" }],
        }),
      } as any);

      // Execute DNS lookup
      const dnsResult = await (agent as any).executeTool({
        tool: "dig",
        params: { domain: "example.com" },
      });

      expect(dnsResult.status).toBe("NOERROR");

      // Store in vector store
      const docId = await vectorStore.addDocument(
        `DNS lookup result: ${JSON.stringify(dnsResult)}`,
        { tool: "dig", domain: "example.com" }
      );

      expect(docId).toBeDefined();

      // Search for the result
      const searchResults = await vectorStore.search("example.com DNS");
      expect(searchResults.length).toBeGreaterThan(0);
    });

    it("should execute crypto operations chain", async () => {
      const text = "sensitive data";

      // Hash the text
      const hashResult = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text },
      });

      // Encode the hash
      const encodeResult = await (agent as any).executeTool({
        tool: "base64",
        params: { text: hashResult.hash },
      });

      // Store the chain
      await vectorStore.addDocument(
        `Hash chain: ${text} -> ${hashResult.hash} -> ${encodeResult.output}`,
        { original: text, hash: hashResult.hash, encoded: encodeResult.output }
      );

      // Verify chain
      expect(hashResult.hash).toMatch(/^[a-f0-9]{64}$/);
      expect(encodeResult.output).toMatch(/^[A-Za-z0-9+/=]+$/);

      const searchResults = await vectorStore.search("sensitive data hash");
      expect(searchResults.length).toBeGreaterThan(0);
    });

    it("should handle HTTP request with response processing", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: vi.fn().mockResolvedValue({ users: [{ id: 1, name: "Test" }] }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse as any);

      // Make HTTP request
      const curlResult = await (agent as any).executeTool({
        tool: "curl",
        params: { url: "https://api.example.com/users" },
      });

      expect(curlResult.status).toBe(200);
      expect(curlResult.data).toEqual({ users: [{ id: 1, name: "Test" }] });

      // Store response data
      await vectorStore.addDocument(
        `API Response: ${JSON.stringify(curlResult.data)}`,
        { endpoint: "users", status: curlResult.status }
      );

      const searchResults = await vectorStore.search("users API");
      expect(searchResults.length).toBeGreaterThan(0);
    });
  });

  describe("Session Management Integration", () => {
    it("should maintain session across multiple operations", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ Status: 0, Answer: [] }),
        status: 200,
        headers: new Headers({}),
        text: vi.fn().mockResolvedValue("OK"),
      } as any);

      // Multiple operations
      const operations = [
        { tool: "dig", params: { domain: "google.com" } },
        { tool: "hash-sha256", params: { text: "test" } },
        { tool: "base64", params: { text: "encode this" } },
        { tool: "curl", params: { url: "https://example.com" } },
      ];

      const results = [];
      for (const op of operations) {
        const result = await (agent as any).executeTool(op);
        results.push(result);

        // Store each result
        await vectorStore.addDocument(
          `Operation ${op.tool}: ${JSON.stringify(result)}`,
          { tool: op.tool }
        );
      }

      expect(results).toHaveLength(4);

      // Verify all stored
      const stats = vectorStore.getStats();
      expect(stats.documents).toBe(4);
    });

    it("should clear all data on session reset", async () => {
      // Add data
      await vectorStore.addDocument("Test doc 1");
      await vectorStore.addDocument("Test doc 2");
      await vectorStore.saveChatSession("test-session", [{ role: "user", content: "Hi" }]);

      // Verify data exists
      let stats = vectorStore.getStats();
      expect(stats.documents).toBe(2);
      expect(stats.chats).toBe(1);

      // Clear session
      agent.clearSession();
      await vectorStore.clearAll();

      // Verify cleared
      stats = vectorStore.getStats();
      expect(stats.documents).toBe(0);
      expect(stats.chats).toBe(0);
    });
  });

  describe("Chat History Integration", () => {
    it("should save and retrieve chat sessions", async () => {
      const sessionId = "test-session-123";
      const messages = [
        { role: "user", content: "Run dig on example.com" },
        { role: "assistant", content: '```tool\n{"tool": "dig", "params": {"domain": "example.com"}}\n```' },
      ];

      await vectorStore.saveChatSession(sessionId, messages);

      const retrieved = await vectorStore.getChatSession(sessionId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.messages).toEqual(messages);
    });

    it("should update existing chat session", async () => {
      const sessionId = "test-session-456";

      const messages1 = [{ role: "user", content: "Hello" }];
      await vectorStore.saveChatSession(sessionId, messages1);

      const messages2 = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ];
      await vectorStore.saveChatSession(sessionId, messages2);

      const retrieved = await vectorStore.getChatSession(sessionId);
      expect(retrieved?.messages).toEqual(messages2);
    });

    it("should retrieve all chat sessions", async () => {
      await vectorStore.saveChatSession("session-1", [{ role: "user", content: "Hi" }]);
      await vectorStore.saveChatSession("session-2", [{ role: "user", content: "Hello" }]);
      await vectorStore.saveChatSession("session-3", [{ role: "user", content: "Hey" }]);

      const allChats = await vectorStore.getAllChats();
      expect(allChats).toHaveLength(3);
    });
  });

  describe("Tool Result Storage and Retrieval", () => {
    it("should store tool results with metadata", async () => {
      const toolResult = {
        tool: "hash-sha256",
        type: "REAL",
        algorithm: "SHA-256",
        input_length: 5,
        hash: "abc123...",
      };

      const docId = await vectorStore.addDocument(
        `Hash result: ${JSON.stringify(toolResult)}`,
        {
          tool: toolResult.tool,
          algorithm: toolResult.algorithm,
          timestamp: Date.now(),
        }
      );

      const searchResults = await vectorStore.search("SHA-256 hash", 1);
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults[0].metadata).toHaveProperty("tool");
      expect(searchResults[0].metadata).toHaveProperty("algorithm");
    });

    it("should store multiple tool results and search across them", async () => {
      // Store various tool results
      const results = [
        { tool: "dig", domain: "google.com", ips: ["8.8.8.8"] },
        { tool: "hash-md5", input: "test", hash: "098f6bcd..." },
        { tool: "base64", input: "hello", output: "aGVsbG8=" },
      ];

      for (const result of results) {
        await vectorStore.addDocument(
          `${result.tool} result: ${JSON.stringify(result)}`,
          { tool: result.tool }
        );
      }

      // Search for DNS results
      const dnsResults = await vectorStore.search("dig google", 5);
      expect(dnsResults.length).toBeGreaterThan(0);

      // Search for hash results
      const hashResults = await vectorStore.search("md5 hash", 5);
      expect(hashResults.length).toBeGreaterThan(0);

      // Search for encoding results
      const encodingResults = await vectorStore.search("base64", 5);
      expect(encodingResults.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle and store error results", async () => {
      // Force an error
      const result = await (agent as any).executeTool({
        tool: "jwt-decode",
        params: { token: "invalid" },
      });

      expect(result.error).toBeDefined();

      // Store error result
      await vectorStore.addDocument(
        `Error: ${result.error}`,
        { type: "error", tool: "jwt-decode" }
      );

      const searchResults = await vectorStore.search("jwt-decode error");
      expect(searchResults.length).toBeGreaterThan(0);
    });

    it("should continue operating after errors", async () => {
      // First operation fails
      const failResult = await (agent as any).executeTool({
        tool: "unknown-tool",
        params: {},
      });
      expect(failResult.error).toBeDefined();

      // Second operation should still work
      const successResult = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text: "test" },
      });

      expect(successResult.hash).toBeDefined();
    });
  });

  describe("Complex Workflow Integration", () => {
    it("should handle complete security assessment workflow", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          Status: 0,
          Answer: [{ data: "93.184.216.34" }],
        }),
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: vi.fn().mockResolvedValue("{\"status\":\"ok\"}"),
      } as any);

      const target = "example.com";

      // Step 1: DNS lookup
      const dnsResult = await (agent as any).executeTool({
        tool: "dig",
        params: { domain: target, type: "A" },
      });
      await vectorStore.addDocument(`DNS: ${JSON.stringify(dnsResult)}`, { step: 1 });

      // Step 2: Hash a test string
      const hashResult = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text: target },
      });
      await vectorStore.addDocument(`Hash: ${JSON.stringify(hashResult)}`, { step: 2 });

      // Step 3: Encode result
      const encodeResult = await (agent as any).executeTool({
        tool: "base64",
        params: { text: hashResult.hash },
      });
      await vectorStore.addDocument(`Encoded: ${JSON.stringify(encodeResult)}`, { step: 3 });

      // Step 4: HTTP check (simulated)
      const curlResult = await (agent as any).executeTool({
        tool: "curl",
        params: { url: `https://${target}` },
      });
      await vectorStore.addDocument(`HTTP: ${JSON.stringify(curlResult)}`, { step: 4 });

      // Verify all steps recorded
      const stats = vectorStore.getStats();
      expect(stats.documents).toBe(4);

      // Search across all data
      const searchResults = await vectorStore.search("example.com", 10);
      expect(searchResults.length).toBeGreaterThan(0);
    });

    it("should handle batch processing workflow", async () => {
      const domains = ["google.com", "github.com", "cloudflare.com"];

      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          Status: 0,
          Answer: [{ data: "1.2.3.4" }],
        }),
      } as any);

      // Process all domains
      const results = await Promise.all(
        domains.map(async (domain) => {
          const result = await (agent as any).executeTool({
            tool: "dig",
            params: { domain },
          });

          await vectorStore.addDocument(
            `Batch DNS for ${domain}: ${JSON.stringify(result)}`,
            { batch: true, domain }
          );

          return result;
        })
      );

      expect(results).toHaveLength(3);

      const stats = vectorStore.getStats();
      expect(stats.documents).toBe(3);

      // Search for batch results
      const batchResults = await vectorStore.search("Batch DNS", 5);
      expect(batchResults.length).toBe(3);
    });
  });

  describe("Stats and Monitoring Integration", () => {
    it("should provide accurate stats", async () => {
      // Add documents
      for (let i = 0; i < 5; i++) {
        await vectorStore.addDocument(`Document ${i}`);
      }

      // Add chats
      for (let i = 0; i < 3; i++) {
        await vectorStore.saveChatSession(`session-${i}`, []);
      }

      const stats = vectorStore.getStats();

      expect(stats.documents).toBe(5);
      expect(stats.chats).toBe(3);
      expect(stats.mode).toContain("IN-MEMORY");
    });

    it("should track session info from agent", async () => {
      const info = (agent as any).getSessionInfo();

      expect(info).toHaveProperty("ethical_agreement");
      expect(info).toHaveProperty("memory_entries");
      expect(info).toHaveProperty("chat_messages");
      expect(info).toHaveProperty("mode");
    });
  });
});

describe("Integration Tests - Error Recovery", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  it("should recover from fetch errors", async () => {
    // First call fails
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    const failResult = await (agent as any).executeTool({
      tool: "dig",
      params: { domain: "example.com" },
    });

    expect(failResult.error).toBeDefined();

    // Second call succeeds
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({
        Status: 0,
        Answer: [{ data: "1.2.3.4" }],
      }),
    } as any);

    const successResult = await (agent as any).executeTool({
      tool: "dig",
      params: { domain: "example.com" },
    });

    expect(successResult.answers).toBeDefined();
  });

  it("should handle timeout scenarios gracefully", async () => {
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 200);
        })
    );

    const result = await (agent as any).executeTool({
      tool: "curl",
      params: { url: "https://slow.example.com", timeout: 100 },
    });

    expect(result.error).toBeDefined();
  });
});
