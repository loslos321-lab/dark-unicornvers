import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, CheckCircle2, XCircle, Trophy, RefreshCw,
  Flame, Egg, Calculator, Calendar, MapPin, Moon,
  Sun, Star, Hash, AtSign, DollarSign, Percent,
  Timer, AlertCircle, ChevronRight, Crown
} from 'lucide-react';

interface Rule {
  id: number;
  text: string;
  check: (password: string) => boolean;
  icon: React.ReactNode;
  revealed: boolean;
}

// Helper functions
const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const romanToInt = (roman: string): number => {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = map[roman[i]] || 0;
    const next = map[roman[i + 1]] || 0;
    if (current < next) result -= current;
    else result += current;
  }
  return result;
};

const currentMonth = new Date().toLocaleString('default', { month: 'long' });
const currentDay = new Date().getDate();
const currentYear = new Date().getFullYear();

export default function PasswordGame() {
  const [password, setPassword] = useState('');
  const [currentRule, setCurrentRule] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [failedRule, setFailedRule] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  const rules: Rule[] = [
    {
      id: 1,
      text: "Your password must be at least 5 characters long",
      check: (p) => p.length >= 5,
      icon: <Lock className="w-4 h-4" />,
      revealed: true
    },
    {
      id: 2,
      text: "Must contain an uppercase letter",
      check: (p) => /[A-Z]/.test(p),
      icon: <Hash className="w-4 h-4" />,
      revealed: currentRule >= 1
    },
    {
      id: 3,
      text: "Must contain a number",
      check: (p) => /\d/.test(p),
      icon: <Calculator className="w-4 h-4" />,
      revealed: currentRule >= 2
    },
    {
      id: 4,
      text: "Must contain a special character (!@#$%^&*)",
      check: (p) => /[!@#$%^&*]/.test(p),
      icon: <AtSign className="w-4 h-4" />,
      revealed: currentRule >= 3
    },
    {
      id: 5,
      text: "The digits in your password must add up to 25",
      check: (p) => {
        const digits = p.match(/\d/g);
        if (!digits) return false;
        const sum = digits.reduce((acc: number, d: string) => acc + parseInt(d), 0);
        return sum === 25;
      },
      icon: <Calculator className="w-4 h-4" />,
      revealed: currentRule >= 4
    },
    {
      id: 6,
      text: "Must contain a month of the year",
      check: (p) => {
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
        return months.some(m => p.toLowerCase().includes(m));
      },
      icon: <Calendar className="w-4 h-4" />,
      revealed: currentRule >= 5
    },
    {
      id: 7,
      text: `Must include the current year (${currentYear})`,
      check: (p) => p.includes(String(currentYear)),
      icon: <Calendar className="w-4 h-4" />,
      revealed: currentRule >= 6
    },
    {
      id: 8,
      text: "Must contain at least one emoji",
      check: (p) => /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(p),
      icon: <Flame className="w-4 h-4" />,
      revealed: currentRule >= 7
    },
    {
      id: 9,
      text: "Password length must be a prime number",
      check: (p) => isPrime(p.length),
      icon: <Hash className="w-4 h-4" />,
      revealed: currentRule >= 8
    },
    {
      id: 10,
      text: "Must contain a Roman numeral (I, V, X, L, C, D, M)",
      check: (p) => /[IVXLCDM]/.test(p),
      icon: <DollarSign className="w-4 h-4" />,
      revealed: currentRule >= 9
    },
    {
      id: 11,
      text: "The Roman numerals in your password must equal 50 (L)",
      check: (p) => {
        const romanMatch = p.match(/[IVXLCDM]+/g);
        if (!romanMatch) return false;
        const total = romanMatch.reduce((acc, r) => acc + romanToInt(r), 0);
        return total === 50;
      },
      icon: <Percent className="w-4 h-4" />,
      revealed: currentRule >= 10
    },
    {
      id: 12,
      text: "Must contain '🥚' (egg emoji)",
      check: (p) => p.includes('🥚'),
      icon: <Egg className="w-4 h-4" />,
      revealed: currentRule >= 11
    },
    {
      id: 13,
      text: "Must include the word 'password' (yes, really)",
      check: (p) => p.toLowerCase().includes('password'),
      icon: <Lock className="w-4 h-4" />,
      revealed: currentRule >= 12
    },
    {
      id: 14,
      text: "Must contain at least one palindrome (3+ characters)",
      check: (p) => {
        const clean = p.toLowerCase().replace(/[^a-z]/g, '');
        for (let i = 0; i < clean.length - 2; i++) {
          for (let j = i + 3; j <= clean.length; j++) {
            const substr = clean.slice(i, j);
            if (substr === substr.split('').reverse().join('') && substr.length >= 3) {
              return true;
            }
          }
        }
        return false;
      },
      icon: <RefreshCw className="w-4 h-4" />,
      revealed: currentRule >= 13
    },
    {
      id: 15,
      text: `Must include today's date (${currentDay})`,
      check: (p) => p.includes(String(currentDay)),
      icon: <Calendar className="w-4 h-4" />,
      revealed: currentRule >= 14
    },
    {
      id: 16,
      text: "Must contain a chess piece (♔, ♕, ♖, ♗, ♘, ♙, ♚, ♛, ♜, ♝, ♞, ♟)",
      check: (p) => /[♔♕♖♗♘♙♚♛♜♝♞♟]/.test(p),
      icon: <Crown className="w-4 h-4" />,
      revealed: currentRule >= 15
    },
    {
      id: 17,
      text: "Password must be exactly 50 characters long",
      check: (p) => p.length === 50,
      icon: <Hash className="w-4 h-4" />,
      revealed: currentRule >= 16
    },
    {
      id: 18,
      text: "Must contain 'DarkUnicorn' (case sensitive)",
      check: (p) => p.includes('DarkUnicorn'),
      icon: <Star className="w-4 h-4" />,
      revealed: currentRule >= 17
    },
    {
      id: 19,
      text: "🎉 CONGRATULATIONS! You've created the perfect password!",
      check: (p) => true,
      icon: <Trophy className="w-4 h-4" />,
      revealed: currentRule >= 18
    }
  ];

  // Check all rules on password change
  useEffect(() => {
    if (gameWon) return;
    
    let passedRules = 0;
    let firstFailed = -1;
    
    for (let i = 0; i <= currentRule && i < rules.length; i++) {
      if (rules[i].check(password)) {
        passedRules++;
      } else if (firstFailed === -1) {
        firstFailed = i;
      }
    }
    
    // If all current rules pass, reveal next rule
    if (firstFailed === -1 && currentRule < rules.length - 2) {
      setCurrentRule(prev => prev + 1);
      setFailedRule(null);
    } else if (firstFailed !== -1) {
      setFailedRule(firstFailed);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    
    // Win condition
    if (currentRule >= rules.length - 2 && firstFailed === -1 && password.length > 0) {
      setGameWon(true);
    }
  }, [password, currentRule, gameWon]);

  const resetGame = () => {
    setPassword('');
    setCurrentRule(0);
    setGameWon(false);
    setFailedRule(null);
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { color: 'bg-violet-900', width: '0%', text: 'Empty' };
    if (currentRule < 3) return { color: 'bg-red-500', width: '20%', text: 'Weak' };
    if (currentRule < 7) return { color: 'bg-orange-500', width: '40%', text: 'Fair' };
    if (currentRule < 12) return { color: 'bg-yellow-500', width: '60%', text: 'Good' };
    if (currentRule < 16) return { color: 'bg-green-500', width: '80%', text: 'Strong' };
    return { color: 'bg-emerald-500', width: '100%', text: 'Perfect' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-[#0a0612] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-violet-900/30 border border-violet-700/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Lock className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
              THE PASSWORD GAME
            </h1>
          </div>
          <p className="text-violet-400/60 font-mono text-sm">
            Create a password that satisfies all rules. Each rule makes it harder...
          </p>
        </div>

        {/* Game Won Modal */}
        {gameWon && (
          <Card className="bg-gradient-to-br from-emerald-950/50 to-green-950/30 border-emerald-500/50 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent" />
            <div className="relative">
              <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-mono text-emerald-400 mb-2">
                YOU WON!
              </h2>
              <p className="text-emerald-300/70 font-mono text-sm mb-4">
                You created the ultimate password with {password.length} characters!
              </p>
              <div className="bg-black/30 p-3 rounded-lg font-mono text-xs text-violet-300 mb-4 break-all max-h-24 overflow-y-auto">
                {password}
              </div>
              <Button 
                onClick={resetGame}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </Card>
        )}

        {/* Password Input */}
        {!gameWon && (
          <Card className="bg-violet-950/20 border-violet-800/50 p-6 backdrop-blur-sm">
            <label className="block text-violet-300 text-sm font-mono mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Your Password
            </label>
            <div className={`relative ${shake ? 'animate-shake' : ''}`}>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Start typing..."
                className="bg-violet-950/50 border-violet-700/50 text-violet-100 font-mono text-lg h-14 pr-20 focus:border-violet-500/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500 font-mono text-xs">
                {password.length}
              </div>
            </div>
            
            {/* Strength Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-violet-400/60 text-xs font-mono">Strength</span>
                <span className="text-violet-400 text-xs font-mono">{strength.text}</span>
              </div>
              <div className="h-2 bg-violet-900/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${strength.color} transition-all duration-500 shadow-[0_0_10px_currentColor]`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Progress */}
        {!gameWon && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-mono text-sm">Rule</span>
              <Badge className="bg-violet-900/50 text-violet-300 border-violet-700/50 font-mono">
                {Math.min(currentRule + 1, rules.length - 1)} / {rules.length - 1}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-violet-500 font-mono text-xs">
              <Flame className="w-4 h-4" />
              {currentRule >= 10 ? 'INSANE' : currentRule >= 5 ? 'HARD' : 'EASY'}
            </div>
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {rules.map((rule, index) => {
            if (!rule.revealed) return null;
            
            const isPassed = rule.check(password);
            const isCurrent = index === failedRule;
            const isFuture = index > currentRule;
            
            if (isFuture) return null;
            
            return (
              <Card 
                key={rule.id}
                className={`p-4 transition-all duration-300 ${
                  isPassed 
                    ? 'bg-green-950/20 border-green-500/30' 
                    : isCurrent
                      ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-violet-950/20 border-violet-800/50 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isPassed 
                      ? 'bg-green-900/50 text-green-400' 
                      : isCurrent
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-violet-900/50 text-violet-400'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : 
                     isCurrent ? <XCircle className="w-5 h-5" /> : 
                     rule.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono font-bold ${
                        isPassed ? 'text-green-400' : 
                        isCurrent ? 'text-red-400' : 'text-violet-400'
                      }`}>
                        Rule {rule.id}
                      </span>
                      {isPassed && (
                        <Badge className="bg-green-900/50 text-green-300 text-[10px]">
                          PASS
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge className="bg-red-900/50 text-red-300 text-[10px]">
                          FAIL
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm font-mono ${
                      isPassed ? 'text-green-300' : 
                      isCurrent ? 'text-red-300' : 'text-violet-300/70'
                    }`}>
                      {rule.text}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Reset Button */}
        {!gameWon && password.length > 0 && (
          <div className="text-center">
            <Button 
              onClick={resetGame}
              variant="ghost"
              className="text-violet-500 hover:text-violet-300 font-mono"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-br from-violet-950/40 to-fuchsia-950/20 border-violet-800/50 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-violet-900/30 border border-violet-700/50">
              <AlertCircle className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-violet-200 mb-2">How to Play</h3>
              <ul className="space-y-1 text-sm text-violet-400/70 font-mono">
                <li>• Type a password that satisfies ALL visible rules</li>
                <li>• New rules appear as you progress</li>
                <li>• If a rule turns red, your password doesn't meet that requirement</li>
                <li>• Reach Rule 19 to win!</li>
                <li>• Tip: You can copy-paste emojis and special characters</li>
              </ul>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
