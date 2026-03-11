import { useState, useEffect, useRef } from "react";
import { Trophy, Timer, Lock, Unlock, Zap, Brain, Hash, Binary, RefreshCw, AlertCircle, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ToolLayout from "@/components/ToolLayout";

type Language = "en" | "de" | "fr";
type ChallengeType = "caesar" | "base64" | "binary" | "hex" | "reverse";
type Difficulty = "easy" | "medium" | "hard";

interface Translation {
  title: string;
  subtitle: string;
  startGame: string;
  difficulty: string;
  easy: string;
  medium: string;
  hard: string;
  score: string;
  time: string;
  timeBonus: string;
  streak: string;
  decrypt: string;
  submit: string;
  next: string;
  gameOver: string;
  playAgain: string;
  enterAnswer: string;
  hint: string;
  challengeTypes: Record<ChallengeType, string>;
  instructions: string;
  perfect: string;
  good: string;
  slow: string;
  ranks: {
    novice: string;
    hacker: string;
    cryptoMaster: string;
    legend: string;
  };
}

const translations: Record<Language, Translation> = {
  en: {
    title: "Crypto Speedrun",
    subtitle: "Race against time to crack codes",
    startGame: "START MISSION",
    difficulty: "DIFFICULTY",
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD",
    score: "SCORE",
    time: "TIME",
    timeBonus: "TIME BONUS",
    streak: "STREAK",
    decrypt: "DECRYPT",
    submit: "SUBMIT",
    next: "NEXT →",
    gameOver: "MISSION COMPLETE",
    playAgain: "PLAY AGAIN",
    enterAnswer: "Enter decrypted text...",
    hint: "HINT",
    challengeTypes: {
      caesar: "CAESAR CIPHER",
      base64: "BASE64",
      binary: "BINARY",
      hex: "HEXADECIMAL",
      reverse: "REVERSE"
    },
    instructions: "Decrypt the message as fast as possible. Each second counts!",
    perfect: "PERFECT! ⚡",
    good: "GOOD!",
    slow: "TOO SLOW...",
    ranks: {
      novice: "Script Kiddie",
      hacker: "Hacker",
      cryptoMaster: "Crypto Master",
      legend: "Legend"
    }
  },
  de: {
    title: "Crypto Speedrun",
    subtitle: "Renne gegen die Zeit um Codes zu knacken",
    startGame: "MISSION STARTEN",
    difficulty: "SCHWIERIGKEIT",
    easy: "LEICHT",
    medium: "MITTEL",
    hard: "SCHWER",
    score: "PUNKTE",
    time: "ZEIT",
    timeBonus: "ZEITBONUS",
    streak: "SERIE",
    decrypt: "ENTSCHLÜSSELE",
    submit: "PRÜFEN",
    next: "WEITER →",
    gameOver: "MISSION ABGESCHLOSSEN",
    playAgain: "NOCHMAL SPIELEN",
    enterAnswer: "Entschlüsselten Text eingeben...",
    hint: "TIPP",
    challengeTypes: {
      caesar: "CAESAR-VERSCHLÜSSELLUNG",
      base64: "BASE64",
      binary: "BINÄR",
      hex: "HEXADEZIMAL",
      reverse: "UMGEKEHRT"
    },
    instructions: "Entschlüssele die Nachricht so schnell wie möglich. Jede Sekunde zählt!",
    perfect: "PERFEKT! ⚡",
    good: "GUT!",
    slow: "ZU LANGSAM...",
    ranks: {
      novice: "Script Kiddie",
      hacker: "Hacker",
      cryptoMaster: "Crypto Master",
      legend: "Legende"
    }
  },
  fr: {
    title: "Crypto Speedrun",
    subtitle: "Course contre la montre pour décrypter",
    startGame: "DÉMARRER MISSION",
    difficulty: "DIFFICULTÉ",
    easy: "FACILE",
    medium: "MOYEN",
    hard: "DIFFICILE",
    score: "SCORE",
    time: "TEMPS",
    timeBonus: "BONUS TEMPS",
    streak: "SÉRIE",
    decrypt: "DÉCHIFFRER",
    submit: "VALIDER",
    next: "SUIVANT →",
    gameOver: "MISSION ACCOMPLIE",
    playAgain: "REJOUER",
    enterAnswer: "Entrez le texte déchiffré...",
    hint: "INDICE",
    challengeTypes: {
      caesar: "CHIFFRE DE CÉSAR",
      base64: "BASE64",
      binary: "BINAIRE",
      hex: "HEXADÉCIMAL",
      reverse: "INVERSÉ"
    },
    instructions: "Déchiffrez le message le plus vite possible. Chaque seconde compte!",
    perfect: "PARFAIT! ⚡",
    good: "BIEN!",
    slow: "TROP LENT...",
    ranks: {
      novice: "Script Kiddie",
      hacker: "Hacker",
      cryptoMaster: "Maître Crypto",
      legend: "Légende"
    }
  }
};

interface Challenge {
  id: number;
  type: ChallengeType;
  encrypted: string;
  decrypted: string;
  hint: Record<Language, string>;
  timeLimit: number; // seconds
  points: number;
}

const challenges: Challenge[] = [
  // EASY
  {
    id: 1,
    type: "caesar",
    encrypted: "KHOOR", // HELLO +3
    decrypted: "HELLO",
    hint: { en: "Shift each letter back by 3", de: "Verschiebe jeden Buchstaben um 3 zurück", fr: "Décalez chaque lettre de 3 en arrière" },
    timeLimit: 30,
    points: 100
  },
  {
    id: 2,
    type: "reverse",
    encrypted: "DLROW OLLEH", // HELLO WORLD reversed words
    decrypted: "HELLO WORLD",
    hint: { en: "Read it backwards", de: "Rückwärts lesen", fr: "Lisez à l'envers" },
    timeLimit: 20,
    points: 80
  },
  {
    id: 3,
    type: "binary",
    encrypted: "01001000 01001001", // HI
    decrypted: "HI",
    hint: { en: "Binary to ASCII", de: "Binär zu ASCII", fr: "Binaire vers ASCII" },
    timeLimit: 45,
    points: 150
  },
  // MEDIUM
  {
    id: 4,
    type: "base64",
    encrypted: "U0VDUkVU", // SECRET
    decrypted: "SECRET",
    hint: { en: "Base64 decode", de: "Base64 dekodieren", fr: "Décoder Base64" },
    timeLimit: 40,
    points: 200
  },
  {
    id: 5,
    type: "caesar",
    encrypted: "ZHOFRPH WR FUBSWR", // WELCOME TO CRYPTO +3
    decrypted: "WELCOME TO CRYPTO",
    hint: { en: "Caesar shift of 3", de: "Caesar-Verschiebung um 3", fr: "Décalage César de 3" },
    timeLimit: 60,
    points: 250
  },
  {
    id: 6,
    type: "hex",
    encrypted: "4861636b6572", // Hacker
    decrypted: "Hacker",
    hint: { en: "Hex to ASCII", de: "Hex zu ASCII", fr: "Hex vers ASCII" },
    timeLimit: 50,
    points: 220
  },
  // HARD
  {
    id: 7,
    type: "base64",
    encrypted: "VGhlIHBhc3N3b3JkIGlzIDEzMzc=", // The password is 1337
    decrypted: "The password is 1337",
    hint: { en: "Longer Base64 text", de: "Längerer Base64 Text", fr: "Texte Base64 plus long" },
    timeLimit: 90,
    points: 400
  },
  {
    id: 8,
    type: "binary",
    encrypted: "01001110 01100101 01111000 01110100", // Next
    decrypted: "Next",
    hint: { en: "8-bit binary groups", de: "8-Bit Binär-Gruppen", fr: "Groupes binaires 8-bit" },
    timeLimit: 60,
    points: 350
  },
  {
    id: 9,
    type: "reverse",
    encrypted: "!etacilpud esaelp :drowssap terces", // secret password: please duplicate!
    decrypted: "secret password: please duplicate!",
    hint: { en: "Complete reverse", de: "Komplett umgekehrt", fr: "Complètement inversé" },
    timeLimit: 45,
    points: 300
  },
  {
    id: 10,
    type: "caesar",
    encrypted: "WKLV LV WKH ILQDO FKDOOHQJH", // THIS IS THE FINAL CHALLENGE +3
    decrypted: "THIS IS THE FINAL CHALLENGE",
    hint: { en: "Caesar +3", de: "Caesar +3", fr: "César +3" },
    timeLimit: 90,
    points: 500
  }
];

export default function CryptoSpeedrun() {
  const [language, setLanguage] = useState<Language>("en");
  const [gameState, setGameState] = useState<"menu" | "playing" | "result">("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"perfect" | "good" | "slow" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const t = translations[language];

  const getChallengesForDifficulty = () => {
    switch(difficulty) {
      case "easy": return challenges.slice(0, 3);
      case "medium": return challenges.slice(0, 6);
      case "hard": return challenges;
      default: return challenges;
    }
  };

  const currentChallenges = getChallengesForDifficulty();

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setStreak(0);
    setChallengeIndex(0);
    setCompleted([]);
    loadChallenge(0);
  };

  const loadChallenge = (index: number) => {
    if (index >= currentChallenges.length) {
      setGameState("result");
      return;
    }
    const challenge = currentChallenges[index];
    setCurrentChallenge(challenge);
    setTimeLeft(challenge.timeLimit);
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
  };

  const handleTimeout = () => {
    setStreak(0);
    setFeedback("slow");
    setTimeout(() => nextChallenge(), 1500);
  };

  const checkAnswer = () => {
    if (!currentChallenge) return;
    
    const normalizedInput = userInput.trim().toUpperCase();
    const normalizedAnswer = currentChallenge.decrypted.toUpperCase();
    
    if (normalizedInput === normalizedAnswer) {
      const timeBonus = Math.floor(timeLeft * 10);
      const streakBonus = streak * 50;
      const totalPoints = currentChallenge.points + timeBonus + streakBonus;
      
      setScore(score + totalPoints);
      setStreak(streak + 1);
      setCompleted([...completed, currentChallenge.id]);
      
      if (timeLeft > currentChallenge.timeLimit * 0.7) {
        setFeedback("perfect");
      } else {
        setFeedback("good");
      }
      
      setTimeout(() => nextChallenge(), 1500);
    } else {
      // Wrong answer - small penalty but continue
      setScore(Math.max(0, score - 50));
    }
  };

  const nextChallenge = () => {
    const nextIndex = challengeIndex + 1;
    setChallengeIndex(nextIndex);
    loadChallenge(nextIndex);
  };

  const getRank = (finalScore: number): string => {
    const maxPossible = currentChallenges.reduce((sum, c) => sum + c.points + (c.timeLimit * 10), 0);
    const percentage = (finalScore / maxPossible) * 100;
    
    if (percentage >= 90) return t.ranks.legend;
    if (percentage >= 70) return t.ranks.cryptoMaster;
    if (percentage >= 50) return t.ranks.hacker;
    return t.ranks.novice;
  };

  const getChallengeIcon = (type: ChallengeType) => {
    switch(type) {
      case "caesar": return <Lock className="w-5 h-5" />;
      case "base64": return <Hash className="w-5 h-5" />;
      case "binary": return <Binary className="w-5 h-5" />;
      case "hex": return <Sparkles className="w-5 h-5" />;
      case "reverse": return <RefreshCw className="w-5 h-5" />;
    }
  };

  if (gameState === "menu") {
    return (
      <ToolLayout title={t.title} icon={Trophy} description={t.subtitle}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 p-4">
          <div className="text-center space-y-2">
            <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-sm max-w-md">
              {t.instructions}
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex gap-2">
            {(['en', 'de', 'fr'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-2 text-xs font-mono rounded border ${
                  language === lang 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-muted border-border hover:border-primary/50'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Difficulty Selector */}
          <div className="w-full max-w-md space-y-3">
            <p className="text-xs font-mono text-center text-muted-foreground">{t.difficulty}</p>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`p-3 rounded-lg border font-mono text-xs transition-all ${
                    difficulty === diff
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted hover:border-primary/50'
                  }`}
                >
                  {t[diff]}
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" onClick={startGame} className="gap-2 font-mono text-lg px-8">
            <Zap className="w-5 h-5" />
            {t.startGame}
          </Button>
        </div>
      </ToolLayout>
    );
  }

  if (gameState === "result") {
    const rank = getRank(score);
    
    return (
      <ToolLayout title={t.title} icon={Trophy} description={t.gameOver}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-4">
          <Trophy className="w-16 h-16 text-primary" />
          <h2 className="text-2xl font-bold font-mono">{t.gameOver}</h2>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">{t.score}</p>
              <p className="text-2xl font-bold font-mono text-primary">{score}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">RANK</p>
              <p className="text-lg font-bold font-mono text-primary">{rank}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">{t.streak}</p>
              <p className="text-xl font-bold font-mono">{streak}🔥</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">COMPLETED</p>
              <p className="text-xl font-bold font-mono">{completed.length}/{currentChallenges.length}</p>
            </div>
          </div>

          <Button onClick={() => setGameState("menu")} className="gap-2 font-mono">
            <RefreshCw className="w-4 h-4" />
            {t.playAgain}
          </Button>
        </div>
      </ToolLayout>
    );
  }

  // Playing state
  return (
    <ToolLayout title={t.title} icon={Zap} description={t.subtitle}>
      <div className="max-w-2xl mx-auto space-y-4 p-4">
        {/* Header Stats */}
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono">
              <span className="text-muted-foreground">{t.score}: </span>
              <span className="text-primary font-bold">{score}</span>
            </div>
            <div className="text-xs font-mono">
              <span className="text-muted-foreground">{t.streak}: </span>
              <span className={`font-bold ${streak > 2 ? 'text-green-500' : ''}`}>{streak}🔥</span>
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            {challengeIndex + 1} / {currentChallenges.length}
          </div>
        </div>

        {/* Timer */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className={timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}>
              {t.time}: {timeLeft}s
            </span>
            <span className="text-muted-foreground">
              {currentChallenge ? `+${currentChallenge.points} pts` : ''}
            </span>
          </div>
          <Progress 
            value={(timeLeft / (currentChallenge?.timeLimit || 1)) * 100} 
            className={`h-2 ${timeLeft < 10 ? 'text-destructive' : ''}`}
          />
        </div>

        {/* Challenge Card */}
        {currentChallenge && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            {/* Challenge Type Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                {getChallengeIcon(currentChallenge.type)}
                <span className="text-xs font-mono font-bold">
                  {t.challengeTypes[currentChallenge.type]}
                </span>
              </div>
              <button 
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
              >
                {t.hint}
              </button>
            </div>

            {/* Hint (if shown) */}
            {showHint && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs font-mono text-yellow-600">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {currentChallenge.hint[language]}
              </div>
            )}

            {/* Encrypted Text */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">{t.decrypt}:</p>
              <div className="bg-muted p-4 rounded-lg border border-border">
                <code className="text-lg font-mono text-primary break-all">
                  {currentChallenge.encrypted}
                </code>
              </div>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">{t.enterAnswer}:</p>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                className="w-full bg-input border border-border rounded px-4 py-3 text-sm font-mono uppercase"
                placeholder="..."
                disabled={!!feedback}
              />
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`p-3 rounded-lg border text-center font-mono text-sm ${
                feedback === 'perfect' ? 'border-green-500 bg-green-500/10 text-green-500' :
                feedback === 'good' ? 'border-blue-500 bg-blue-500/10 text-blue-500' :
                'border-destructive bg-destructive/10 text-destructive'
              }`}>
                {feedback === 'perfect' && <span>⚡ {t.perfect} +{Math.floor(timeLeft * 10)} {t.timeBonus}!</span>}
                {feedback === 'good' && <span>✓ {t.good}</span>}
                {feedback === 'slow' && <span>✗ {t.slow}</span>}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              onClick={checkAnswer}
              disabled={!userInput || !!feedback}
              className="w-full gap-2 font-mono h-12"
            >
              {feedback ? (
                <><ChevronRight className="w-4 h-4" /> {t.next}</>
              ) : (
                <><Unlock className="w-4 h-4" /> {t.submit}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
