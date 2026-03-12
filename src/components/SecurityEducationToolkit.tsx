import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock, Eye, EyeOff, CheckCircle, XCircle, BookOpen, Terminal, FileWarning } from 'lucide-react';

interface TokenAnalysis {
  valid: boolean;
  format: string;
  userId?: string;
  timestamp?: string;
  warning: string;
}

export const SecurityEducationToolkit = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'analyze' | 'phish-sim' | 'protect'>('learn');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [phishDemo, setPhishDemo] = useState({
    url: '',
    detected: false,
    reasons: [] as string[]
  });

  // Discord Token Format Education
  const tokenEducation = {
    format: 'Discord tokens follow the format: USER_ID.TIMESTAMP.HMAC',
    parts: [
      { name: 'User ID', desc: 'Base64-encoded Discord user ID', example: 'MTIzNDU2Nzg5MA== (1234567890)' },
      { name: 'Timestamp', desc: 'When the token was created', example: 'G5g5gQ (Unix timestamp in base64)' },
      { name: 'HMAC', desc: 'Cryptographic signature (never share this!)', example: 'x3K9mP...' }
    ],
    dangers: [
      'Anyone with your token can access your account WITHOUT password',
      'Tokens bypass 2FA completely',
      'Attackers can send messages as you, join servers, steal data',
      'Tokens are often logged by malware in browser storage'
    ]
  };

  // Analyze token structure (NOT validate against Discord - that would be unauthorized access)
  const analyzeToken = (input: string): TokenAnalysis => {
    // Remove whitespace
    const clean = input.trim();
    
    // Check if empty
    if (!clean) return { valid: false, format: 'Empty', warning: 'No token provided' };
    
    // Check basic format (Base64.Base64.Base64)
    const parts = clean.split('.');
    if (parts.length !== 3) {
      return { 
        valid: false, 
        format: 'Invalid - Discord tokens have 3 parts separated by dots',
        warning: 'This is NOT a valid Discord token format'
      };
    }

    try {
      // Try to decode User ID (first part)
      const userIdDecoded = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      
      // Try to decode timestamp (second part)
      let timestamp = '';
      try {
        const tsBytes = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const tsHex = Array.from(tsBytes).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
        const tsNum = parseInt(tsHex, 16);
        timestamp = new Date(tsNum).toISOString();
      } catch (e) {
        timestamp = 'Unknown';
      }

      return {
        valid: true,
        format: 'Valid Discord token format detected',
        userId: userIdDecoded,
        timestamp,
        warning: '⚠️ NEVER share tokens! This appears to be a real Discord token. Delete it immediately if exposed!'
      };
    } catch (e) {
      return {
        valid: false,
        format: 'Malformed Base64',
        warning: 'Invalid token format or corrupted data'
      };
    }
  };

  const handleAnalyze = () => {
    const result = analyzeToken(token);
    setAnalysis(result);
  };

  // Phishing Detection Simulator
  const checkPhishingUrl = (url: string) => {
    const lowerUrl = url.toLowerCase();
    const reasons: string[] = [];
    
    // Check for suspicious patterns
    if (lowerUrl.includes('discrod') || lowerUrl.includes('discorcl') || lowerUrl.includes('discord-gift')) {
      reasons.push('⚠️ Typosquatting: Domain mimics "discord" with typos');
    }
    if (lowerUrl.includes('free-nitro') || lowerUrl.includes('nitro-gift') || lowerUrl.includes('nitro-free')) {
      reasons.push('⚠️ Too good to be true: Promises free Nitro');
    }
    if (lowerUrl.includes('login') && !lowerUrl.includes('discord.com')) {
      reasons.push('⚠️ Fake login page: Claims to be login but not official domain');
    }
    if (lowerUrl.includes('token') || lowerUrl.includes('grabber')) {
      reasons.push('⚠️ Malicious keywords: Explicitly mentions tokens');
    }
    if (url.length > 100 && url.includes('?')) {
      const params = new URLSearchParams(url.split('?')[1]);
      if (params.has('token') || params.has('code')) {
        reasons.push('⚠️ Suspicious parameters: Attempting to capture tokens/codes');
      }
    }
    
    // Check for homograph attacks (Cyrillic characters)
    const cyrillicPattern = /[\u0400-\u04FF]/;
    if (cyrillicPattern.test(url)) {
      reasons.push('⚠️ Homograph attack: Non-Latin characters detected (can look like Latin letters)');
    }

    return {
      detected: reasons.length > 0,
      reasons: reasons.length > 0 ? reasons : ['✓ No obvious phishing indicators (but still verify carefully!)']
    };
  };

  const handlePhishCheck = () => {
    const result = checkPhishingUrl(phishDemo.url);
    setPhishDemo(prev => ({ ...prev, ...result }));
  };

  const protectionTips = [
    {
      title: 'Token Protection',
      icon: <Lock className="w-5 h-5 text-green-400" />,
      tips: [
        'Never paste your token anywhere except official Discord Developer Portal',
        'If you accidentally leak a token, reset it immediately in Discord settings',
        'Use environment variables for bot tokens, never hardcode them',
        'Enable 2FA on your Discord account (though tokens bypass 2FA!)'
      ]
    },
    {
      title: 'Phishing Detection',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      tips: [
        'Check the URL carefully: discord.com ≠ discrod.com ≠ discord-app.com',
        'Discord will NEVER ask for your password in DMs',
        'Free Nitro offers in DMs are 100% scams',
        'Hover links before clicking to see the real destination'
      ]
    },
    {
      title: 'Malware Prevention',
      icon: <FileWarning className="w-5 h-5 text-red-400" />,
      tips: [
        'Token grabbers hide in "game mods", "cheats", and "free software"',
        'Scan downloads with VirusTotal before running',
        'Use browser isolation for Discord (separate profile)',
        'Check browser extensions - malicious ones can steal tokens'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-green-500" />
            <h1 className="text-3xl font-bold font-mono text-green-500">
              Security Education Toolkit
            </h1>
          </div>
          <p className="text-slate-400 font-mono text-sm">
            Defensive Security • Anti-Phishing • Token Protection
          </p>
          <Alert className="bg-amber-950/30 border-amber-500/30 text-amber-200">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="font-mono text-xs">
              This toolkit is for EDUCATIONAL PURPOSES ONLY. Learn to protect yourself from token grabbers and phishing.
            </AlertDescription>
          </Alert>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'learn', label: '📚 Learn', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'analyze', label: '🔍 Token Analyzer', icon: <Terminal className="w-4 h-4" /> },
            { id: 'phish-sim', label: '🎣 Phishing Detector', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'protect', label: '🛡️ Protection', icon: <Shield className="w-4 h-4" /> }
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className={`font-mono text-xs ${activeTab === tab.id ? 'bg-green-600' : 'border-slate-700'}`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'learn' && (
          <Card className="bg-slate-900/50 border-slate-700 p-6 space-y-6">
            <h2 className="text-xl font-mono font-bold text-green-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Understanding Discord Tokens
            </h2>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800">
                <h3 className="font-mono text-sm text-amber-400 mb-2">Token Structure</h3>
                <code className="text-xs text-green-300 block mb-3">
                  {tokenEducation.format}
                </code>
                <div className="space-y-2">
                  {tokenEducation.parts.map((part, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <span className="text-cyan-400 font-mono min-w-[80px]">{part.name}:</span>
                      <div>
                        <span className="text-slate-300">{part.desc}</span>
                        <code className="block text-slate-500 mt-0.5">{part.example}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-950/30 p-4 rounded border border-red-500/30">
                <h3 className="font-mono text-sm text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Why Tokens Are Dangerous
                </h3>
                <ul className="space-y-1 text-xs text-slate-300">
                  {tokenEducation.dangers.map((danger, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {danger}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'analyze' && (
          <Card className="bg-slate-900/50 border-slate-700 p-6 space-y-6">
            <h2 className="text-xl font-mono font-bold text-green-400 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Token Format Analyzer
            </h2>

            <Alert className="bg-red-950/30 border-red-500/30 text-red-200">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="font-mono text-xs">
                Only analyze YOUR OWN tokens here. Never paste someone else's token - that would be unauthorized access.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token here (format: XXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)"
                  className="bg-slate-950 border-slate-700 font-mono text-xs pr-10"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button onClick={handleAnalyze} className="bg-green-600 hover:bg-green-500">
                Analyze Structure
              </Button>

              {analysis && (
                <div className={`p-4 rounded border ${analysis.valid ? 'bg-amber-950/30 border-amber-500/30' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {analysis.valid ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`font-mono font-bold ${analysis.valid ? 'text-amber-400' : 'text-red-400'}`}>
                      {analysis.valid ? 'Valid Token Format Detected' : 'Invalid Format'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs font-mono">
                    <div><span className="text-slate-500">Format:</span> <span className="text-slate-300">{analysis.format}</span></div>
                    {analysis.userId && (
                      <div><span className="text-slate-500">User ID:</span> <span className="text-cyan-400">{analysis.userId}</span></div>
                    )}
                    {analysis.timestamp && (
                      <div><span className="text-slate-500">Created:</span> <span className="text-cyan-400">{analysis.timestamp}</span></div>
                    )}
                    <div className={`mt-3 p-2 rounded ${analysis.valid ? 'bg-red-950/50 text-red-300' : 'bg-slate-900 text-slate-400'}`}>
                      {analysis.warning}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'phish-sim' && (
          <Card className="bg-slate-900/50 border-slate-700 p-6 space-y-6">
            <h2 className="text-xl font-mono font-bold text-green-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Phishing URL Detector
            </h2>

            <div className="space-y-4">
              <div>
                <Input
                  value={phishDemo.url}
                  onChange={(e) => setPhishDemo({ url: e.target.value, detected: false, reasons: [] })}
                  placeholder="Enter URL to analyze (e.g., https://discrod-gift.com/nitro-free)"
                  className="bg-slate-950 border-slate-700 font-mono text-xs"
                />
              </div>

              <Button onClick={handlePhishCheck} className="bg-amber-600 hover:bg-amber-500">
                Analyze URL
              </Button>

              {phishDemo.reasons.length > 0 && (
                <div className={`p-4 rounded border ${phishDemo.detected ? 'bg-red-950/30 border-red-500/30' : 'bg-green-950/30 border-green-500/30'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {phishDemo.detected ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    <span className={`font-mono font-bold ${phishDemo.detected ? 'text-red-400' : 'text-green-400'}`}>
                      {phishDemo.detected ? 'Phishing Indicators Detected!' : 'No Obvious Red Flags'}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs font-mono">
                    {phishDemo.reasons.map((reason, idx) => (
                      <li key={idx} className="text-slate-300">{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-slate-950 p-4 rounded border border-slate-800">
                <h3 className="font-mono text-sm text-amber-400 mb-2">Common Phishing Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <code className="text-red-400">discrod-nitro.com</code>
                  <code className="text-slate-500">Typo in domain</code>
                  <code className="text-red-400">discord.free-nitro.ru</code>
                  <code className="text-slate-500">Suspicious subdomain</code>
                  <code className="text-red-400">dіscord.com (Cyrillic і)</code>
                  <code className="text-slate-500">Homograph attack</code>
                  <code className="text-red-400">steamcommunlty.com</code>
                  <code className="text-slate-500">Fake Steam community</code>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'protect' && (
          <div className="space-y-4">
            {protectionTips.map((section, idx) => (
              <Card key={idx} className="bg-slate-900/50 border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  {section.icon}
                  <h3 className="font-mono font-bold text-slate-200">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}

            <Alert className="bg-green-950/30 border-green-500/30 text-green-200">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="font-mono text-xs">
                Remember: Discord staff will NEVER ask for your password or token. When in doubt, don't click!
              </AlertDescription>
            </Alert>
          </div>
        )}

      </div>
    </div>
  );
};
