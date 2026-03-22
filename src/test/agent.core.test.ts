import { describe, it, expect, beforeEach, vi } from "vitest";
import { OpenClawAgent } from "../workers/agent.core";

// Mock WebLLM
vi.mock("@mlc-ai/web-llm", () => ({
  CreateMLCEngine: vi.fn().mockResolvedValue({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: "Test response" } }] };
          },
        }),
      },
    },
  }),
}));

describe("OpenClawAgent - Core Functionality", () => {
  let agent: OpenClawAgent;

  beforeEach(() => {
    agent = new OpenClawAgent();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      const onProgress = vi.fn();
      const result = await agent.initialize(onProgress);

      expect(result.status).toBe("ready");
      expect(result.message).toContain("Dark Unicorn");
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it("should call progress callback during initialization", async () => {
      const onProgress = vi.fn();
      await agent.initialize(onProgress);

      expect(onProgress).toHaveBeenCalledWith(5);
      expect(onProgress).toHaveBeenCalledWith(100);
    });
  });

  describe("Session Management", () => {
    it("should clear session data", async () => {
      await agent.initialize(vi.fn());
      agent.clearSession();

      const info = (agent as any).getSessionInfo();
      expect(info.memory_entries).toBe(0);
      expect(info.chat_messages).toBe(0);
    });

    it("should get session info", async () => {
      await agent.initialize(vi.fn());
      const info = (agent as any).getSessionInfo();

      expect(info).toHaveProperty("ethical_agreement");
      expect(info).toHaveProperty("memory_entries");
      expect(info).toHaveProperty("chat_messages");
      expect(info).toHaveProperty("mode");
    });
  });
});

describe("OpenClawAgent - Real DNS Tools", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  describe("dig tool", () => {
    it("should perform DNS query with default parameters", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          Status: 0,
          Answer: [{ name: "example.com", type: 1, TTL: 300, data: "93.184.216.34" }],
        }),
      } as any);

      const result = await (agent as any).executeTool({ tool: "dig", params: {} });

      expect(result.tool).toBe("dig");
      expect(result.type).toBe("REAL");
      expect(result.domain).toBe("example.com");
      expect(result.record_type).toBe("A");
    });

    it("should perform DNS query with custom domain and type", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          Status: 0,
          Answer: [{ name: "google.com", type: 15, TTL: 600, data: "10 mail.google.com" }],
        }),
      } as any);

      const result = await (agent as any).executeTool({
        tool: "dig",
        params: { domain: "google.com", type: "MX" },
      });

      expect(result.domain).toBe("google.com");
      expect(result.record_type).toBe("MX");
    });

    it("should handle DNS query errors gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await (agent as any).executeTool({
        tool: "dig",
        params: { domain: "invalid.domain.xyz" },
      });

      expect(result.tool).toBe("dig");
      expect(result.type).toBe("REAL");
      expect(result.error).toBeDefined();
    });
  });

  describe("nslookup tool", () => {
    it("should perform multi-type DNS lookup", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          Answer: [{ data: "93.184.216.34" }],
        }),
      } as any);

      const result = await (agent as any).executeTool({
        tool: "nslookup",
        params: { domain: "example.com" },
      });

      expect(result.tool).toBe("nslookup");
      expect(result.type).toBe("REAL");
      expect(result.domain).toBe("example.com");
      expect(result.results).toBeDefined();
    });
  });
});

describe("OpenClawAgent - HTTP Tools", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  describe("curl tool", () => {
    it("should make HTTP GET request", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: vi.fn().mockResolvedValue({ test: "data" }),
      } as any);

      const result = await (agent as any).executeTool({
        tool: "curl",
        params: { url: "https://api.example.com/test" },
      });

      expect(result.tool).toBe("curl");
      expect(result.type).toBe("REAL");
      expect(result.status).toBe(200);
      expect(result.data).toEqual({ test: "data" });
    });

    it("should block internal IP addresses (SSRF protection)", async () => {
      const internalUrls = [
        "http://127.0.0.1/admin",
        "http://10.0.0.1/config",
        "http://192.168.1.1/router",
        "http://localhost:8080/api",
        "http://169.254.169.254/metadata",
      ];

      for (const url of internalUrls) {
        const result = await (agent as any).executeTool({
          tool: "curl",
          params: { url },
        });

        expect(result.blocked).toBe(true);
        expect(result.error).toContain("blocked");
      }
    });

    it("should block non-HTTP protocols", async () => {
      const result = await (agent as any).executeTool({
        tool: "curl",
        params: { url: "ftp://ftp.example.com/file" },
      });

      expect(result.blocked).toBe(true);
      expect(result.error).toContain("Only HTTP/HTTPS");
    });

    it("should handle timeout", async () => {
      global.fetch = vi.fn().mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("AbortError")), 100);
        })
      );

      const result = await (agent as any).executeTool({
        tool: "curl",
        params: { url: "https://slow.example.com", timeout: 50 },
      });

      // Should handle the error gracefully
      expect(result.error).toBeDefined();
    });

    it("should include response time", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        statusText: "OK",
        headers: new Headers({}),
        text: vi.fn().mockResolvedValue("response"),
      } as any);

      const result = await (agent as any).executeTool({
        tool: "curl",
        params: { url: "https://example.com" },
      });

      expect(result.response_time_ms).toBeDefined();
      expect(typeof result.response_time_ms).toBe("number");
      expect(result.response_time_ms).toBeGreaterThanOrEqual(0);
    });
  });

  describe("fetch tool", () => {
    it("should be an alias for curl", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        headers: new Headers({}),
        text: vi.fn().mockResolvedValue("response"),
      } as any);

      const result = await (agent as any).executeTool({
        tool: "fetch",
        params: { url: "https://example.com" },
      });

      expect(result.tool).toBe("curl");
    });
  });
});

describe("OpenClawAgent - Crypto Tools", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  describe("hash tools", () => {
    it("should calculate MD5 hash", async () => {
      const result = await (agent as any).executeTool({
        tool: "hash-md5",
        params: { text: "hello" },
      });

      expect(result.tool).toBe("hash-md5");
      expect(result.type).toBe("REAL");
      expect(result.algorithm).toBe("MD5");
      // Hash may be in 'hash' or 'output' property
      const hashValue = result.hash || result.output;
      expect(hashValue).toMatch(/^[a-f0-9]{32}$/i);
    });

    it("should calculate SHA-256 hash", async () => {
      const result = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text: "hello world" },
      });

      expect(result.tool).toBe("hash-sha256");
      expect(result.algorithm).toBe("SHA-256");
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should calculate SHA-512 hash", async () => {
      const result = await (agent as any).executeTool({
        tool: "hash-sha512",
        params: { text: "test" },
      });

      expect(result.tool).toBe("hash-sha512");
      expect(result.algorithm).toBe("SHA-512");
      expect(result.hash).toMatch(/^[a-f0-9]{128}$/);
    });

    it("should produce consistent hashes for same input", async () => {
      const result1 = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text: "consistent" },
      });

      const result2 = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text: "consistent" },
      });

      expect(result1.hash).toBe(result2.hash);
    });

    it("should produce different hashes for different inputs", async () => {
      const result1 = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text: "input1" },
      });

      const result2 = await (agent as any).executeTool({
        tool: "hash-sha256",
        params: { text: "input2" },
      });

      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  describe("base64 tool", () => {
    it("should encode text to base64", async () => {
      const result = await (agent as any).executeTool({
        tool: "base64",
        params: { text: "hello world" },
      });

      expect(result.tool).toBe("base64");
      expect(result.type).toBe("REAL");
      expect(result.operation).toBe("encode");
      expect(result.output).toBe("aGVsbG8gd29ybGQ=");
    });

    it("should decode base64 to text", async () => {
      const result = await (agent as any).executeTool({
        tool: "base64",
        params: { text: "aGVsbG8gd29ybGQ=", decode: true },
      });

      expect(result.operation).toBe("decode");
      expect(result.output).toBe("hello world");
    });

    it("should handle invalid base64 on decode", async () => {
      const result = await (agent as any).executeTool({
        tool: "base64",
        params: { text: "!!!invalid!!!", decode: true },
      });

      expect(result.error).toBeDefined();
    });
  });

  describe("hex tool", () => {
    it("should encode text to hex", async () => {
      const result = await (agent as any).executeTool({
        tool: "hex",
        params: { text: "AB" },
      });

      expect(result.tool).toBe("hex");
      expect(result.operation).toBe("encode");
      expect(result.output).toBe("4142");
    });

    it("should decode hex to text", async () => {
      const result = await (agent as any).executeTool({
        tool: "hex",
        params: { text: "4142", decode: true },
      });

      expect(result.operation).toBe("decode");
      expect(result.output).toBe("AB");
    });

    it("should handle hex with whitespace", async () => {
      const result = await (agent as any).executeTool({
        tool: "hex",
        params: { text: "41 42 43", decode: true },
      });

      expect(result.output).toBe("ABC");
    });
  });

  describe("urlencode tool", () => {
    it("should encode URL components", async () => {
      const result = await (agent as any).executeTool({
        tool: "urlencode",
        params: { text: "hello world!" },
      });

      expect(result.operation).toBe("encode");
      expect(result.output).toBe("hello%20world!");
    });

    it("should decode URL components", async () => {
      const result = await (agent as any).executeTool({
        tool: "urlencode",
        params: { text: "hello%20world%21", decode: true },
      });

      expect(result.operation).toBe("decode");
      expect(result.output).toBe("hello world!");
    });
  });

  describe("jwt-decode tool", () => {
    it("should decode valid JWT", async () => {
      // Sample JWT: {"alg":"HS256","typ":"JWT"}.{"sub":"1234567890","name":"Test"}
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QifQ.signature";

      const result = await (agent as any).executeTool({
        tool: "jwt-decode",
        params: { token },
      });

      expect(result.tool).toBe("jwt-decode");
      expect(result.type).toBe("REAL");
      expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
      expect(result.payload).toEqual({ sub: "1234567890", name: "Test" });
      expect(result.algorithm).toBe("HS256");
    });

    it("should detect expired JWT", async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = btoa(JSON.stringify({ exp: pastTime }));
      const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`;

      const result = await (agent as any).executeTool({
        tool: "jwt-decode",
        params: { token },
      });

      expect(result.expired).toBe(true);
      expect(result.expires_in_seconds).toBeLessThan(0);
    });

    it("should reject invalid JWT format", async () => {
      const result = await (agent as any).executeTool({
        tool: "jwt-decode",
        params: { token: "invalid.token" },
      });

      expect(result.error).toContain("Invalid JWT format");
    });
  });
});

describe("OpenClawAgent - Network Info Tools", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  describe("network-info tool", () => {
    it("should return browser network information", async () => {
      const result = await (agent as any).executeTool({
        tool: "network-info",
        params: {},
      });

      expect(result.tool).toBe("network-info");
      expect(result.type).toBe("REAL");
      expect(result.user_agent).toBeDefined();
      expect(result.platform).toBeDefined();
      expect(result.language).toBeDefined();
      expect(result.online).toBeDefined();
      expect(result.screen).toBeDefined();
      expect(result.timezone).toBeDefined();
    });

    it("should return consistent structure", async () => {
      const result = await (agent as any).executeTool({
        tool: "network-info",
        params: {},
      });

      expect(result.screen).toHaveProperty("width");
      expect(result.screen).toHaveProperty("height");
      expect(result.screen).toHaveProperty("color_depth");
      expect(result.screen).toHaveProperty("pixel_ratio");
    });
  });

  describe("geo tool", () => {
    it("should handle geolocation not supported", async () => {
      // Remove geolocation
      const originalGeo = navigator.geolocation;
      Object.defineProperty(navigator, "geolocation", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const result = await (agent as any).executeTool({
        tool: "geo",
        params: {},
      });

      expect(result.tool).toBe("geo");
      expect(result.error).toContain("not supported");

      // Restore
      Object.defineProperty(navigator, "geolocation", {
        value: originalGeo,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("local-ip tool", () => {
    it("should attempt WebRTC IP discovery", async () => {
      // Mock RTCPeerConnection
      const mockCreateOffer = vi.fn().mockResolvedValue({});
      const mockSetLocalDescription = vi.fn().mockResolvedValue(undefined);
      const mockClose = vi.fn();

      global.RTCPeerConnection = vi.fn().mockImplementation(() => ({
        createDataChannel: vi.fn(),
        createOffer: mockCreateOffer,
        setLocalDescription: mockSetLocalDescription,
        close: mockClose,
        onicecandidate: null,
      })) as any;

      const resultPromise = (agent as any).executeTool({
        tool: "local-ip",
        params: {},
      });

      // Wait for timeout
      const result = await resultPromise;

      expect(result.tool).toBe("local-ip");
      expect(result.type).toBe("REAL");
    });
  });
});

describe("OpenClawAgent - JavaScript Execution", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  describe("js-exec tool", () => {
    it("should execute safe JavaScript code", async () => {
      const result = await (agent as any).executeTool({
        tool: "js-exec",
        params: { code: "return 2 + 2" },
      });

      expect(result.tool).toBe("js-exec");
      expect(result.type).toBe("REAL");
      expect(result.executed).toBe(true);
      expect(result.result).toBe(4);
    });

    it("should provide sandboxed environment", async () => {
      const result = await (agent as any).executeTool({
        tool: "js-exec",
        params: { code: "return typeof Math.random()" },
      });

      // Should either return "function" or be blocked
      expect(result.result === "function" || result.type === "BLOCKED").toBe(true);
    });

    it("should block dangerous code patterns", async () => {
      const dangerousCodes = [
        { code: "eval('alert(1)')", pattern: "eval" },
        { code: "fetch('http://evil.com')", pattern: "fetch" },
        { code: "localStorage.getItem('key')", pattern: "localStorage" },
        { code: "document.cookie", pattern: "document" },
        { code: "window.location", pattern: "window" },
      ];

      for (const { code, pattern } of dangerousCodes) {
        const result = await (agent as any).executeTool({
          tool: "js-exec",
          params: { code },
        });

        expect(result.type).toBe("BLOCKED");
        expect(result.error).toContain("Security violation");
      }
    });

    it("should block code exceeding max length", async () => {
      const longCode = "x + ".repeat(2000);

      const result = await (agent as any).executeTool({
        tool: "js-exec",
        params: { code: longCode },
      });

      expect(result.type).toBe("BLOCKED");
      expect(result.error).toContain("exceeds maximum length");
    });

    it("should handle runtime errors gracefully", async () => {
      const result = await (agent as any).executeTool({
        tool: "js-exec",
        params: { code: "return undefinedVariable.property" },
      });

      expect(result.executed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should provide console.log functionality", async () => {
      const result = await (agent as any).executeTool({
        tool: "js-exec",
        params: { code: "console.log('test'); return 'done'" },
      });

      expect(result.executed).toBe(true);
      expect(result.result).toBe("done");
    });
  });
});

describe("OpenClawAgent - Simulated Tools", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  describe("nmap tool", () => {
    it("should return simulated response with disclaimer", async () => {
      const result = await (agent as any).executeTool({
        tool: "nmap",
        params: { target: "example.com" },
      });

      expect(result.tool).toBe("nmap");
      expect(result.type).toContain("SIMULATED");
      expect(result.disclaimer).toContain("Browsers cannot");
      expect(result.alternatives).toBeDefined();
    });
  });

  describe("sqlmap tool", () => {
    it("should return simulated response with disclaimer", async () => {
      const result = await (agent as any).executeTool({
        tool: "sqlmap",
        params: { target: "http://example.com" },
      });

      expect(result.tool).toBe("sqlmap");
      expect(result.type).toContain("SIMULATED");
      expect(result.disclaimer).toContain("SQL injection");
    });
  });

  describe("hashcat tool", () => {
    it("should return simulated response with disclaimer", async () => {
      const result = await (agent as any).executeTool({
        tool: "hashcat",
        params: { hash: "abc123" },
      });

      expect(result.tool).toBe("hashcat");
      expect(result.type).toContain("SIMULATED");
      expect(result.disclaimer.toLowerCase()).toContain("password");
    });
  });

  describe("dirb tool", () => {
    it("should return simulated response with disclaimer", async () => {
      const result = await (agent as any).executeTool({
        tool: "dirb",
        params: { target: "http://example.com" },
      });

      expect(result.tool).toBe("dirb");
      expect(result.type).toContain("SIMULATED");
    });
  });
});

describe("OpenClawAgent - Unknown Tools", () => {
  let agent: OpenClawAgent;

  beforeEach(async () => {
    agent = new OpenClawAgent();
    await agent.initialize(vi.fn());
  });

  it("should return helpful error for unknown tools", async () => {
    const result = await (agent as any).executeTool({
      tool: "unknown-tool",
      params: {},
    });

    expect(result.error).toContain("Unknown tool");
    expect(result.available_real).toBeDefined();
    expect(result.available_simulated).toBeDefined();
    expect(Array.isArray(result.available_real)).toBe(true);
    expect(Array.isArray(result.available_simulated)).toBe(true);
  });
});
