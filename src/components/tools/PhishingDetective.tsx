import { useState, useEffect } from "react";
import { Target, CheckCircle, XCircle, AlertTriangle, Mail, MessageSquare, ExternalLink, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ToolLayout from "@/components/ToolLayout";

interface Scenario {
  id: number;
  type: "email" | "website" | "sms";
  sender: string;
  subject?: string;
  content: string;
  isPhishing: boolean;
  redFlags?: string[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

const scenarios: Scenario[] = [
  {
    id: 1,
    type: "email",
    sender: "Prince Abdullah <prince.abdullah@royal-family-nigeria.com>",
    subject: "URGENT: $15,000,000 inheritance",
    content: "Dear Friend,\n\nI am Prince Abdullah from Nigeria. My father died and left $15M in a bank account. I need your help to transfer the money. If you send me $500 for the transfer fee, I will give you 30% of the money.\n\nPlease reply with your bank details.\n\nGod bless you,\nPrince Abdullah",
    isPhishing: true,
    redFlags: ["Unbekannter Absender mit Geldangebot", "Rechtschreibfehler", "Druck (URGENT)", "Bankdaten anfordern", "Von Nigeria/Vorabgebühr"],
    explanation: "Klassischer 'Nigerian Prince' Scam. Ungewollte Geldangebote aus dem Nichts sind immer Betrug. Rechtschreibfehler und Druck ('URGENT') sind typische Anzeichen.",
    difficulty: "easy",
  },
  {
    id: 2,
    type: "email",
    sender: "PayPal Service <service@paypa1-security.com>",
    subject: "Your account has been limited",
    content: "Dear Customer,\n\nWe noticed unusual activity on your account. Your account access has been limited. Please verify your identity by clicking the link below within 24 hours or your account will be permanently deleted.\n\nVerify Now: https://paypa1-security.com/verify\n\nBest regards,\nPayPal Security Team",
    isPhishing: true,
    redFlags: ["Domain ist 'paypa1' (mit der Zahl 1) statt 'paypal'", "Drohung (Account wird gelöscht)", "Druck (24 Stunden)", "Generische Anrede ('Customer')"],
    explanation: "Phishing-Mail mit gefälschter Absender-Domain. Achte auf 'paypa1' mit der Zahl 1 statt 'paypal'. Echte Firmen drohen nicht mit sofortiger Löschung.",
    difficulty: "easy",
  },
  {
    id: 3,
    type: "email",
    sender: "Amazon Orders <orders@amazon.com>",
    subject: "Your order #123-4567890 has shipped",
    content: "Hi there,\n\nYour recent order has been shipped and will arrive tomorrow.\n\nOrder Details:\n- 1x Wireless Headphones\n- Total: $49.99\n\nTrack your package: https://amazon.com/gp/your-account\n\nIf you didn't place this order, please contact us immediately.\n\nThe Amazon Team",
    isPhishing: false,
    redFlags: [],
    explanation: "Dies ist eine legitime Amazon-Mail. Die Domain ist korrekt (@amazon.com), keine Druck-Taktik, keine Aufforderung sensitive Daten einzugeben.",
    difficulty: "easy",
  },
  {
    id: 4,
    type: "email",
    sender: "LinkedIn <notifications@linkedin.com>",
    subject: "Sarah Müller sent you a message",
    content: "Sarah Müller has sent you a message on LinkedIn:\n\n'Hi, ich habe eine tolle Job-Möglichkeit für dich! Kannst du mir mal deinen Lebenslauf schicken? Wir suchen dringend jemanden mit deinen Skills. Melde dich am besten direkt bei mir auf WhatsApp: +49 123 456789'\n\nView message: https://linkedin.com/messaging",
    isPhishing: true,
    redFlags: ["Kontaktaufnahme außerhalb der Plattform (WhatsApp)", "Dringlichkeit ('dringend')", "Verdächtige Telefonnummer", "Legitime Domain aber verdächtiger Inhalt"],
    explanation: "Fortgeschrittener Angriff: Echte LinkedIn-Domain, aber der Inhalt versucht dich auf WhatsApp zu locken (wo der Betrug stattfindet). Nie Kontakt außerhalb der Plattform fortsetzen!",
    difficulty: "medium",
  },
  {
    id: 5,
    type: "sms",
    sender: "DHL Express",
    content: "DHL: Ihr Paket konnte nicht zugestellt werden. Bitte zahlen Sie 2,99€ Nachgebühr unter: https://dhl-tracking-support.com/pay",
    isPhishing: true,
    redFlags: ["Unbekannte Domain (nicht dhl.de)", "Aufforderung zur Zahlung per Link", "SMS von 'DHL Express' (untypisch)"],
    explanation: "SMS-Phishing (Smishing). Paketdienste verlangen nie per SMS Zahlungen für vermeintliche Nachgebühren. Die Domain ist gefälscht.",
    difficulty: "medium",
  },
  {
    id: 6,
    type: "email",
    sender: "IT Support <it-support@company.com>",
    subject: "Mandatory password change",
    content: "Hello Employee,\n\nDue to a security incident, all employees must change their passwords immediately. Please use the following secure link to update your credentials:\n\nhttps://internal-company-portal.com/password-reset\n\nThis link expires in 1 hour. Failure to comply will result in account suspension.\n\nIT Security Team",
    isPhishing: true,
    redFlags: ["Drohung (Account Suspension)", "Druck (1 Stunde)", "Externe Domain (nicht firmen-intern)", "Generischer Absender"],
    explanation: "Spear-Phishing: Zielt spezifisch auf Mitarbeiter ab. Die Domain 'internal-company-portal.com' ist verdächtig. Echte IT nutzt interne Systeme und droht nicht.",
    difficulty: "hard",
  },
  {
    id: 7,
    type: "website",
    sender: "https://apple-icloud-findmy.com/signin",
    subject: "Find My iPhone",
    content: "Apple ID Sign In\n\nPlease sign in with your Apple ID to locate your device.\n\nEmail: _______________\nPassword: _______________\n[Sign In]\n\nForgot password?",
    isPhishing: true,
    redFlags: ["Domain ist 'apple-icloud-findmy.com' statt 'icloud.com'", "Visuell täuschend echt", "Aufforderung zur Passworteingabe"],
    explanation: "Phishing-Website. Die Domain enthält zwar 'apple' und 'icloud', aber die echte Domain wäre einfach 'icloud.com'. Immer die URL prüfen!",
    difficulty: "hard",
  },
  {
    id: 8,
    type: "email",
    sender: "boss@company.com",
    subject: "Quick request",
    content: "Hey,\n\nBist du gerade im Büro? Ich brauche dringend deine Hilfe bei einer Überweisung. Kannst du mir schnell die Firmenkreditkarten-Daten schicken? Ich sitze gerade in einem Meeting und komme nicht an meine Unterlagen.\n\nDanke!\nMax (CEO)",
    isPhishing: true,
    redFlags: ["CEO-Fraud (Betrug als Chef)", "Dringlichkeit", "Unübliche Anfrage (Kreditkartendaten per Mail)", "Informeller Ton für sensible Daten"],
    explanation: "CEO-Fraud: Betrüger geben sich als Chef aus. Chefs verlangen nie per Email Kreditkartendaten. Bei Zweifeln immer persönlich oder per Telefonanruf bestätigen!",
    difficulty: "hard",
  },
];

export default function PhishingDetective() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shuffledScenarios, setShuffledScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    // Shuffle scenarios on mount
    const shuffled = [...scenarios].sort(() => Math.random() - 0.5);
    setShuffledScenarios(shuffled);
  }, []);

  const currentScenario = shuffledScenarios[currentIndex];

  const handleAnswer = (isPhishingGuess: boolean) => {
    if (answered) return;
    
    setAnswered(true);
    setSelectedAnswer(isPhishingGuess);
    
    const correct = isPhishingGuess === currentScenario.isPhishing;
    
    if (correct) {
      setScore(score + 10 + (streak * 2));
      setStreak(streak + 1);
      if (streak + 1 > maxStreak) setMaxStreak(streak + 1);
    } else {
      setStreak(0);
    }
    
    setShowExplanation(true);
  };

  const nextScenario = () => {
    if (currentIndex < shuffledScenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameOver(true);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameOver(false);
    setShuffledScenarios([...scenarios].sort(() => Math.random() - 0.5));
  };

  if (shuffledScenarios.length === 0) return null;

  if (gameOver) {
    const maxScore = shuffledScenarios.length * 10;
    const percentage = Math.round((score / maxScore) * 100);
    let rank = "Novice";
    if (percentage >= 90) rank = "Security Expert";
    else if (percentage >= 70) rank = "Detective";
    else if (percentage >= 50) rank = "Trainee";

    return (
      <ToolLayout title="Phishing Detective" icon={Target} description="Test completed">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-4">
          <Shield className="w-16 h-16 text-primary" />
          <h2 className="text-2xl font-bold font-mono">MISSION COMPLETE</h2>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">SCORE</p>
              <p className="text-2xl font-bold font-mono text-primary">{score}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">RANK</p>
              <p className="text-lg font-bold font-mono text-primary">{rank}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">MAX STREAK</p>
              <p className="text-xl font-bold font-mono">{maxStreak}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">ACCURACY</p>
              <p className="text-xl font-bold font-mono">{percentage}%</p>
            </div>
          </div>

          <Button onClick={restartGame} className="gap-2 font-mono">
            <RefreshCw className="w-4 h-4" />
            PLAY AGAIN
          </Button>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout title="Phishing Detective" icon={Target} description="Spot the fakes - protect yourself">
      <div className="max-w-2xl mx-auto space-y-4 p-4">
        {/* Stats Bar */}
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono">
              <span className="text-muted-foreground">SCORE: </span>
              <span className="text-primary font-bold">{score}</span>
            </div>
            <div className="text-xs font-mono">
              <span className="text-muted-foreground">STREAK: </span>
              <span className={`font-bold ${streak > 2 ? 'text-green-500' : ''}`}>{streak}🔥</span>
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            {currentIndex + 1} / {shuffledScenarios.length}
          </div>
        </div>

        <Progress value={(currentIndex / shuffledScenarios.length) * 100} className="h-2" />

        {/* Scenario Card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-muted/50 p-3 border-b border-border flex items-center gap-2">
            {currentScenario.type === "email" && <Mail className="w-4 h-4 text-primary" />}
            {currentScenario.type === "sms" && <MessageSquare className="w-4 h-4 text-primary" />}
            {currentScenario.type === "website" && <ExternalLink className="w-4 h-4 text-primary" />}
            <span className="text-xs font-mono uppercase text-muted-foreground">
              {currentScenario.type} • {currentScenario.difficulty}
            </span>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {currentScenario.type === "email" && (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">FROM:</p>
                  <p className="text-sm font-mono break-all">{currentScenario.sender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">SUBJECT:</p>
                  <p className="text-sm font-bold">{currentScenario.subject}</p>
                </div>
                <hr className="border-border" />
              </>
            )}
            
            {currentScenario.type === "website" && (
              <div className="space-y-1 mb-3">
                <p className="text-xs text-muted-foreground font-mono">URL:</p>
                <p className="text-sm font-mono text-primary break-all">{currentScenario.sender}</p>
              </div>
            )}

            {currentScenario.type === "sms" && (
              <div className="space-y-1 mb-3">
                <p className="text-xs text-muted-foreground font-mono">FROM:</p>
                <p className="text-sm font-mono">{currentScenario.sender}</p>
              </div>
            )}

            <div className="bg-muted/30 p-3 rounded border border-border whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {currentScenario.content}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!answered ? (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              size="lg"
              variant="outline"
              onClick={() => handleAnswer(false)}
              className="h-16 font-mono text-sm border-green-500/50 hover:bg-green-500/10"
            >
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              LEGITIMATE
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => handleAnswer(true)}
              className="h-16 font-mono text-sm border-destructive/50 hover:bg-destructive/10"
            >
              <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
              PHISHING
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              selectedAnswer === currentScenario.isPhishing 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-destructive bg-destructive/10'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === currentScenario.isPhishing ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <span className={`font-bold font-mono ${
                  selectedAnswer === currentScenario.isPhishing ? 'text-green-500' : 'text-destructive'
                }`}>
                  {selectedAnswer === currentScenario.isPhishing ? 'CORRECT!' : 'WRONG!'}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{currentScenario.explanation}</p>
              
              {currentScenario.redFlags && currentScenario.redFlags.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-mono text-primary">RED FLAGS:</p>
                  <ul className="text-xs font-mono text-muted-foreground list-disc list-inside">
                    {currentScenario.redFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button onClick={nextScenario} className="w-full font-mono gap-2">
              {currentIndex < shuffledScenarios.length - 1 ? 'NEXT CASE →' : 'FINISH'}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
