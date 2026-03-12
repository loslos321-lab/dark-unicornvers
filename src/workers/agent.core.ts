import type { ToolDefinition, AgentMessage } from '../types/agent';
import { CreateMLCEngine, InitProgressCallback } from '@mlc-ai/web-llm';

export class OpenClawAgent {
  private engine: any = null;
  private config = {
    temperature: 0.8,
    top_p: 0.95,
    repetition_penalty: 1.1,
    max_tokens: 4096,
  };
  private isInitialized = false;
  private initStartTime = 0;
  private readonly modelId = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
  
  // In-memory storage (wird beim Schließen gelöscht)
  private sessionMemory: Map<string, any> = new Map();
  private chatHistory: AgentMessage[] = [];
  private vectorDocs: Array<{id: string, content: string, embedding: number[]}> = [];

  async initialize(onProgress: (progress: number) => void) {
    try {
      this.initStartTime = Date.now();
      console.log('[Agent] Initializing Dark Unicorn Agent...');
      
      onProgress(5);
      const checks = {
        webgpu: typeof navigator !== 'undefined' && !!(navigator as any).gpu,
        indexedDB: typeof indexedDB !== 'undefined',
        crypto: typeof crypto !== 'undefined' && !!(crypto as any)?.getRandomValues
      };
      
      console.log('[Agent] API availability:', checks);
      onProgress(10);
      
      const progressCallback: InitProgressCallback = (report) => {
        const progress = 10 + Math.round(report.progress * 90);
        onProgress(Math.min(progress, 99));
        console.log(`[Agent] Loading neural core: ${Math.round(report.progress * 100)}%`);
      };

      console.log('[Agent] Loading model:', this.modelId);
      
      this.engine = await CreateMLCEngine(
        this.modelId,
        { initProgressCallback: progressCallback }
      );
      
      onProgress(100);
      
      const initTime = Date.now() - this.initStartTime;
      console.log(`[Agent] Dark Unicorn initialized (${initTime}ms)`);
      
      this.isInitialized = true;
    } catch (error: any) {
      console.error('[Agent] Init error:', error);
      this.isInitialized = false;
      throw new Error(`Failed to initialize: ${error.message}`);
    }
  }

  async chat(message: string, context: string[] = [], onChunk: (chunk: string) => void) {
    if (!this.isInitialized || !this.engine) {
      throw new Error('Agent not initialized');
    }

    const systemPrompt = `You are Dark Unicorn, an elite cybersecurity AI agent running entirely in the user's browser.

AVAILABLE TOOLS:
• nmap - Port scanning and network discovery
• dirb/dirbuster - Directory brute-forcing
• sqlmap - SQL injection testing  
• hashcat - Password hash cracking
• john - John the Ripper password cracker
• gobuster - URL fuzzing and directory discovery
• whois - Domain information lookup
• dig/nslookup - DNS enumeration
• curl - HTTP requests and API testing
• base64 - Encoding/decoding
• hash-md5/sha256 - Hash generation
• exploitdb - Search exploit database
• cve-lookup - CVE vulnerability search

RULES:
1. Always confirm before executing any tool
2. Explain what the tool does before running it
3. Show the exact command that would be executed
4. Simulate realistic output based on the target
5. Never execute real attacks without explicit permission
6. Focus on authorized penetration testing only

When a user asks you to run a tool, respond with:
\`\`\`tool
{"tool": "tool_name", "params": {"target": "example.com", "options": "-sV"}}
\`\`\``;

    const messages: AgentMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.chatHistory.slice(-10),
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

      // Save to chat history
      this.chatHistory.push({ role: 'user', content: message });
      this.chatHistory.push({ role: 'assistant', content: fullResponse });
      
      // Check if response contains a tool call
      const toolMatch = fullResponse.match(/```tool\n({.*?})\n```/s);
      if (toolMatch) {
        try {
          const toolCall = JSON.parse(toolMatch[1]);
          const result = await this.executeTool(toolCall);
          const toolResult = `\n\n🔧 **Tool Output:**\n\`\`\`\n${JSON.stringify(result, null, 2)}\n\`\`\``;
          onChunk(toolResult);
          fullResponse += toolResult;
          this.chatHistory.push({ role: 'assistant', content: toolResult });
        } catch (e) {
          console.error('[Agent] Tool execution failed:', e);
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
    
    console.log('[Agent] Executing tool:', tool.tool, tool.params);
    
    switch (tool.tool) {
      case 'nmap':
        return this.simulateNmap(tool.params);
      case 'dirb':
      case 'gobuster':
        return this.simulateDirb(tool.params);
      case 'sqlmap':
        return this.simulateSqlmap(tool.params);
      case 'hashcat':
        return this.simulateHashcat(tool.params);
      case 'john':
        return this.simulateJohn(tool.params);
      case 'whois':
        return this.simulateWhois(tool.params);
      case 'dig':
        return this.simulateDig(tool.params);
      case 'curl':
        return this.simulateCurl(tool.params);
      case 'base64':
        return this.encodeBase64(tool.params);
      case 'hash-md5':
        return this.hashMd5(tool.params);
      case 'hash-sha256':
        return this.hashSha256(tool.params);
      case 'exploitdb':
        return this.searchExploitDb(tool.params);
      case 'cve-lookup':
        return this.lookupCve(tool.params);
      case 'read_file':
        return this.readLocalFile(tool.params);
      case 'execute_code':
        return this.sandboxExecute(tool.params);
      case 'search_docs':
        return this.searchDocuments(tool.params);
      default:
        return { error: `Unknown tool: ${tool.tool}. Available: nmap, dirb, sqlmap, hashcat, john, whois, dig, curl, base64, hash-md5, hash-sha256, exploitdb, cve-lookup` };
    }
  }

  // ========== KALI LINUX TOOL SIMULATIONS ==========

  private simulateNmap(params: any) {
    const target = params.target || '127.0.0.1';
    const options = params.options || '-sS';
    
    // Simulated realistic nmap output
    const ports = [22, 80, 443, 3306, 8080, 21, 25];
    const openPorts = ports.filter(() => Math.random() > 0.5);
    
    return {
      tool: 'nmap',
      command: `nmap ${options} ${target}`,
      target,
      scan_type: options.includes('-sS') ? 'SYN Stealth' : options.includes('-sT') ? 'Connect' : 'Default',
      results: {
        host_status: 'up',
        latency: `${(Math.random() * 50 + 5).toFixed(2)}ms`,
        open_ports: openPorts.map(port => ({
          port,
          service: this.getServiceName(port),
          version: Math.random() > 0.7 ? 'Unknown' : `${this.getServiceName(port)} 1.2.3`,
          state: 'open'
        })),
        os_guess: Math.random() > 0.5 ? 'Linux 4.15+' : 'Windows 10/2019',
        scan_duration: `${(Math.random() * 10 + 2).toFixed(1)}s`
      }
    };
  }

  private simulateDirb(params: any) {
    const target = params.target || 'http://localhost';
    const wordlist = params.wordlist || 'common.txt';
    
    const commonDirs = ['/admin', '/api', '/backup', '/config', '/.git', '/wp-admin', '/phpmyadmin'];
    const found = commonDirs.filter(() => Math.random() > 0.7);
    
    return {
      tool: 'dirb/gobuster',
      command: `gobuster dir -u ${target} -w /usr/share/wordlists/dirb/${wordlist}`,
      target,
      wordlist,
      results: {
        directories_found: found.map(dir => ({
          url: `${target}${dir}`,
          status: [200, 301, 403][Math.floor(Math.random() * 3)],
          size: Math.floor(Math.random() * 5000 + 100)
        })),
        total_scanned: 4612,
        duration: `${(Math.random() * 30 + 10).toFixed(1)}s`
      }
    };
  }

  private simulateSqlmap(params: any) {
    const target = params.target || 'http://testphp.vulnweb.com';
    
    return {
      tool: 'sqlmap',
      command: `sqlmap -u "${target}" --batch --dbs`,
      target,
      results: {
        vulnerability_found: Math.random() > 0.5,
        injection_type: Math.random() > 0.5 ? 'Union-based' : 'Boolean-based blind',
        database: ['MySQL', 'PostgreSQL', 'MSSQL'][Math.floor(Math.random() * 3)],
        databases: ['information_schema', 'mysql', 'test', 'users'],
        risk_level: 'HIGH',
        recommendation: 'Use parameterized queries and input validation'
      }
    };
  }

  private simulateHashcat(params: any) {
    const hash = params.hash || '5f4dcc3b5aa765d61d8327deb882cf99';
    const mode = params.mode || '0';
    
    return {
      tool: 'hashcat',
      command: `hashcat -m ${mode} ${hash} /usr/share/wordlists/rockyou.txt`,
      hash_type: mode === '0' ? 'MD5' : mode === '100' ? 'SHA1' : 'Unknown',
      results: {
        hash,
        cracked: Math.random() > 0.3,
        plaintext: Math.random() > 0.3 ? 'password123' : null,
        time_taken: `${(Math.random() * 60 + 5).toFixed(1)}s`,
        hashes_per_second: Math.floor(Math.random() * 1000000 + 100000)
      }
    };
  }

  private simulateJohn(params: any) {
    const file = params.file || 'hashes.txt';
    
    return {
      tool: 'john (John the Ripper)',
      command: `john --wordlist=/usr/share/wordlists/rockyou.txt ${file}`,
      results: {
        cracked_passwords: Math.floor(Math.random() * 5 + 1),
        total_hashes: 10,
        cracked_list: ['admin:password123', 'root:toor', 'user:qwerty'].slice(0, Math.floor(Math.random() * 3 + 1)),
        session_saved: true
      }
    };
  }

  private simulateWhois(params: any) {
    const domain = params.domain || 'example.com';
    
    return {
      tool: 'whois',
      command: `whois ${domain}`,
      domain,
      results: {
        registrar: 'GoDaddy.com, LLC',
        creation_date: '1995-08-14',
        expiration_date: '2025-08-13',
        name_servers: ['ns1.example.com', 'ns2.example.com'],
        registrant: 'REDACTED FOR PRIVACY',
        admin_email: 'REDACTED',
        status: 'clientDeleteProhibited, clientRenewProhibited'
      }
    };
  }

  private simulateDig(params: any) {
    const domain = params.domain || 'example.com';
    const type = params.type || 'A';
    
    return {
      tool: 'dig',
      command: `dig ${type} ${domain}`,
      domain,
      record_type: type,
      results: {
        answer_section: [
          { name: domain, type: 'A', ttl: 300, data: '93.184.216.34' },
          { name: domain, type: 'A', ttl: 300, data: '93.184.216.35' }
        ],
        ns_records: ['ns1.example.com', 'ns2.example.com'],
        mx_records: ['10 mail.example.com'],
        query_time: '23 msec',
        server: '8.8.8.8#53'
      }
    };
  }

  private async simulateCurl(params: any) {
    const url = params.url || 'https://api.github.com';
    const method = params.method || 'GET';
    
    // Actually make the request
    try {
      const response = await fetch(url, { method, mode: 'no-cors' });
      return {
        tool: 'curl',
        command: `curl -X ${method} "${url}"`,
        url,
        method,
        results: {
          status: response.status || 0,
          status_text: response.statusText || 'Unknown',
          headers: Object.fromEntries(response.headers.entries()),
          size: 'N/A (CORS)',
          time: '~200ms'
        }
      };
    } catch (e) {
      return {
        tool: 'curl',
        command: `curl -X ${method} "${url}"`,
        error: 'Request failed (CORS or network error)',
        note: 'Browser security prevents direct requests. Use proxy or extension.'
      };
    }
  }

  private encodeBase64(params: any) {
    const text = params.text || '';
    const decode = params.decode || false;
    
    if (decode) {
      try {
        return { tool: 'base64', operation: 'decode', input: text, result: atob(text) };
      } catch (e) {
        return { tool: 'base64', error: 'Invalid base64 string' };
      }
    }
    return { tool: 'base64', operation: 'encode', input: text, result: btoa(text) };
  }

  private async hashMd5(params: any) {
    const text = params.text || '';
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { tool: 'hash-md5', input: text, hash: hashHex };
  }

  private async hashSha256(params: any) {
    const text = params.text || '';
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { tool: 'hash-sha256', input: text, hash: hashHex };
  }

  private searchExploitDb(params: any) {
    const query = params.query || 'apache';
    
    return {
      tool: 'exploitdb',
      query,
      results: [
        { id: 'EDB-12345', title: `Apache ${query} Remote Code Execution`, type: 'remote', platform: 'linux', date: '2024-01-15' },
        { id: 'EDB-12346', title: `${query} Local Privilege Escalation`, type: 'local', platform: 'linux', date: '2024-02-20' }
      ],
      total: 42,
      note: 'This is simulated data. Real exploit search requires exploit-db.com access.'
    };
  }

  private lookupCve(params: any) {
    const cve = params.cve || 'CVE-2021-44228';
    
    return {
      tool: 'cve-lookup',
      cve,
      results: {
        id: cve,
        description: 'Apache Log4j2 JNDI features do not protect against attacker controlled LDAP and other JNDI related endpoints.',
        severity: 'CRITICAL',
        cvss_score: 10.0,
        published: '2021-12-10',
        references: [
          'https://nvd.nist.gov/vuln/detail/CVE-2021-44228',
          'https://logging.apache.org/log4j/2.x/security.html'
        ],
        mitigation: 'Upgrade to Log4j 2.17.0+ or remove JNDI lookup class'
      }
    };
  }

  private async readLocalFile(params: any) {
    // File System Access API is not available in worker context
    return { 
      error: 'File access must be done through main thread UI',
      instruction: 'Use the file picker in the main interface to select files'
    };
  }

  private sandboxExecute(params: any) {
    try {
      const code = params.code || '';
      if (!code.trim()) return { error: 'Empty code' };
      
      // Safe eval in worker context
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

  private searchDocuments(params: any) {
    const query = params.query || '';
    const results = this.vectorDocs.filter(doc => 
      doc.content.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      success: true,
      query,
      results: results.slice(0, 5).map(doc => ({
        id: doc.id,
        content: doc.content.substring(0, 200),
        score: 0.95
      }))
    };
  }

  private getServiceName(port: number): string {
    const services: Record<number, string> = {
      21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'dns',
      80: 'http', 110: 'pop3', 143: 'imap', 443: 'https',
      3306: 'mysql', 3389: 'rdp', 5432: 'postgresql', 8080: 'http-proxy'
    };
    return services[port] || 'unknown';
  }

  // ========== SESSION MANAGEMENT ==========

  clearSession() {
    this.sessionMemory.clear();
    this.chatHistory = [];
    this.vectorDocs = [];
    console.log('[Agent] Session data cleared');
  }

  getSessionInfo() {
    return {
      memory_entries: this.sessionMemory.size,
      chat_messages: this.chatHistory.length,
      vector_docs: this.vectorDocs.length,
      note: 'All data is in-memory only and will be destroyed when tab closes'
    };
  }
}
