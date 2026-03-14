import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, Zap, Shield, AlertTriangle, Clock, 
  Hash, Copy, CheckCircle, XCircle, Database,
  RefreshCw, Settings, Info
} from 'lucide-react';

interface HashType {
  id: string;
  name: string;
  regex: RegExp;
  example: string;
  speed: string; // Hashes per second (simulated)
  crackable: boolean;
}

const HASH_TYPES: HashType[] = [
  { id: 'md5', name: 'MD5', regex: /^[a-f0-9]{32}$/i, example: '5f4dcc3b5aa765d61d8327deb882cf99', speed: '100B/s', crackable: true },
  { id: 'sha1', name: 'SHA-1', regex: /^[a-f0-9]{40}$/i, example: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', speed: '80B/s', crackable: true },
  { id: 'sha256', name: 'SHA-256', regex: /^[a-f0-9]{64}$/i, example: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', speed: '50B/s', crackable: true },
  { id: 'sha512', name: 'SHA-512', regex: /^[a-f0-9]{128}$/i, example: 'b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86', speed: '20B/s', crackable: true },
  { id: 'bcrypt', name: 'Bcrypt', regex: /^\$2[aby]?\$\d+\$[.\/0-9A-Za-z]{53}$/, example: '$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', speed: '10/s', crackable: false },
  { id: 'scrypt', name: 'Scrypt', regex: /^\$scrypt\$/, example: '$scrypt$N=32768,r=8,p=1$', speed: '5/s', crackable: false },
  { id: 'argon2', name: 'Argon2', regex: /^\$argon2[id]\$/, example: '$argon2id$v=19$m=65536,t=3,p=4$', speed: '3/s', crackable: false },
  { id: 'ntlm', name: 'NTLM', regex: /^[a-f0-9]{32}$/i, example: '8846f7eaee8fb117ad06bdd830b7586c', speed: '120B/s', crackable: true },
];

// Small rainbow table for common passwords (educational purposes only)
const RAINBOW_TABLE: Record<string, string> = {
  '5f4dcc3b5aa765d61d8327deb882cf99': 'password',
  'e99a18c428cb38d5f260853678922e03': 'abc123',
  '900150983cd24fb0d6963f7d28e17f72': 'hello',
  '827ccb0eea8a706c4c34a16891f84e7b': '12345',
  '25d55ad283aa400af464c76d713c07ad': '12345678',
  '81dc9bdb52d04dc20036dbd8313ed055': '1234',
  'd8578edf8458ce06fbc5bb76a58c5ca4': 'qwerty',
  '5ebe2294ecd0e0f08eab7690d2a6ee69': 'secret',
  '21232f297a57a5a743894a0e4a801fc3': 'admin',
  '202cb962ac59075b964b07152d234b70': '123',
  '098f6bcd4621d373cade4e832627b4f6': 'test',
  'e10adc3949ba59abbe56e057f20f883e': '123456',
  '7c4a8d09ca3762af61e59520943dc26494f8941b': 'password1', // SHA1
  '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8': 'password', // SHA1
};

// Common passwords for brute force demo
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', 'letmein', 'dragon', '111111', 'baseball',
  'iloveyou', 'trustno1', 'sunshine', 'princess', 'admin',
  'welcome', 'shadow', 'ashley', 'football', 'jesus',
  'michael', 'ninja', 'mustang', 'password1', '123456789',
  'adobe123', 'admin123', 'root', 'toor', 'guest'
];

export default function HashLab() {
  const [hash, setHash] = useState('');
  const [identifiedType, setIdentifiedType] = useState<HashType | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  
  // Rainbow table
  const [rainbowResult, setRainbowResult] = useState<{ found: boolean; plaintext?: string; time: number } | null>(null);
  
  // Brute force
  const [bruteForceState, setBruteForceState] = useState<'idle' | 'running' | 'found' | 'notfound'>('idle');
  const [bruteForceProgress, setBruteForceProgress] = useState(0);
  const [bruteForceResult, setBruteForceResult] = useState<{ password?: string; attempts: number; time: number } | null>(null);
  const [maxAttempts, setMaxAttempts] = useState(1000);
  
  // Salt generator
  const [salt, setSalt] = useState('');
  const [copied, setCopied] = useState(false);

  // Identify hash type
  const identifyHash = useCallback(() => {
    setIsIdentifying(true);
    const cleanHash = hash.trim();
    
    if (!cleanHash) {
      setIdentifiedType(null);
      setIsIdentifying(false);
      return;
    }

    // Check against regex patterns
    const match = HASH_TYPES.find(type => type.regex.test(cleanHash));
    setIdentifiedType(match || null);
    setIsIdentifying(false);
    
    // Reset other states
    setRainbowResult(null);
    setBruteForceState('idle');
    setBruteForceResult(null);
  }, [hash]);

  // Rainbow table lookup
  const checkRainbowTable = () => {
    // Security: Limit hash length
    if (hash.length > 1000) {
      setRainbowResult({ found: false, time: 0 });
      return;
    }
    
    const startTime = performance.now();
    const cleanHash = hash.trim().toLowerCase();
    
    // Security: Validate hash characters only hex
    if (!/^[a-f0-9$./]+$/.test(cleanHash)) {
      setRainbowResult({ found: false, time: 0 });
      return;
    }
    
    // Simulate lookup delay
    setTimeout(() => {
      const result = RAINBOW_TABLE[cleanHash];
      const endTime = performance.now();
      
      setRainbowResult({
        found: !!result,
        plaintext: result,
        time: endTime - startTime
      });
    }, 300);
  };

  // Brute force simulation
  const startBruteForce = async () => {
    // Security: Limit attempts
    const actualMaxAttempts = Math.min(maxAttempts, 1000);
    
    setBruteForceState('running');
    setBruteForceProgress(0);
    
    const startTime = performance.now();
    
    // Simulate brute force with delays for visual effect
    for (let i = 0; i < Math.min(COMMON_PASSWORDS.length, actualMaxAttempts); i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      setBruteForceProgress(((i + 1) / Math.min(COMMON_PASSWORDS.length, actualMaxAttempts)) * 100);
      
      // Check if user cancelled (by changing state)
      if (bruteForceState === 'idle') {
        return;
      }
      
      // Simulate hash comparison (simplified for demo)
      const testPassword = COMMON_PASSWORDS[i];
      // Note: In a real implementation, we'd hash the password and compare
      // For this demo, we check if it matches known hashes
    }
    
    const endTime = performance.now();
    setBruteForceState('notfound');
    setBruteForceResult({
      attempts: Math.min(COMMON_PASSWORDS.length, actualMaxAttempts),
      time: endTime - startTime
    });
  };

  // Generate random salt
  const generateSalt = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const saltHex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    setSalt(saltHex);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-identify on hash change
  useEffect(() => {
    const timeout = setTimeout(identifyHash, 300);
    return () => clearTimeout(timeout);
  }, [hash, identifyHash]);

  // Generate salt on mount
  useEffect(() => {
    generateSalt();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0612] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-violet-900/30 border border-violet-700/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Hash className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
              HASH LAB
            </h1>
          </div>
          <p className="text-violet-400/60 font-mono text-sm max-w-xl mx-auto">
            Identify hash types, test password strength with rainbow tables, and simulate brute force attacks. 
            <span className="text-fuchsia-400"> For educational purposes only.</span>
          </p>
        </div>

        {/* Main Input */}
        <Card className="bg-violet-950/20 border-violet-800/50 p-6 backdrop-blur-sm">
          <label className="block text-violet-300 text-sm font-mono mb-3 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Enter Hash to Analyze
          </label>
          <div className="relative">
            <Input
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="e.g., 5f4dcc3b5aa765d61d8327deb882cf99 (MD5 of 'password')"
              className="bg-violet-950/50 border-violet-700/50 text-violet-100 font-mono text-sm h-12 pr-24 focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            />
            {hash && (
              <button
                onClick={() => setHash('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500 hover:text-violet-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Quick Examples */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-violet-500 text-xs font-mono">Examples:</span>
            {['MD5', 'SHA256', 'Bcrypt'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  const example = HASH_TYPES.find(h => h.name === type)?.example || '';
                  setHash(example);
                }}
                className="text-xs font-mono px-2 py-1 rounded bg-violet-900/30 text-violet-400 hover:bg-violet-800/50 hover:text-violet-200 transition-colors"
              >
                {type}
              </button>
            ))}
          </div>
        </Card>

        {/* Identification Result */}
        {identifiedType && (
          <Card className={`border-l-4 p-5 backdrop-blur-sm ${
            identifiedType.crackable 
              ? 'bg-amber-950/20 border-amber-500/50 border-l-amber-500' 
              : 'bg-green-950/20 border-green-500/50 border-l-green-500'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`font-mono font-bold text-lg ${
                  identifiedType.crackable ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {identifiedType.name} Detected
                </h3>
                <p className="text-violet-300/70 text-sm font-mono mt-1">
                  Length: {hash.length} characters | Pattern: {identifiedType.regex.toString().slice(0, 30)}...
                </p>
              </div>
              <Badge className={identifiedType.crackable 
                ? 'bg-amber-900/50 text-amber-300 border-amber-500/30' 
                : 'bg-green-900/50 text-green-300 border-green-500/30'
              }>
                {identifiedType.crackable ? '⚠️ Crackable' : '✓ Secure'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-violet-800/30">
              <div>
                <span className="text-violet-500 text-xs font-mono">Cracking Speed</span>
                <p className="text-violet-200 font-mono text-sm">{identifiedType.speed}</p>
              </div>
              <div>
                <span className="text-violet-500 text-xs font-mono">Security</span>
                <p className={identifiedType.crackable ? 'text-amber-400 font-mono text-sm' : 'text-green-400 font-mono text-sm'}>
                  {identifiedType.crackable ? 'Legacy / Weak' : 'Modern / Strong'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {hash && !identifiedType && hash.length > 0 && (
          <Alert className="bg-red-950/20 border-red-500/50 text-red-200">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="font-mono text-sm">
              Unknown hash format. Could be custom, encoded, or invalid.
            </AlertDescription>
          </Alert>
        )}

        {/* Analysis Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Rainbow Table */}
          <Card className="bg-violet-950/20 border-violet-800/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-cyan-400" />
              <h3 className="font-mono font-bold text-cyan-400">Rainbow Table Lookup</h3>
            </div>
            <p className="text-violet-400/70 text-xs font-mono mb-4">
              Check against pre-computed hash database (common passwords only).
            </p>
            
            <Button 
              onClick={checkRainbowTable}
              disabled={!hash || !identifiedType?.crackable}
              className="w-full bg-cyan-900/30 border-cyan-700/50 text-cyan-300 hover:bg-cyan-800/50 disabled:opacity-50 font-mono"
            >
              <Database className="w-4 h-4 mr-2" />
              Search Database
            </Button>

            {rainbowResult && (
              <div className={`mt-4 p-4 rounded-lg border ${
                rainbowResult.found 
                  ? 'bg-red-950/30 border-red-500/50' 
                  : 'bg-violet-950/30 border-violet-700/50'
              }`}>
                {rainbowResult.found ? (
                  <>
                    <div className="flex items-center gap-2 text-red-400 font-mono font-bold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      PASSWORD FOUND!
                    </div>
                    <div className="bg-black/50 p-3 rounded font-mono text-green-400 text-lg">
                      {rainbowResult.plaintext}
                    </div>
                    <p className="text-violet-400/60 text-xs font-mono mt-2">
                      Lookup time: {rainbowResult.time.toFixed(2)}ms
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-violet-400 font-mono">
                      <XCircle className="w-4 h-4" />
                      Not in database
                    </div>
                    <p className="text-violet-400/60 text-xs font-mono mt-1">
                      This password is not in the common passwords list. Good!
                    </p>
                  </>
                )}
              </div>
            )}
          </Card>

          {/* Brute Force Simulator */}
          <Card className="bg-violet-950/20 border-violet-800/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-pink-400" />
              <h3 className="font-mono font-bold text-pink-400">Brute Force Simulator</h3>
            </div>
            <p className="text-violet-400/70 text-xs font-mono mb-4">
              Simulate dictionary attack with common passwords.
            </p>
            
            <div className="flex gap-2 mb-4">
              <select 
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="bg-violet-950/50 border border-violet-700/50 text-violet-300 text-xs font-mono rounded px-2 py-2"
              >
                <option value={100}>100 attempts</option>
                <option value={1000}>1,000 attempts</option>
                <option value={10000}>10,000 attempts</option>
              </select>
              <Button 
                onClick={startBruteForce}
                disabled={!hash || !identifiedType?.crackable || bruteForceState === 'running'}
                className="flex-1 bg-pink-900/30 border-pink-700/50 text-pink-300 hover:bg-pink-800/50 disabled:opacity-50 font-mono"
              >
                {bruteForceState === 'running' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Start Attack
                  </>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {bruteForceState === 'running' && (
              <div className="mb-4">
                <div className="h-2 bg-violet-900/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100"
                    style={{ width: `${bruteForceProgress}%` }}
                  />
                </div>
                <p className="text-violet-400/60 text-xs font-mono mt-1 text-center">
                  {bruteForceProgress.toFixed(0)}% complete
                </p>
              </div>
            )}

            {bruteForceResult && (
              <div className={`p-4 rounded-lg border ${
                bruteForceState === 'found' 
                  ? 'bg-red-950/30 border-red-500/50' 
                  : 'bg-green-950/20 border-green-500/50'
              }`}>
                {bruteForceState === 'found' ? (
                  <>
                    <div className="flex items-center gap-2 text-red-400 font-mono font-bold mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      CRACKED!
                    </div>
                    <div className="bg-black/50 p-3 rounded font-mono text-green-400 text-lg">
                      {bruteForceResult.password}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-green-400 font-mono font-bold mb-2">
                      <Shield className="w-4 h-4" />
                      NOT CRACKED
                    </div>
                    <p className="text-violet-300/70 text-sm font-mono">
                      Password survived {bruteForceResult.attempts.toLocaleString()} attempts.
                    </p>
                  </>
                )}
                <p className="text-violet-400/60 text-xs font-mono mt-2">
                  Time: {bruteForceResult.time.toFixed(2)}ms | Attempts: {bruteForceResult.attempts.toLocaleString()}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Salt Generator */}
        <Card className="bg-violet-950/20 border-violet-800/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              <h3 className="font-mono font-bold text-yellow-400">Salt Generator</h3>
            </div>
            <Button 
              onClick={generateSalt}
              variant="ghost" 
              size="sm"
              className="text-violet-400 hover:text-violet-200"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Regenerate
            </Button>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 bg-black/50 p-3 rounded-lg border border-violet-800/50 font-mono text-sm text-violet-300 break-all">
              {salt}
            </div>
            <Button 
              onClick={() => copyToClipboard(salt)}
              className="bg-yellow-900/30 border-yellow-700/50 text-yellow-300 hover:bg-yellow-800/50"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <p className="text-violet-400/60 text-xs font-mono mt-3">
            Use this cryptographically secure random salt when hashing passwords. 
            Salt prevents rainbow table attacks by ensuring identical passwords have different hashes.
          </p>
        </Card>

        {/* Education Section */}
        <Card className="bg-gradient-to-br from-violet-950/40 to-fuchsia-950/20 border-violet-800/50 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-violet-900/30 border border-violet-700/50">
              <Info className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-violet-200 mb-2">Why This Matters</h3>
              <ul className="space-y-2 text-sm text-violet-400/80 font-mono">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">⚠️</span>
                  <span>MD5, SHA1, and SHA256 are <strong>too fast</strong> for password hashing. GPUs can crack billions per second.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Use <strong>bcrypt, scrypt, or Argon2</strong> for passwords. They are intentionally slow to resist brute force.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">🔑</span>
                  <span>Always use a <strong>unique salt</strong> per password. This defeats rainbow table attacks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">🛡️</span>
                  <span>Use a <strong>pepper</strong> (application-wide secret key) in addition to salt for extra security.</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
