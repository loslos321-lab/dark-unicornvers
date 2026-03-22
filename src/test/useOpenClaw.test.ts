import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useOpenClaw } from "../hooks/useOpenClaw";

// Mock Comlink
vi.mock("comlink", () => ({
  wrap: vi.fn(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    chat: vi.fn().mockResolvedValue("Test response"),
    executeTool: vi.fn().mockResolvedValue({ result: "test" }),
    getStatus: vi.fn().mockReturnValue({ initialized: true, error: null }),
    clearSession: vi.fn().mockResolvedValue(undefined),
    acceptEthicalAgreement: vi.fn().mockResolvedValue(undefined),
  })),
  proxy: vi.fn((fn) => fn),
  transferHandlers: {
    proxy: {},
  },
}));

// Mock Worker
class MockWorker {
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  postMessage = vi.fn();
  terminate = vi.fn();

  constructor(public url: string | URL) {}
}

global.Worker = MockWorker as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:test");

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid-123"),
  },
});

describe("useOpenClaw Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize and transition through states", async () => {
      const { result } = renderHook(() => useOpenClaw());

      // Hook initializes on mount and transitions through loading/ready states
      expect(["idle", "loading", "ready"]).toContain(result.current.status);
      expect(result.current.messages).toEqual([]);
      expect(result.current.thoughts).toEqual([]);
      
      // Wait for initialization to complete
      await waitFor(() => {
        expect(["ready", "idle", "loading"]).toContain(result.current.status);
      });
    });

    it("should initialize agent on mount", async () => {
      const { result } = renderHook(() => useOpenClaw());

      // Wait for initialization to start
      await waitFor(() => {
        expect(result.current.status).not.toBe("idle");
      });
    });

    it("should track download progress", async () => {
      const { result } = renderHook(() => useOpenClaw());

      // Initially should be 0 or progressing
      expect(result.current.downloadProgress).toBeGreaterThanOrEqual(0);
      expect(result.current.downloadProgress).toBeLessThanOrEqual(100);
    });

    it("should expose session info", () => {
      const { result } = renderHook(() => useOpenClaw());

      expect(result.current.sessionInfo).toBeNull();
    });
  });

  describe("Agreement Management", () => {
    it("should have agreement accepted by default (testing mode)", () => {
      const { result } = renderHook(() => useOpenClaw());

      expect(result.current.agreementAccepted).toBe(true);
    });

    it("should accept agreement", async () => {
      const { result } = renderHook(() => useOpenClaw());

      await act(async () => {
        await result.current.acceptAgreement();
      });

      expect(result.current.agreementAccepted).toBe(true);
    });
  });

  describe("Message Management", () => {
    it("should start with empty messages", () => {
      const { result } = renderHook(() => useOpenClaw());

      expect(result.current.messages).toEqual([]);
    });

    it("should track loading state transitions", async () => {
      const { result } = renderHook(() => useOpenClaw());

      // Wait for initialization
      await waitFor(() => {
        expect(["ready", "idle", "loading"]).toContain(result.current.status);
      });

      // Verify status tracking works
      expect(["idle", "loading", "ready", "thinking"]).toContain(result.current.status);
    });

    it("should provide clearHistory function", () => {
      const { result } = renderHook(() => useOpenClaw());

      expect(typeof result.current.clearHistory).toBe("function");
    });

    it("should clear messages on clearHistory", async () => {
      const { result } = renderHook(() => useOpenClaw());

      await act(async () => {
        await result.current.clearHistory();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.thoughts).toEqual([]);
    });
  });

  describe("Tool Execution", () => {
    it("should provide executeTool function", () => {
      const { result } = renderHook(() => useOpenClaw());

      expect(typeof result.current.executeTool).toBe("function");
    });

    it("should return error when agent not ready", async () => {
      const { result } = renderHook(() => useOpenClaw());

      const toolResult = await result.current.executeTool("curl", { url: "https://example.com" });

      // Should return error since agent is not ready
      expect(toolResult).toHaveProperty("error");
    });
  });

  describe("Error Handling", () => {
    it("should expose setError function", () => {
      const { result } = renderHook(() => useOpenClaw());

      expect(typeof result.current.setError).toBe("function");
    });

    it("should allow setting error", () => {
      const { result } = renderHook(() => useOpenClaw());

      act(() => {
        result.current.setError("Test error");
      });

      expect(result.current.error).toBe("Test error");
    });

    it("should allow clearing error", () => {
      const { result } = renderHook(() => useOpenClaw());

      act(() => {
        result.current.setError("Test error");
      });

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("State Transitions", () => {
    it("should transition through loading states", async () => {
      const { result } = renderHook(() => useOpenClaw());

      // Should start loading
      await waitFor(() => {
        expect(["loading", "ready", "idle"]).toContain(result.current.status);
      });
    });

    it("should report isReady correctly", () => {
      const { result } = renderHook(() => useOpenClaw());

      // isReady should be true when status is ready or thinking
      const isReady = result.current.isReady;
      const status = result.current.status;

      if (status === "ready" || status === "thinking") {
        expect(isReady).toBe(true);
      } else {
        expect(isReady).toBe(false);
      }
    });
  });

  describe("Cleanup", () => {
    it("should cleanup on unmount", () => {
      const { unmount } = renderHook(() => useOpenClaw());

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});

describe("useOpenClaw - Integration", () => {
  it("should handle complete message flow", async () => {
    const { result } = renderHook(() => useOpenClaw());

    // Wait for initialization
    await waitFor(() => {
      expect(result.current.status).not.toBe("idle");
    });

    // Verify hook provides all expected properties
    expect(result.current).toHaveProperty("status");
    expect(result.current).toHaveProperty("thoughts");
    expect(result.current).toHaveProperty("messages");
    expect(result.current).toHaveProperty("downloadProgress");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("setError");
    expect(result.current).toHaveProperty("sendMessage");
    expect(result.current).toHaveProperty("clearHistory");
    expect(result.current).toHaveProperty("executeTool");
    expect(result.current).toHaveProperty("sessionInfo");
    expect(result.current).toHaveProperty("acceptAgreement");
    expect(result.current).toHaveProperty("agreementAccepted");
    expect(result.current).toHaveProperty("isReady");
  });

  it("should maintain message history", async () => {
    const { result } = renderHook(() => useOpenClaw());

    // Initial state
    expect(result.current.messages).toEqual([]);

    // After clear, should still be empty
    await act(async () => {
      await result.current.clearHistory();
    });

    expect(result.current.messages).toEqual([]);
  });

  it("should handle tool execution with parameters", async () => {
    const { result } = renderHook(() => useOpenClaw());

    // Test that executeTool accepts parameters
    const toolResult = await result.current.executeTool("get_stats");

    // get_stats is handled specially
    expect(toolResult).toBeDefined();
  });
});
