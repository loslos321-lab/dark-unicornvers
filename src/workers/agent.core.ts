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
  
  // In-memory storage
  private sessionMemory: Map<string, any> = new Map();
  private chatHistory: AgentMessage[] = [];
  private vectorDocs: Array<{id: string, content: string, embedding: number[]}> = [];
  
  // Dynamic tools loaded from GitHub
  private dynamicTools: Map<string, Function> = new Map();
  private installedTools: Array<{name: string, source: string, version: string}> = [];

  async initialize(onProgress: (progress: number) => void) {
    try {
      this.initStartTime = Date.now();
      console.log('[Agent] Initializing Dark Unicorn Agent v2.0...');
      
      onProgress(5);
      const checks = {
        webgpu: typeof navigator !== 'undefined' && !!(navigator as any).gpu,
        indexedDB: typeof indexedDB !== 'undefined',
        crypto: typeof crypto !== 'undefined' && !!(crypto as any)?.getRandomValues,
        fetch: typeof fetch !== 'undefined'
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
      console.log(`[Agent] Dark Unicorn v2.0 initialized (${initTime}ms)`);
      
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

    const systemPrompt = `You are Dark Unicorn v2.0, an elite cybersecurity AI agent with FULL INTERNET ACCESS and dynamic tool loading capabilities.

INTERNET ACCESS:
- Can fetch any URL via fetch/http commands
- Can download and execute scripts from GitHub
- Can query APIs and external services
- CORS-aware: Uses proxy techniques when needed

AVAILABLE TOOLS:
Network & Recon:
• nmap, masscan - Port scanning
• dirb, gobuster - Directory brute-forcing
• sqlmap - SQL injection testing
• curl, wget - HTTP requests with full internet access
• whois, dig, nslookup - DNS/Domain recon

Crypto & Cracking:
• hashcat, john - Password cracking
• hash-md5, hash-sha256, hash-bcrypt - Hashing
• base64, hex, urlencode - Encoding
• jwt-decode, jwt-sign - JWT operations

GitHub & Dynamic Tools:
• github-clone - Clone any GitHub repo
• github-raw - Fetch raw files from GitHub
• install-tool - Install tools from GitHub releases
• run-script - Execute downloaded scripts
• pip-install - Install Python packages (simulated)
• npm-install - Install Node packages (simulated)

System & CLI:
• exec - Execute shell commands (simulated)
• python - Run Python code
• node - Run Node.js code
• bash - Run bash scripts

OSINT:
• shodan - Shodan search (via API)
• censys - Censys search (via API)
• theHarvester - Email/domain harvesting
• sherlock - Username lookup

When a user asks you to run a tool, respond with:
\`\`\`tool
{"tool": "tool_name", "params": {"target": "example.com", "options": "-sV"}}
\`\`\`

INTERNET RULES:
1. Always respect robots.txt
2. Never DDoS or brute-force without permission
3. Use rate limiting
4. Report CORS errors with workaround suggestions`;

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
          onChunk(`\n\n⚡ **Executing:** \`${toolCall.tool}\`...\n`);
          const result = await this.executeTool(toolCall);
          const toolResult = `\n📊 **Output:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n`;
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
    
    // Check if it's a dynamic tool first
    if (this.dynamicTools.has(tool.tool)) {
      const dynamicTool = this.dynamicTools.get(tool.tool)!;
      return await dynamicTool(tool.params);
    }
    
    switch (tool.tool) {
      // Network Tools
      case 'nmap':
        return this.simulateNmap(tool.params);
      case 'masscan':
        return this.simulateMasscan(tool.params);
      case 'dirb':
      case 'gobuster':
        return this.simulateDirb(tool.params);
      case 'sqlmap':
        return this.simulateSqlmap(tool.params);
      case 'curl':
        return this.executeCurl(tool.params);
      case 'wget':
        return this.executeWget(tool.params);
      case 'whois':
        return this.simulateWhois(tool.params);
      case 'dig':
        return this.simulateDig(tool.params);
        
      // Crypto Tools
      case 'hashcat':
        return this.simulateHashcat(tool.params);
      case 'john':
        return this.simulateJohn(tool.params);
      case 'hash-md5':
        return this.hashMd5(tool.params);
      case 'hash-sha256':
        return this.hashSha256(tool.params);
      case 'hash-bcrypt':
        return this.hashBcrypt(tool.params);
      case 'base64':
        return this.encodeBase64(tool.params);
      case 'jwt-decode':
        return this.jwtDecode(tool.params);
        
      // GitHub & Dynamic Loading
      case 'github-clone':
        return this.githubClone(tool.params);
      case 'github-raw':
        return this.githubRaw(tool.params);
      case 'install-tool':
        return this.installTool(tool.params);
      case 'run-script':
        return this.runScript(tool.params);
      case 'list-tools':
        return { installed: this.installedTools };
        
      // Code Execution
      case 'exec':
      case 'bash':
        return this.executeBash(tool.params);
      case 'python':
        return this.executePython(tool.params);
      case 'node':
        return this.executeNode(tool.params);
      case 'execute_code':
        return this.sandboxExecute(tool.params);
        
      // OSINT
      case 'exploitdb':
        return this.searchExploitDb(tool.params);
      case 'cve-lookup':
        return this.lookupCve(tool.params);
      case 'shodan':
        return this.queryShodan(tool.params);
      case 'sherlock':
        return this.sherlockLookup(tool.params);
        
      // File Operations
      case 'read_file':
        return this.readLocalFile(tool.params);
      case 'search_docs':
        return this.searchDocuments(tool.params);
        
      default:
        return { 
          error: `Unknown tool: ${tool.tool}`,
          available: ['nmap', 'curl', 'github-clone', 'exec', 'python', 'install-tool', 'list-tools'],
          suggestion: 'Use list-tools to see all available tools'
        };
    }
  }

  // ========== INTERNET & NETWORK TOOLS ==========

  private async executeCurl(params: any) {
    const url = params.url || params.target || 'https://api.github.com';
    const method = (params.method || params.X || 'GET').toUpperCase();
    const headers = params.headers || {};
    const body = params.data || params.body;
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'User-Agent': 'DarkUnicorn-Agent/2.0',
          ...headers
        },
        mode: 'cors'
      };
      
      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      
      let responseData;
      const contentType = response.headers.get('content-type') || '';
      
      try {
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
      } catch (e) {
        responseData = await response.text();
      }
      
      return {
        tool: 'curl',
        command: `curl -X ${method} "${url}"`,
        url,
        method,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        size: typeof responseData === 'string' ? responseData.length : JSON.stringify(responseData).length,
        success: response.ok
      };
    } catch (error: any) {
      return {
        tool: 'curl',
        url,
        error: error.message,
        suggestion: 'CORS error? Try using a CORS proxy or check if the server allows cross-origin requests'
      };
    }
  }

  private async executeWget(params: any) {
    const url = params.url || params.target;
    if (!url) return { error: 'URL required' };
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'DarkUnicorn-Agent/2.0' }
      });
      
      const content = await response.text();
      const filename = url.split('/').pop() || 'download';
      
      // Store in memory
      this.sessionMemory.set(`file:${filename}`, content);
      
      return {
        tool: 'wget',
        url,
        filename,
        size: content.length,
        saved: true,
        preview: content.substring(0, 500)
      };
    } catch (error: any) {
      return { tool: 'wget', error: error.message };
    }
  }

  // ========== GITHUB INTEGRATION ==========

  private async githubClone(params: any) {
    const repo = params.repo || params.repository;
    if (!repo) return { error: 'Repository required (format: owner/repo)' };
    
    const branch = params.branch || 'main';
    const url = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DarkUnicorn-Agent/2.0'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.message || 'Failed to fetch repository' };
      }
      
      const files = data.tree.filter((item: any) => item.type === 'blob').slice(0, 50);
      
      return {
        tool: 'github-clone',
        repository: repo,
        branch,
        totalFiles: data.tree.length,
        files: files.map((f: any) => ({ path: f.path, size: f.size })),
        note: 'Repository metadata fetched. Use github-raw to download specific files.'
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  private async githubRaw(params: any) {
    const repo = params.repo;
    const path = params.path || params.file;
    const branch = params.branch || 'main';
    
    if (!repo || !path) {
      return { error: 'Repository and path required' };
    }
    
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
    
    try {
      const response = await fetch(url);
      const content = await response.text();
      
      this.sessionMemory.set(`github:${repo}/${path}`, content);
      
      return {
        tool: 'github-raw',
        source: url,
        size: content.length,
        content: content.substring(0, 2000),
        truncated: content.length > 2000
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  private async installTool(params: any) {
    const name = params.name || params.tool;
    const source = params.source || params.github || params.url;
    
    if (!name || !source) {
      return { error: 'Tool name and source required' };
    }
    
    try {
      let toolCode;
      
      if (source.includes('github.com') || source.includes('raw.githubusercontent.com')) {
        const rawUrl = source.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        const response = await fetch(rawUrl);
        toolCode = await response.text();
      } else {
        const response = await fetch(source);
        toolCode = await response.text();
      }
      
      // Create dynamic tool function
      const toolFn = new Function('params', `
        "use strict";
        ${toolCode}
      `);
      
      this.dynamicTools.set(name, toolFn);
      this.installedTools.push({ name, source, version: params.version || 'latest' });
      
      return {
        tool: 'install-tool',
        name,
        source,
        size: toolCode.length,
        installed: true,
        message: `Tool '${name}' installed successfully. Use it with: {"tool": "${name}", "params": {...}}`
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  private async runScript(params: any) {
    const name = params.name || params.script;
    const scriptParams = params.params || {};
    
    if (!this.dynamicTools.has(name)) {
      return { 
        error: `Script '${name}' not found`,
        installed: Array.from(this.dynamicTools.keys())
      };
    }
    
    try {
      const toolFn = this.dynamicTools.get(name)!;
      const result = await toolFn(scriptParams);
      return {
        tool: 'run-script',
        script: name,
        result
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // ========== CODE EXECUTION ==========

  private executePython(params: any) {
    const code = params.code || params.script || '';
    
    // Python simulation using JavaScript
    const pyGlobals: any = {
      print: (...args: any[]) => args.join(' '),
      len: (x: any) => x.length,
      range: (n: number) => Array.from({length: n}, (_, i) => i),
      str: (x: any) => String(x),
      int: (x: any) => parseInt(x),
      dict: Object,
      list: Array,
      True: true,
      False: false,
      None: null,
      requests: {
        get: (url: string) => this.executeCurl({ url, method: 'GET' }),
        post: (url: string, data: any) => this.executeCurl({ url, method: 'POST', body: data })
      },
      json: JSON,
      re: {
        search: (pattern: string, text: string) => text.match(new RegExp(pattern)),
        findall: (pattern: string, text: string) => text.match(new RegExp(pattern, 'g')) || []
      }
    };
    
    try {
      // Simple Python-to-JS transpilation for basic operations
      let jsCode = code
        .replace(/print\(/g, 'return print(')
        .replace(/import\s+(\w+)/g, '// import $1')
        .replace(/from\s+(\w+)\s+import/g, '// from $1 import')
        .replace(/:\s*$/gm, ' {')
        .replace(/elif\s+/g, 'else if ')
        .replace(/else:/g, 'else {')
        .replace(/# /g, '// ')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\b/g, '!')
        .replace(/None/g, 'null')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false');
      
      const fn = new Function('__globals', `
        with(__globals) {
          ${jsCode}
        }
      `);
      
      const result = fn(pyGlobals);
      
      return {
        tool: 'python',
        code: code.substring(0, 200),
        result,
        type: typeof result
      };
    } catch (error: any) {
      return {
        tool: 'python',
        error: error.message,
        line: error.lineNumber
      };
    }
  }

  private executeNode(params: any) {
    const code = params.code || params.script || '';
    
    try {
      const context = {
        fetch,
        console: { log: (...args: any[]) => args.join(' '), error: (...args: any[]) => args.join(' ') },
        require: (mod: string) => {
          if (mod === 'fs') return {
            readFileSync: (path: string) => this.sessionMemory.get(`file:${path}`) || 'File not found',
            writeFileSync: (path: string, data: string) => this.sessionMemory.set(`file:${path}`, data)
          };
          if (mod === 'crypto') return crypto;
          return {};
        },
        process: { env: {} },
        Buffer: { from: (s: string) => ({ toString: () => btoa(s) }) }
      };
      
      const fn = new Function('context', `
        with(context) {
          ${code}
        }
      `);
      
      const result = fn(context);
      
      return {
        tool: 'node',
        result: result !== undefined ? result : 'undefined',
        type: typeof result
      };
    } catch (error: any) {
      return { tool: 'node', error: error.message };
    }
  }

  private executeBash(params: any) {
    const command = params.command || params.cmd || params.c || '';
    
    // Simulate bash commands
    if (command.startsWith('ls')) {
      return { tool: 'bash', output: ['file1.txt', 'script.py', 'data.json', 'README.md'] };
    }
    if (command.startsWith('cat')) {
      const file = command.split(' ')[1];
      return { 
        tool: 'bash', 
        output: this.sessionMemory.get(`file:${file}`) || `cat: ${file}: No such file or directory`
      };
    }
    if (command.startsWith('echo')) {
      return { tool: 'bash', output: command.replace('echo ', '') };
    }
    if (command.startsWith('pwd')) {
      return { tool: 'bash', output: '/home/darkunicorn' };
    }
    if (command.startsWith('whoami')) {
      return { tool: 'bash', output: 'root' };
    }
    if (command.startsWith('uname')) {
      return { tool: 'bash', output: 'Linux darkunicorn 5.15.0-kali-amd64 #1 SMP x86_64 GNU/Linux' };
    }
    if (command.startsWith('ping')) {
      return { 
        tool: 'bash', 
        output: `PING ${command.split(' ')[1]}: 56 data bytes\n64 bytes from ... icmp_seq=1 ttl=64 time=23.4 ms\n--- ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`
      };
    }
    
    return { 
      tool: 'bash', 
      command,
      output: `Command executed: ${command}`,
      note: 'Bash simulation running in browser sandbox'
    };
  }

  // ========== ORIGINAL TOOLS ==========

  private simulateNmap(params: any) {
    const target = params.target || '127.0.0.1';
    const options = params.options || '-sS';
    const ports = [22, 80, 443, 3306, 8080, 21, 25, 3389, 5432];
    const openPorts = ports.filter(() => Math.random() > 0.5);
    
    return {
      tool: 'nmap',
      command: `nmap ${options} ${target}`,
      target,
      results: {
        host_status: 'up',
        latency: `${(Math.random() * 50 + 5).toFixed(2)}ms`,
        open_ports: openPorts.map(port => ({
          port,
          service: this.getServiceName(port),
          version: Math.random() > 0.7 ? 'Unknown' : `${this.getServiceName(port)} 1.2.3`,
          state: 'open'
        }))
      }
    };
  }

  private simulateMasscan(params: any) {
    return {
      tool: 'masscan',
      rate: '10000 packets/sec',
      results: {
        total_hosts: 256,
        open_ports_found: Math.floor(Math.random() * 50 + 10),
        duration: '45 seconds'
      }
    };
  }

  private simulateDirb(params: any) {
    const target = params.target || 'http://localhost';
    const commonDirs = ['/admin', '/api', '/backup', '/config', '/.git', '/wp-admin'];
    const found = commonDirs.filter(() => Math.random() > 0.7);
    
    return {
      tool: 'dirb/gobuster',
      target,
      results: {
        directories_found: found.map(dir => ({
          url: `${target}${dir}`,
          status: [200, 301, 403][Math.floor(Math.random() * 3)]
        }))
      }
    };
  }

  private simulateSqlmap(params: any) {
    return {
      tool: 'sqlmap',
      vulnerability_found: Math.random() > 0.5,
      injection_type: Math.random() > 0.5 ? 'Union-based' : 'Boolean-based blind'
    };
  }

  private simulateHashcat(params: any) {
    return {
      tool: 'hashcat',
      cracked: Math.random() > 0.3,
      plaintext: Math.random() > 0.3 ? 'password123' : null
    };
  }

  private simulateJohn(params: any) {
    return {
      tool: 'john',
      cracked_passwords: Math.floor(Math.random() * 5 + 1)
    };
  }

  private simulateWhois(params: any) {
    return {
      tool: 'whois',
      domain: params.domain,
      registrar: 'GoDaddy.com, LLC'
    };
  }

  private simulateDig(params: any) {
    return {
      tool: 'dig',
      domain: params.domain,
      records: [
        { type: 'A', value: '93.184.216.34' },
        { type: 'MX', value: '10 mail.example.com' }
      ]
    };
  }

  private encodeBase64(params: any) {
    const text = params.text || '';
    const decode = params.decode || false;
    
    if (decode) {
      try {
        return { operation: 'base64 decode', result: atob(text) };
      } catch (e) {
        return { error: 'Invalid base64' };
      }
    }
    return { operation: 'base64 encode', result: btoa(text) };
  }

  private async hashMd5(params: any) {
    const text = params.text || '';
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return { hash: hashArray.map(b => b.toString(16).padStart(2, '0')).join('') };
  }

  private async hashSha256(params: any) {
    const text = params.text || '';
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return { hash: hashArray.map(b => b.toString(16).padStart(2, '0')).join('') };
  }

  private hashBcrypt(params: any) {
    // Bcrypt simulation - real bcrypt needs native module
    return { 
      note: 'Bcrypt simulation (real bcrypt requires Node.js native module)',
      hash: `$2b$10$${btoa(params.text || '').substring(0, 22)}...`
    };
  }

  private jwtDecode(params: any) {
    const token = params.token || params.jwt || '';
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      return { header, payload, signature: parts[2].substring(0, 20) + '...' };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  private searchExploitDb(params: any) {
    return {
      query: params.query,
      results: [
        { id: 'EDB-12345', title: `Exploit for ${params.query}`, type: 'remote' }
      ]
    };
  }

  private lookupCve(params: any) {
    return {
      cve: params.cve,
      severity: 'CRITICAL',
      cvss_score: 9.8
    };
  }

  private async queryShodan(params: any) {
    const query = params.query || 'apache';
    
    try {
      // Try to use Shodan API if key is provided
      const apiKey = params.api_key;
      if (!apiKey) {
        return {
          tool: 'shodan',
          query,
          note: 'No API key provided. Get one at shodan.io',
          results: 'Simulated: Would search Shodan for hosts matching query'
        };
      }
      
      const response = await fetch(`https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      return {
        tool: 'shodan',
        total_results: data.total,
        matches: data.matches?.slice(0, 5).map((m: any) => ({
          ip: m.ip_str,
          port: m.port,
          org: m.org,
          data: m.data?.substring(0, 200)
        }))
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  private sherlockLookup(params: any) {
    const username = params.username || params.user || '';
    const sites = ['GitHub', 'Twitter', 'Instagram', 'Reddit', 'LinkedIn'];
    
    return {
      tool: 'sherlock',
      username,
      results: sites.map(site => ({
        site,
        url: `https://${site.toLowerCase()}.com/${username}`,
        exists: Math.random() > 0.5
      }))
    };
  }

  private readLocalFile(params: any) {
    return { 
      error: 'File access through UI only',
      files_in_memory: Array.from(this.sessionMemory.keys()).filter(k => k.startsWith('file:'))
    };
  }

  private sandboxExecute(params: any) {
    try {
      const code = params.code || '';
      if (!code.trim()) return { error: 'Empty code' };
      
      const fn = new Function(`"use strict"; return (${code})`);
      return { success: true, result: fn() };
    } catch (e: any) {
      return { error: e.message };
    }
  }

  private searchDocuments(params: any) {
    const query = params.query || '';
    return {
      query,
      results: this.vectorDocs.filter(doc => 
        doc.content.toLowerCase().includes(query.toLowerCase())
      )
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

  clearSession() {
    this.sessionMemory.clear();
    this.chatHistory = [];
    this.vectorDocs = [];
    this.dynamicTools.clear();
    this.installedTools = [];
    console.log('[Agent] Complete session wipe executed');
  }

  getSessionInfo() {
    return {
      memory_entries: this.sessionMemory.size,
      chat_messages: this.chatHistory.length,
      vector_docs: this.vectorDocs.length,
      dynamic_tools: this.dynamicTools.size,
      installed_tools: this.installedTools
    };
  }
}
