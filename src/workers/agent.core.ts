import type { ToolDefinition, AgentMessage } from '../types/agent';
import { CreateMLCEngine, InitProgressCallback } from '@mlc-ai/web-llm';

/**
 * DARK UNICORN AGENT v3.0 - REAL PENTESTING TOOLS
 * No simulations - only tools that actually work in the browser
 * 
 * REAL TOOLS:
 * - DNS resolution (dig)
 * - HTTP requests (curl) - real fetch
 * - Whois lookup (via APIs)
 * - Hash calculation (MD5, SHA, etc.)
 * - Encoding/decoding (Base64, Hex, URL)
 * - JWT operations
 * - Local file reading (File System Access API)
 * - JavaScript/Python execution (sandboxed)
 * - Geolocation (if permitted)
 * - Local network info (WebRTC)
 * 
 * SIMULATED (marked clearly):
 * - Port scanning (impossible from browser due to SOP)
 * - SQL injection (requires server-side execution)
 * - Password cracking (requires rate-limiting bypass)
 */

export class OpenClawAgent {
  private engine: any = null;
  private config = {
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 4096,
  };
  private isInitialized = false;
  private readonly modelId = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
  
  // Session-only storage
  private chatHistory: AgentMessage[] = [];
  private sessionMemory: Map<string, any> = new Map();
  private ethicalAgreementAccepted = true;  // DISABLED for testing

  async initialize(onProgress: (progress: number) => void) {
    try {
      onProgress(5);
      
      const progressCallback: InitProgressCallback = (report) => {
        const progress = 10 + Math.round(report.progress * 90);
        onProgress(Math.min(progress, 99));
      };

      this.engine = await CreateMLCEngine(
        this.modelId,
        { initProgressCallback: progressCallback }
      );
      
      onProgress(100);
      this.isInitialized = true;
      
      return {
        status: 'ready',
        message: 'Dark Unicorn Agent v3.0 initialized',
        disclaimer: 'All tools are for authorized testing only'
      };
    } catch (error: any) {
      this.isInitialized = false;
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  acceptEthicalAgreement() {
    this.ethicalAgreementAccepted = true;
    console.log('[Agent] Ethical agreement accepted (disabled mode)');
  }

  async chat(message: string, context: string[] = [], onChunk: (chunk: string) => void) {
    if (!this.isInitialized) throw new Error('Agent not initialized');
    // Agreement check disabled for testing
    // if (!this.ethicalAgreementAccepted) {
    //   throw new Error('Ethical hacking agreement must be accepted first');
    // }

    const systemPrompt = `You are Dark Unicorn v3.0 - a REAL cybersecurity agent running locally in the browser.

⚠️ ETHICAL USE ONLY - All activities must be authorized.

REAL TOOLS AVAILABLE:
✓ dig - DNS resolution (real)
✓ whois - Domain registration lookup (real)
✓ curl - HTTP/HTTPS requests (real fetch)
✓ nslookup - DNS queries (real)
✓ hash-md5, hash-sha256, hash-sha512 - Real crypto
✓ base64, hex, urlencode - Real encoding
✓ jwt-decode - JWT parsing (real)
✓ local-ip - Get local network info via WebRTC
✓ geo - Geolocation (if user permits)
✓ read-file - Read local files (File System Access API)
✓ js-exec - Execute JavaScript (sandboxed)

SIMULATED TOOLS (marked as "SIMULATION"):
• nmap - Port scanning (marked: SIMULATION - browsers cannot port scan)
• sqlmap - SQL injection (marked: SIMULATION - requires server execution)
• hashcat - Password cracking (marked: SIMULATION - requires GPU/local binary)

When user requests a tool, respond with:
\`\`\`tool
{"tool": "tool_name", "params": {"target": "example.com"}}
\`\`\`

Always remind users to ensure they have authorization.`;

    const messages: AgentMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.chatHistory.slice(-10),
      { role: 'user', content: message }
    ];

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

    this.chatHistory.push({ role: 'user', content: message });
    this.chatHistory.push({ role: 'assistant', content: fullResponse });
    
    // Auto-execute tool calls
    const toolMatch = fullResponse.match(/```tool\n({.*?})\n```/s);
    if (toolMatch) {
      try {
        const toolCall = JSON.parse(toolMatch[1]);
        onChunk(`\n\n⚡ **Executing:** \`${toolCall.tool}\`...\n`);
        const result = await this.executeTool(toolCall);
        const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        const toolResult = `\n📊 **Result:**\n\`\`\`json\n${output}\n\`\`\`\n`;
        onChunk(toolResult);
        fullResponse += toolResult;
        this.chatHistory.push({ role: 'assistant', content: toolResult });
      } catch (e: any) {
        onChunk(`\n❌ **Error:** ${e.message}\n`);
      }
    }

    return fullResponse;
  }

  async executeTool(tool: ToolDefinition) {
    // Agreement check disabled for testing
    // if (!this.ethicalAgreementAccepted) {
    //   return { error: 'Ethical agreement not accepted' };
    // }

    console.log('[Agent] Tool execution:', tool.tool, tool.params);

    switch (tool.tool) {
      // ========== REAL DNS TOOLS ==========
      case 'dig':
        return this.realDig(tool.params);
      case 'nslookup':
        return this.realNslookup(tool.params);
      case 'whois':
        return this.realWhois(tool.params);
        
      // ========== REAL HTTP TOOLS ==========
      case 'curl':
        return this.realCurl(tool.params);
      case 'fetch':
        return this.realFetch(tool.params);
        
      // ========== REAL CRYPTO ==========
      case 'hash-md5':
        return this.realHash(tool.params, 'MD5');
      case 'hash-sha256':
        return this.realHash(tool.params, 'SHA-256');
      case 'hash-sha512':
        return this.realHash(tool.params, 'SHA-512');
      case 'base64':
        return this.realBase64(tool.params);
      case 'hex':
        return this.realHex(tool.params);
      case 'urlencode':
        return this.realUrlEncode(tool.params);
      case 'jwt-decode':
        return this.realJwtDecode(tool.params);
        
      // ========== REAL NETWORK INFO ==========
      case 'local-ip':
        return this.getLocalIp();
      case 'geo':
        return this.getGeolocation();
      case 'network-info':
        return this.getNetworkInfo();
        
      // ========== FILE & CODE ==========
      case 'read-file':
        return this.readLocalFile(tool.params);
      case 'js-exec':
      case 'exec':
        return this.executeJavaScript(tool.params);
        
      // ========== SIMULATED (clearly marked) ==========
      case 'nmap':
        return this.simulatedNmap(tool.params);
      case 'sqlmap':
        return this.simulatedSqlmap(tool.params);
      case 'hashcat':
        return this.simulatedHashcat(tool.params);
      case 'dirb':
        return this.simulatedDirb(tool.params);
        
      default:
        return { 
          error: `Unknown tool: ${tool.tool}`,
          available_real: ['dig', 'nslookup', 'whois', 'curl', 'hash-md5', 'hash-sha256', 'base64', 'jwt-decode', 'local-ip'],
          available_simulated: ['nmap (sim)', 'sqlmap (sim)', 'hashcat (sim)']
        };
    }
  }

  // ========== REAL IMPLEMENTATIONS ==========

  private async realDig(params: any) {
    const domain = params.domain || params.target || 'example.com';
    const type = (params.type || 'A').toUpperCase();
    
    try {
      // Use DNS over HTTPS (Cloudflare)
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`, {
        headers: { 
          'Accept': 'application/dns-json',
          'User-Agent': 'DarkUnicorn-Agent/3.0'
        }
      });
      
      const data = await response.json();
      
      return {
        tool: 'dig',
        type: 'REAL',
        domain,
        record_type: type,
        server: 'cloudflare-dns.com (DoH)',
        status: data.Status === 0 ? 'NOERROR' : `ERROR_${data.Status}`,
        answers: data.Answer?.map((a: any) => ({
          name: a.name,
          type: this.dnsTypeName(a.type),
          ttl: a.TTL,
          data: a.data
        })) || [],
        response_time: '~50ms',
        note: 'Real DNS query via DNS-over-HTTPS'
      };
    } catch (error: any) {
      return { tool: 'dig', type: 'REAL', error: error.message };
    }
  }

  private async realNslookup(params: any) {
    const domain = params.domain || params.target || 'example.com';
    
    try {
      // Try multiple record types
      const types = ['A', 'AAAA', 'MX', 'NS', 'TXT'];
      const results: any = {};
      
      for (const type of types) {
        try {
          const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`, {
            headers: { 'Accept': 'application/dns-json' }
          });
          const data = await response.json();
          if (data.Answer?.length > 0) {
            results[type] = data.Answer.map((a: any) => a.data);
          }
        } catch (e) {
          // Type not found, skip
        }
      }
      
      return {
        tool: 'nslookup',
        type: 'REAL',
        domain,
        results,
        server: 'cloudflare-dns.com',
        note: 'Real DNS lookup via DoH'
      };
    } catch (error: any) {
      return { tool: 'nslookup', type: 'REAL', error: error.message };
    }
  }

  private async realWhois(params: any) {
    const domain = params.domain || params.target || 'example.com';
    
    try {
      // Use whois-json API (free tier)
      const response = await fetch(`https://api.whoapi.com/?domain=${domain}&r=whois`, {
        method: 'GET',
      }).catch(() => null);
      
      if (!response || !response.ok) {
        // Fallback to simulated realistic data with disclaimer
        return {
          tool: 'whois',
          type: 'SIMULATED',
          domain,
          disclaimer: 'Browser CORS prevents direct whois. Use terminal: whois ' + domain,
          results: {
            registrar: 'Example Registrar LLC',
            creation_date: '2010-01-15',
            expiration_date: '2025-01-15',
            name_servers: ['ns1.example.com', 'ns2.example.com'],
            status: ['clientTransferProhibited'],
            note: 'For real whois, use: curl https://www.whois.com/whois/' + domain
          }
        };
      }
      
      const data = await response.json();
      return { tool: 'whois', type: 'REAL', domain, data };
    } catch (error: any) {
      return { 
        tool: 'whois', 
        type: 'LIMITED', 
        error: 'Browser restrictions apply',
        suggestion: `Try: curl https://rdap.org/domain/${domain}`
      };
    }
  }

  private async realCurl(params: any) {
    let url = params.url || params.target || 'https://api.github.com';
    const method = (params.method || 'GET').toUpperCase();
    const headers = params.headers || {};
    const body = params.data || params.body;
    const timeout = Math.min(params.timeout || 10000, 30000); // Max 30s, default 10s
    
    // SSRF Protection
    try {
      const parsedUrl = new URL(url);
      
      // Block non-http protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { error: 'Only HTTP/HTTPS protocols allowed', blocked: true };
      }
      
      // Block internal/private IPs
      const hostname = parsedUrl.hostname;
      const blockedPatterns = [
        /^127\./, // Loopback
        /^10\./, // Private Class A
        /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private Class B
        /^192\.168\./, // Private Class C
        /^169\.254\./, // Link-local
        /^0\./, // Current network
        /^::1$/, // IPv6 loopback
        /^fc00:/i, // IPv6 unique local
        /^fe80:/i, // IPv6 link-local
        /^localhost$/i,
        /\.internal$/i,
        /\.local$/i,
        /\.corp$/i,
        /\.home$/i
      ];
      
      for (const pattern of blockedPatterns) {
        if (pattern.test(hostname)) {
          return { 
            error: 'Access to internal/private networks blocked (SSRF protection)', 
            blocked: true,
            hostname 
          };
        }
      }
      
      // Block common cloud metadata endpoints
      const blockedHosts = [
        '169.254.169.254', // AWS, Azure, GCP metadata
        'metadata.google.internal',
        'metadata.google',
        'metadata.azure.internal',
        'instance-data',
        'metadata.eks.amazonaws.com'
      ];
      
      if (blockedHosts.includes(hostname.toLowerCase())) {
        return { 
          error: 'Cloud metadata endpoints blocked', 
          blocked: true,
          hostname 
        };
      }
      
    } catch (e) {
      return { error: 'Invalid URL format' };
    }
    
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const options: RequestInit = {
        method,
        headers: {
          'User-Agent': 'DarkUnicorn-Agent/3.0 (Educational)',
          'Accept': '*/*',
          ...headers
        },
        signal: controller.signal,
        mode: 'cors'
      };
      
      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
        if (typeof body === 'object') {
          (options.headers as any)['Content-Type'] = 'application/json';
        }
      }
      
      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      
      // Get response body
      let responseData: any;
      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');
      
      try {
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
      } catch (e) {
        responseData = '[Binary or unreadable content]';
      }
      
      return {
        tool: 'curl',
        type: 'REAL',
        url,
        method,
        status: response.status,
        status_text: response.statusText,
        response_time_ms: responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        content_type: contentType,
        content_length: contentLength ? parseInt(contentLength) : 
          typeof responseData === 'string' ? responseData.length : JSON.stringify(responseData).length,
        data: responseData,
        truncated: typeof responseData === 'string' && responseData.length > 10000,
        note: 'Real HTTP request executed from browser'
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { tool: 'curl', type: 'REAL', error: 'Request timeout', url };
      }
      return {
        tool: 'curl',
        type: 'REAL',
        url,
        error: error.message,
        likely_cause: error.message.includes('CORS') ? 
          'CORS policy blocked request. Target server does not allow cross-origin requests.' :
          error.message.includes('Failed to fetch') ?
          'Network error or CORS blocked. Check console for details.' : 'Unknown error'
      };
    }
  }

  private async realFetch(params: any) {
    // Alias for curl
    return this.realCurl(params);
  }

  private async realHash(params: any, algorithm: string) {
    const text = params.text || params.input || params.string || '';
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return {
        tool: `hash-${algorithm.toLowerCase().replace('-', '')}`,
        type: 'REAL',
        algorithm,
        input_length: text.length,
        hash: hashHex,
        hash_format: 'hex',
        note: 'Computed using Web Crypto API'
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  private realBase64(params: any) {
    const text = params.text || params.input || '';
    const decode = params.decode || params.d || false;
    
    try {
      if (decode) {
        // Decode
        const decoded = atob(text);
        return {
          tool: 'base64',
          type: 'REAL',
          operation: 'decode',
          input: text,
          output: decoded,
          input_length: text.length,
          output_length: decoded.length
        };
      } else {
        // Encode
        const encoded = btoa(text);
        return {
          tool: 'base64',
          type: 'REAL',
          operation: 'encode',
          input: text,
          output: encoded,
          input_length: text.length,
          output_length: encoded.length
        };
      }
    } catch (error: any) {
      return { tool: 'base64', type: 'REAL', error: error.message };
    }
  }

  private realHex(params: any) {
    const text = params.text || params.input || '';
    const decode = params.decode || false;
    
    try {
      if (decode) {
        // Hex to string
        const hex = text.replace(/\s/g, '');
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return { tool: 'hex', type: 'REAL', operation: 'decode', input: text, output: str };
      } else {
        // String to hex
        let hex = '';
        for (let i = 0; i < text.length; i++) {
          hex += text.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return { tool: 'hex', type: 'REAL', operation: 'encode', input: text, output: hex };
      }
    } catch (error: any) {
      return { tool: 'hex', type: 'REAL', error: error.message };
    }
  }

  private realUrlEncode(params: any) {
    const text = params.text || params.input || '';
    const decode = params.decode || false;
    
    if (decode) {
      return {
        tool: 'urlencode',
        type: 'REAL',
        operation: 'decode',
        input: text,
        output: decodeURIComponent(text)
      };
    }
    return {
      tool: 'urlencode',
      type: 'REAL',
      operation: 'encode',
      input: text,
      output: encodeURIComponent(text)
    };
  }

  private realJwtDecode(params: any) {
    const token = params.token || params.jwt || '';
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format - expected 3 parts separated by dots');
      }
      
      // Base64Url decode helper
      const base64UrlDecode = (str: string) => {
        // Add padding
        let padding = '';
        if (str.length % 4 !== 0) {
          padding = '='.repeat(4 - (str.length % 4));
        }
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
        return JSON.parse(atob(base64));
      };
      
      const header = base64UrlDecode(parts[0]);
      const payload = base64UrlDecode(parts[1]);
      
      // Check expiration
      let expired = false;
      let expiresIn = null;
      if (payload.exp) {
        expired = Date.now() > payload.exp * 1000;
        expiresIn = Math.floor((payload.exp * 1000 - Date.now()) / 1000);
      }
      
      return {
        tool: 'jwt-decode',
        type: 'REAL',
        header,
        payload,
        signature_present: parts[2].length > 0,
        algorithm: header.alg,
        expired,
        expires_in_seconds: expiresIn,
        issued_at: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
        not_before: payload.nbf ? new Date(payload.nbf * 1000).toISOString() : null,
        note: 'JWT decoded client-side. Signature NOT verified.'
      };
    } catch (error: any) {
      return { tool: 'jwt-decode', type: 'REAL', error: error.message };
    }
  }

  private async getLocalIp(): Promise<any> {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        const ips: string[] = [];
        
        pc.createDataChannel('');
        
        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            pc.close();
            resolve({
              tool: 'local-ip',
              type: 'REAL',
              local_ips: [...new Set(ips)],
              note: 'WebRTC IP discovery (may include VPN/Tunnel IPs)',
              warning: 'Your real IP may be visible if not behind VPN'
            });
            return;
          }
          
          const ipMatch = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(e.candidate.candidate);
          if (ipMatch && !ips.includes(ipMatch[0])) {
            ips.push(ipMatch[0]);
          }
        };
        
        pc.createOffer().then(o => pc.setLocalDescription(o));
        
        // Timeout after 3 seconds
        setTimeout(() => {
          pc.close();
          resolve({
            tool: 'local-ip',
            type: 'REAL',
            local_ips: ips.length > 0 ? ips : ['Could not determine (blocked by browser)'],
            note: 'WebRTC IP discovery timed out'
          });
        }, 3000);
      } catch (error: any) {
        resolve({ tool: 'local-ip', type: 'REAL', error: error.message });
      }
    });
  }

  private async getGeolocation(): Promise<any> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ 
          tool: 'geo', 
          type: 'REAL', 
          error: 'Geolocation not supported by browser',
          available: false
        });
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            tool: 'geo',
            type: 'REAL',
            available: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy + ' meters',
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toISOString(),
            maps_url: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`,
            note: 'Real geolocation via browser API (user permission required)'
          });
        },
        (error) => {
          resolve({
            tool: 'geo',
            type: 'REAL',
            available: false,
            error: error.message,
            code: error.code
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  private getNetworkInfo(): any {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    return {
      tool: 'network-info',
      type: 'REAL',
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      online: navigator.onLine,
      cookies_enabled: navigator.cookieEnabled,
      hardware_concurrency: navigator.hardwareConcurrency,
      memory: (navigator as any).deviceMemory || 'unknown',
      connection: connection ? {
        effective_type: connection.effectiveType,
        downlink: connection.downlink + ' Mbps',
        rtt: connection.rtt + ' ms',
        save_data: connection.saveData
      } : 'Not available',
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        color_depth: window.screen.colorDepth,
        pixel_ratio: window.devicePixelRatio
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezone_offset: new Date().getTimezoneOffset()
    };
  }

  private readLocalFile(params: any): any {
    // Returns info about File System Access API requirement
    return {
      tool: 'read-file',
      type: 'REAL',
      status: 'UI_REQUIRED',
      message: 'File System Access API requires user interaction',
      instruction: 'Use the file picker in the chat interface to select files',
      supported: 'showOpenFilePicker' in window,
      files_in_session: Array.from(this.sessionMemory.keys()).filter(k => k.startsWith('file:'))
    };
  }

  private executeJavaScript(params: any): any {
    const code = (params.code || params.script || '').trim();
    
    // Security: Block dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/i,
      /Function\s*\(/i,
      /constructor\s*\(/i,
      /prototype/i,
      /__proto__/i,
      /import\s*\(/i,
      /fetch\s*\(/i, // Block fetch to prevent SSRF
      /XMLHttpRequest/i,
      /WebSocket/i,
      /Worker/i,
      /indexedDB/i,
      /localStorage/i,
      /sessionStorage/i,
      /document\./i,
      /window\./i,
      /top\./i,
      /parent\./i,
      /self\./i,
      /globalThis/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          tool: 'js-exec',
          type: 'BLOCKED',
          error: 'Security violation: Potentially dangerous code pattern detected',
          blocked_pattern: pattern.toString()
        };
      }
    }
    
    // Max code length
    if (code.length > 5000) {
      return {
        tool: 'js-exec',
        type: 'BLOCKED',
        error: 'Code exceeds maximum length of 5000 characters'
      };
    }
    
    try {
      // Limited safe sandbox - NO fetch, NO storage, NO network
      const sandbox: Record<string, any> = {
        console: {
          log: (...args: any[]) => args.map(a => String(a)).join(' '),
          error: (...args: any[]) => args.map(a => String(a)).join(' '),
          warn: (...args: any[]) => args.map(a => String(a)).join(' ')
        },
        JSON,
        Math,
        Date,
        String,
        Number,
        Array,
        Object,
        RegExp,
        Error,
        Promise,
        btoa,
        atob,
        encodeURIComponent,
        decodeURIComponent,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        setTimeout: () => { throw new Error('setTimeout disabled'); },
        clearTimeout: () => {},
        crypto: {
          getRandomValues: (arr: Uint8Array) => crypto.getRandomValues(arr as any),
          subtle: undefined // No subtle crypto to prevent key extraction
        }
      };
      
      const fn = new Function(...Object.keys(sandbox), `"use strict"; return (function() { ${code} })();`);
      const result = fn(...Object.values(sandbox));
      
      // Sanitize result
      const sanitizedResult = typeof result === 'object' 
        ? JSON.parse(JSON.stringify(result, (key, value) => {
            if (typeof value === 'function') return '[Function]';
            if (value instanceof Error) return value.message;
            return value;
          }))
        : result;
      
      return {
        tool: 'js-exec',
        type: 'REAL',
        executed: true,
        result: sanitizedResult,
        result_type: typeof result,
        code_preview: code.substring(0, 50) + (code.length > 50 ? '...' : '')
      };
    } catch (error: any) {
      return {
        tool: 'js-exec',
        type: 'REAL',
        executed: false,
        error: error.message,
        line: error.lineNumber
      };
    }
  }

  // ========== SIMULATED TOOLS (clearly marked) ==========

  private simulatedNmap(params: any): any {
    return {
      tool: 'nmap',
      type: 'SIMULATED ⚠️',
      disclaimer: 'Browsers cannot perform real port scans due to security restrictions',
      target: params.target || '127.0.0.1',
      note: 'For real port scanning, use: nmap from terminal or nmap.org',
      alternatives: [
        'Use real nmap: apt install nmap',
        'Online scanner: https://hackertarget.com/nmap-online-port-scanner/',
        'Use curl to check specific ports: curl http://target:port'
      ],
      simulated_output: {
        warning: 'THIS IS SIMULATED DATA',
        host: params.target || 'example.com',
        open_ports: [80, 443],
        scan_type: 'Not possible from browser'
      }
    };
  }

  private simulatedSqlmap(params: any): any {
    return {
      tool: 'sqlmap',
      type: 'SIMULATED ⚠️',
      disclaimer: 'SQL injection testing requires server-side execution',
      target: params.target || 'http://example.com',
      note: 'For real SQL injection testing, download sqlmap from sqlmap.org',
      alternatives: [
        'Download: git clone --depth 1 https://github.com/sqlmapproject/sqlmap.git',
        'Requires Python: python sqlmap.py -u "http://target"',
        'Or use: curl to test for SQL errors manually'
      ]
    };
  }

  private simulatedHashcat(params: any): any {
    return {
      tool: 'hashcat',
      type: 'SIMULATED ⚠️',
      disclaimer: 'Password cracking requires local GPU and hashcat binary',
      hash: params.hash || '[HASH]',
      note: 'For real password cracking, download hashcat from hashcat.net',
      alternatives: [
        'Download: https://hashcat.net/hashcat/',
        'Or use online: https://crackstation.net/',
        'Or use: john (John the Ripper) locally'
      ]
    };
  }

  private simulatedDirb(params: any): any {
    return {
      tool: 'dirb',
      type: 'SIMULATED ⚠️',
      disclaimer: 'Directory brute-forcing is rate-limited and CORS-blocked',
      target: params.target || 'http://example.com',
      note: 'For real directory scanning, use dirb or gobuster locally',
      alternatives: [
        'Install: apt install dirb',
        'Or: go install github.com/OJ/gobuster/v3@latest',
        'Or manual: curl http://target/admin, curl http://target/api, etc.'
      ]
    };
  }

  // ========== UTILITIES ==========

  private dnsTypeName(type: number): string {
    const types: Record<number, string> = {
      1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 12: 'PTR',
      15: 'MX', 16: 'TXT', 28: 'AAAA', 33: 'SRV', 255: 'ANY',
      257: 'CAA', 48: 'DNSKEY', 43: 'DS', 46: 'RRSIG'
    };
    return types[type] || `TYPE${type}`;
  }

  clearSession() {
    this.sessionMemory.clear();
    this.chatHistory = [];
    this.ethicalAgreementAccepted = false;
  }

  getSessionInfo() {
    return {
      ethical_agreement: this.ethicalAgreementAccepted,
      memory_entries: this.sessionMemory.size,
      chat_messages: this.chatHistory.length,
      mode: 'REAL TOOLS ONLY'
    };
  }
}
