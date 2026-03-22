import { describe, it, expect, beforeEach } from "vitest";
import { LocalVectorStore } from "../lib/vectorStore";

describe("LocalVectorStore", () => {
  let store: LocalVectorStore;

  beforeEach(async () => {
    store = new LocalVectorStore();
    await store.init();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      const newStore = new LocalVectorStore();
      await expect(newStore.init()).resolves.toBeUndefined();
    });

    it("should set initialized flag", async () => {
      const newStore = new LocalVectorStore();
      await newStore.init();
      // Should not throw when calling methods after init
      await expect(newStore.addDocument("test")).resolves.toBeDefined();
    });

    it("should throw when using uninitialized store", async () => {
      const newStore = new LocalVectorStore();
      await expect(newStore.addDocument("test")).rejects.toThrow("not initialized");
    });
  });

  describe("Document Management", () => {
    it("should add a document and return ID", async () => {
      const id = await store.addDocument("Test content");
      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("should add document with metadata", async () => {
      const metadata = { source: "test", timestamp: Date.now() };
      const id = await store.addDocument("Test content", metadata);
      expect(id).toBeDefined();
    });

    it("should generate unique IDs for each document", async () => {
      const id1 = await store.addDocument("Document 1");
      const id2 = await store.addDocument("Document 2");
      expect(id1).not.toBe(id2);
    });

    it("should handle empty content", async () => {
      const id = await store.addDocument("");
      expect(id).toBeDefined();
    });

    it("should handle large content", async () => {
      const largeContent = "a".repeat(10000);
      const id = await store.addDocument(largeContent);
      expect(id).toBeDefined();
    });

    it("should handle special characters in content", async () => {
      const specialContent = "Hello! @#$%^&*()_+{}|:<>?~`-=[]\\;',./世界🌍";
      const id = await store.addDocument(specialContent);
      expect(id).toBeDefined();
    });
  });

  describe("Search Functionality", () => {
    it("should return empty array when no documents exist", async () => {
      const results = await store.search("test");
      expect(results).toEqual([]);
    });

    it("should search and return results", async () => {
      await store.addDocument("JavaScript is a programming language");
      await store.addDocument("Python is great for data science");
      await store.addDocument("TypeScript adds types to JavaScript");

      const results = await store.search("JavaScript");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("score");
      expect(results[0]).toHaveProperty("content");
    });

    it("should respect topK parameter", async () => {
      for (let i = 0; i < 10; i++) {
        await store.addDocument(`Document ${i} about testing`);
      }

      const results = await store.search("testing", 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it("should return results sorted by relevance", async () => {
      await store.addDocument("Exact match for search term");
      await store.addDocument("Somewhat related content");
      await store.addDocument("Completely different topic");

      const results = await store.search("exact match search", 2);

      // First result should have highest score
      if (results.length >= 2) {
        expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      }
    });

    it("should include document metadata in results", async () => {
      const metadata = { category: "test", priority: 1 };
      await store.addDocument("Test content with metadata", metadata);

      const results = await store.search("test");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("metadata");
      expect(results[0].metadata).toMatchObject(metadata);
    });

    it("should handle search query with special characters", async () => {
      await store.addDocument("Content with special chars: @#$%");

      const results = await store.search("@#$%");
      expect(results).toBeDefined();
    });
  });

  describe("Chat Session Management", () => {
    it("should save chat session", async () => {
      const messages = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ];

      await store.saveChatSession("session-1", messages);
      const session = await store.getChatSession("session-1");

      expect(session).not.toBeNull();
      expect(session?.messages).toEqual(messages);
      expect(session?.id).toBe("session-1");
    });

    it("should update existing chat session", async () => {
      const messages1 = [{ role: "user", content: "First" }];
      const messages2 = [
        { role: "user", content: "First" },
        { role: "assistant", content: "Response" },
      ];

      await store.saveChatSession("session-1", messages1);
      await store.saveChatSession("session-1", messages2);

      const session = await store.getChatSession("session-1");
      expect(session?.messages).toEqual(messages2);
    });

    it("should return null for non-existent session", async () => {
      const session = await store.getChatSession("non-existent");
      expect(session).toBeNull();
    });

    it("should get all chat sessions", async () => {
      await store.saveChatSession("session-1", [{ role: "user", content: "Hi" }]);
      await store.saveChatSession("session-2", [{ role: "user", content: "Hello" }]);

      const chats = await store.getAllChats();
      expect(chats.length).toBe(2);
    });

    it("should include timestamp in chat sessions", async () => {
      const before = Date.now();
      await store.saveChatSession("session-1", [{ role: "user", content: "Hi" }]);
      const after = Date.now();

      const session = await store.getChatSession("session-1");
      expect(session?.timestamp).toBeGreaterThanOrEqual(before);
      expect(session?.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("Stats and Clearing", () => {
    it("should return correct stats", async () => {
      await store.addDocument("Doc 1");
      await store.addDocument("Doc 2");
      await store.saveChatSession("s1", []);

      const stats = store.getStats();

      expect(stats).toHaveProperty("documents");
      expect(stats).toHaveProperty("chats");
      expect(stats).toHaveProperty("mode");
      expect(stats.documents).toBe(2);
      expect(stats.chats).toBe(1);
      expect(stats.mode).toContain("IN-MEMORY");
    });

    it("should clear all data", async () => {
      await store.addDocument("Doc 1");
      await store.saveChatSession("s1", []);

      await store.clearAll();

      const stats = store.getStats();
      expect(stats.documents).toBe(0);
      expect(stats.chats).toBe(0);

      const searchResults = await store.search("test");
      expect(searchResults).toEqual([]);

      const chats = await store.getAllChats();
      expect(chats).toEqual([]);
    });

    it("should reset stats after clearing", async () => {
      await store.addDocument("Doc 1");
      await store.addDocument("Doc 2");
      await store.addDocument("Doc 3");

      let stats = store.getStats();
      expect(stats.documents).toBe(3);

      await store.clearAll();

      stats = store.getStats();
      expect(stats.documents).toBe(0);
    });
  });

  describe("Embedding Generation", () => {
    it("should generate consistent embeddings for same content", async () => {
      const id1 = await store.addDocument("same content");
      const id2 = await store.addDocument("same content");

      // Both should be searchable
      const results = await store.search("same content");
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should generate different embeddings for different content", async () => {
      await store.addDocument("JavaScript programming");
      await store.addDocument("Python programming");
      await store.addDocument("Cooking recipes");

      const jsResults = await store.search("JavaScript", 1);
      const pythonResults = await store.search("Python", 1);
      const cookingResults = await store.search("cooking", 1);

      // Each search should find relevant content
      expect(jsResults.length).toBeGreaterThan(0);
      expect(pythonResults.length).toBeGreaterThan(0);
      expect(cookingResults.length).toBeGreaterThan(0);
    });

    it("should handle embedding generation for empty string", async () => {
      const id = await store.addDocument("");
      expect(id).toBeDefined();

      const results = await store.search("");
      expect(results).toBeDefined();
    });
  });

  describe("Cosine Similarity", () => {
    it("should compute correct similarity for identical vectors", async () => {
      await store.addDocument("exact same content");
      await store.addDocument("exact same content");

      const results = await store.search("exact same content", 2);

      // Both documents should have high scores
      expect(results[0].score).toBeGreaterThan(0.9);
      expect(results[1].score).toBeGreaterThan(0.9);
    });

    it("should return lower scores for less relevant content", async () => {
      await store.addDocument("This is about artificial intelligence and machine learning");
      await store.addDocument("This is about cooking and recipes");

      const results = await store.search("artificial intelligence", 2);

      // First result should be more relevant
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });
  });

  describe("Privacy and Security", () => {
    it("should indicate volatile storage mode", () => {
      const stats = store.getStats();
      expect(stats.mode).toContain("volatile");
      expect(stats.warning).toContain("lost when you close");
    });

    it("should not persist data between instances", async () => {
      await store.addDocument("Temporary data");

      // Create new instance
      const newStore = new LocalVectorStore();
      await newStore.init();

      const stats = newStore.getStats();
      expect(stats.documents).toBe(0);
    });
  });
});
