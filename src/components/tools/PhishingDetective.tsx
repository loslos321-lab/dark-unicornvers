import { useState, useEffect } from "react";
import { Target, CheckCircle, XCircle, AlertTriangle, Mail, MessageSquare, ExternalLink, Shield, RefreshCw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ToolLayout from "@/components/ToolLayout";

type Language = "en" | "de" | "fr";

interface Translation {
  title: string;
  subtitle: string;
  score: string;
  streak: string;
  rank: string;
  accuracy: string;
  legitimate: string;
  phishing: string;
  correct: string;
  wrong: string;
  next: string;
  finish: string;
  playAgain: string;
  redFlags: string;
  from: string;
  subject: string;
  url: string;
  missionComplete: string;
  case: string;
  of: string;
  difficulty: string;
  easy: string;
  medium: string;
  hard: string;
  types: {
    email: string;
    sms: string;
    website: string;
  };
  ranks: {
    novice: string;
    trainee: string;
    detective: string;
    expert: string;
  };
}

const translations: Record<Language, Translation> = {
  en: {
    title: "Phishing Detective",
    subtitle: "Spot the fakes - protect yourself",
    score: "SCORE",
    streak: "STREAK",
    rank: "RANK",
    accuracy: "ACCURACY",
    legitimate: "LEGITIMATE",
    phishing: "PHISHING",
    correct: "CORRECT!",
    wrong: "WRONG!",
    next: "NEXT CASE →",
    finish: "FINISH",
    playAgain: "PLAY AGAIN",
    redFlags: "RED FLAGS",
    from: "FROM",
    subject: "SUBJECT",
    url: "URL",
    missionComplete: "MISSION COMPLETE",
    case: "CASE",
    of: "OF",
    difficulty: "DIFFICULTY",
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD",
    types: {
      email: "EMAIL",
      sms: "SMS",
      website: "WEBSITE"
    },
    ranks: {
      novice: "Novice",
      trainee: "Trainee",
      detective: "Detective",
      expert: "Security Expert"
    }
  },
  de: {
    title: "Phishing Detektiv",
    subtitle: "Erkenne die Fälschungen - schütze dich",
    score: "PUNKTE",
    streak: "SERIE",
    rank: "RANG",
    accuracy: "GENAUIGKEIT",
    legitimate: "ECHT",
    phishing: "PHISHING",
    correct: "RICHTIG!",
    wrong: "FALSCH!",
    next: "NÄCHSTER FALL →",
    finish: "BEENDEN",
    playAgain: "NOCHMAL SPIELEN",
    redFlags: "WARNZEICHEN",
    from: "VON",
    subject: "BETREFF",
    url: "URL",
    missionComplete: "MISSION ABGESCHLOSSEN",
    case: "FALL",
    of: "VON",
    difficulty: "SCHWIERIGKEIT",
    easy: "LEICHT",
    medium: "MITTEL",
    hard: "SCHWER",
    types: {
      email: "E-MAIL",
      sms: "SMS",
      website: "WEBSEITE"
    },
    ranks: {
      novice: "Anfänger",
      trainee: "Auszubildender",
      detective: "Detektiv",
      expert: "Sicherheitsexperte"
    }
  },
  fr: {
    title: "Détective Phishing",
    subtitle: "Repérez les faux - protégez-vous",
    score: "SCORE",
    streak: "SÉRIE",
    rank: "RANG",
    accuracy: "PRÉCISION",
    legitimate: "LÉGITIME",
    phishing: "PHISHING",
    correct: "CORRECT!",
    wrong: "FAUX!",
    next: "CAS SUIVANT →",
    finish: "TERMINER",
    playAgain: "REJOUER",
    redFlags: "SIGNES D'ALERTE",
    from: "DE",
    subject: "OBJET",
    url: "URL",
    missionComplete: "MISSION ACCOMPLIE",
    case: "CAS",
    of: "SUR",
    difficulty: "DIFFICULTÉ",
    easy: "FACILE",
    medium: "MOYEN",
    hard: "DIFFICILE",
    types: {
      email: "EMAIL",
      sms: "SMS",
      website: "SITE WEB"
    },
    ranks: {
      novice: "Novice",
      trainee: "Stagiaire",
      detective: "Détective",
      expert: "Expert Sécurité"
    }
  }
};

interface Scenario {
  id: number;
  type: "email" | "website" | "sms";
  sender: string;
  subject?: string;
  content: string;
  isPhishing: boolean;
  redFlags?: Record<Language, string[]>;
  explanation: Record<Language, string>;
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
    redFlags: {
      en: ["Unknown sender with money offer", "Spelling mistakes", "Pressure (URGENT)", "Asks for bank details", "Advance fee from Nigeria"],
      de: ["Unbekannter Absender mit Geldangebot", "Rechtschreibfehler", "Druck (URGENT)", "Fordert Bankdaten", "Vorauszahlung aus Nigeria"],
      fr: ["Expéditeur inconnu avec offre d'argent", "Fautes d'orthographe", "Pression (URGENT)", "Demande coordonnées bancaires", "Frais avancés du Nigeria"]
    },
    explanation: {
      en: "Classic 'Nigerian Prince' scam. Unsolicited money offers from strangers are always fraud. Spelling mistakes and pressure ('URGENT') are typical signs.",
      de: "Klassischer 'Nigerian Prince' Scam. Ungewollte Geldangebote von Fremden sind immer Betrug. Rechtschreibfehler und Druck ('URGENT') sind typische Anzeichen.",
      fr: "Arnaque classique du 'Prince Nigérian'. Les offres d'argent non sollicitées de la part d'inconnus sont toujours des fraudes. Fautes d'orthographe et pression ('URGENT') sont des signes typiques."
    },
    difficulty: "easy",
  },
  {
    id: 2,
    type: "email",
    sender: "PayPal Service <service@paypa1-security.com>",
    subject: "Your account has been limited",
    content: "Dear Customer,\n\nWe noticed unusual activity on your account. Your account access has been limited. Please verify your identity by clicking the link below within 24 hours or your account will be permanently deleted.\n\nVerify Now: https://paypa1-security.com/verify\n\nBest regards,\nPayPal Security Team",
    isPhishing: true,
    redFlags: {
      en: ["Domain is 'paypa1' (with number 1) not 'paypal'", "Threat (account deletion)", "Pressure (24 hours)", "Generic greeting ('Customer')"],
      de: ["Domain ist 'paypa1' (mit Zahl 1) statt 'paypal'", "Drohung (Account-Löschung)", "Druck (24 Stunden)", "Generische Anrede ('Customer')"],
      fr: ["Domaine est 'paypa1' (avec chiffre 1) pas 'paypal'", "Menace (suppression compte)", "Pression (24 heures)", "Salutation générique ('Customer')"]
    },
    explanation: {
      en: "Phishing email with spoofed sender domain. Note 'paypa1' with number 1 instead of 'paypal'. Real companies don't threaten immediate deletion.",
      de: "Phishing-Mail mit gefälschter Absender-Domain. Achte auf 'paypa1' mit der Zahl 1 statt 'paypal'. Echte Firmen drohen nicht mit sofortiger Löschung.",
      fr: "Email de phishing avec domaine falsifié. Notez 'paypa1' avec le chiffre 1 au lieu de 'paypal'. Les vraies entreprises ne menacent pas de suppression immédiate."
    },
    difficulty: "easy",
  },
  {
    id: 3,
    type: "email",
    sender: "Amazon Orders <orders@amazon.com>",
    subject: "Your order #123-4567890 has shipped",
    content: "Hi there,\n\nYour recent order has been shipped and will arrive tomorrow.\n\nOrder Details:\n- 1x Wireless Headphones\n- Total: $49.99\n\nTrack your package: https://amazon.com/gp/your-account\n\nIf you didn't place this order, please contact us immediately.\n\nThe Amazon Team",
    isPhishing: false,
    redFlags: {
      en: [],
      de: [],
      fr: []
    },
    explanation: {
      en: "This is a legitimate Amazon email. Correct domain (@amazon.com), no pressure tactics, no request to enter sensitive data.",
      de: "Dies ist eine legitime Amazon-Mail. Korrekte Domain (@amazon.com), keine Druck-Taktik, keine Aufforderung sensitive Daten einzugeben.",
      fr: "Ceci est un email Amazon légitime. Domaine correct (@amazon.com), pas de tactique de pression, pas de demande de données sensibles."
    },
    difficulty: "easy",
  },
  {
    id: 4,
    type: "email",
    sender: "LinkedIn <notifications@linkedin.com>",
    subject: "Sarah Müller sent you a message",
    content: "Sarah Müller has sent you a message on LinkedIn:\n\n'Hi, ich habe eine tolle Job-Möglichkeit für dich! Kannst du mir mal deinen Lebenslauf schicken? Wir suchen dringend jemanden mit deinen Skills. Melde dich am besten direkt bei mir auf WhatsApp: +49 123 456789'\n\nView message: https://linkedin.com/messaging",
    isPhishing: true,
    redFlags: {
      en: ["Wants to continue outside platform (WhatsApp)", "Urgency ('urgently')", "Suspicious phone number", "Legitimate domain but suspicious content"],
      de: ["Kontaktaufnahme außerhalb der Plattform (WhatsApp)", "Dringlichkeit ('dringend')", "Verdächtige Telefonnummer", "Legitime Domain aber verdächtiger Inhalt"],
      fr: ["Veut continuer hors plateforme (WhatsApp)", "Urgence ('urgemment')", "Numéro de téléphone suspect", "Domaine légitime mais contenu suspect"]
    },
    explanation: {
      en: "Advanced attack: Real LinkedIn domain, but content tries to lure you to WhatsApp (where the scam happens). Never continue contact outside the platform!",
      de: "Fortgeschrittener Angriff: Echte LinkedIn-Domain, aber der Inhalt versucht dich auf WhatsApp zu locken (wo der Betrug stattfindet). Nie Kontakt außerhalb der Plattform fortsetzen!",
      fr: "Attaque avancée: Vrai domaine LinkedIn, mais le contenu tente de vous attirer sur WhatsApp (où l'arnaque se produit). Ne continuez jamais le contact hors plateforme!"
    },
    difficulty: "medium",
  },
  {
    id: 5,
    type: "sms",
    sender: "DHL Express",
    content: "DHL: Ihr Paket konnte nicht zugestellt werden. Bitte zahlen Sie 2,99€ Nachgebühr unter: https://dhl-tracking-support.com/pay",
    isPhishing: true,
    redFlags: {
      en: ["Unknown domain (not dhl.de)", "Payment requested via link", "SMS from 'DHL Express' (unusual)"],
      de: ["Unbekannte Domain (nicht dhl.de)", "Zahlung per Link gefordert", "SMS von 'DHL Express' (untypisch)"],
      fr: ["Domaine inconnu (pas dhl.fr)", "Paiement demandé via lien", "SMS de 'DHL Express' (inhabituel)"]
    },
    explanation: {
      en: "SMS phishing (Smishing). Parcel services never request payment for supposed additional fees via SMS. The domain is fake.",
      de: "SMS-Phishing (Smishing). Paketdienste verlangen nie per SMS Zahlungen für vermeintliche Nachgebühren. Die Domain ist gefälscht.",
      fr: "Phishing par SMS (Smishing). Les services de livraison ne demandent jamais de paiement pour des frais supposés via SMS. Le domaine est faux."
    },
    difficulty: "medium",
  },
  {
    id: 6,
    type: "email",
    sender: "IT Support <it-support@company.com>",
    subject: "Mandatory password change",
    content: "Hello Employee,\n\nDue to a security incident, all employees must change their passwords immediately. Please use the following secure link to update your credentials:\n\nhttps://internal-company-portal.com/password-reset\n\nThis link expires in 1 hour. Failure to comply will result in account suspension.\n\nIT Security Team",
    isPhishing: true,
    redFlags: {
      en: ["Threat (Account Suspension)", "Pressure (1 hour)", "External domain (not company-internal)", "Generic sender"],
      de: ["Drohung (Account-Sperrung)", "Druck (1 Stunde)", "Externe Domain (nicht firmen-intern)", "Generischer Absender"],
      fr: ["Menace (Suspension compte)", "Pression (1 heure)", "Domaine externe (pas interne entreprise)", "Expéditeur générique"]
    },
    explanation: {
      en: "Spear-phishing: Specifically targets employees. Domain 'internal-company-portal.com' is suspicious. Real IT uses internal systems and doesn't threaten.",
      de: "Spear-Phishing: Zielt spezifisch auf Mitarbeiter ab. Die Domain 'internal-company-portal.com' ist verdächtig. Echte IT nutzt interne Systeme und droht nicht.",
      fr: "Spear-phishing: Cible spécifiquement les employés. Le domaine 'internal-company-portal.com' est suspect. La vraie IT utilise des systèmes internes et ne menace pas."
    },
    difficulty: "hard",
  },
  {
    id: 7,
    type: "website",
    sender: "https://apple-icloud-findmy.com/signin",
    subject: "Find My iPhone",
    content: "Apple ID Sign In\n\nPlease sign in with your Apple ID to locate your device.\n\nEmail: _______________\nPassword: _______________\n[Sign In]\n\nForgot password?",
    isPhishing: true,
    redFlags: {
      en: ["Domain is 'apple-icloud-findmy.com' not 'icloud.com'", "Visually deceptive", "Request to enter password"],
      de: ["Domain ist 'apple-icloud-findmy.com' statt 'icloud.com'", "Visuell täuschend echt", "Aufforderung zur Passworteingabe"],
      fr: ["Domaine est 'apple-icloud-findmy.com' pas 'icloud.com'", "Visuellement trompeur", "Demande de saisie mot de passe"]
    },
    explanation: {
      en: "Phishing website. The domain contains 'apple' and 'icloud' but the real domain would simply be 'icloud.com'. Always check the URL!",
      de: "Phishing-Website. Die Domain enthält zwar 'apple' und 'icloud', aber die echte Domain wäre einfach 'icloud.com'. Immer die URL prüfen!",
      fr: "Site de phishing. Le domaine contient 'apple' et 'icloud' mais le vrai domaine serait simplement 'icloud.com'. Vérifiez toujours l'URL!"
    },
    difficulty: "hard",
  },
  {
    id: 8,
    type: "email",
    sender: "boss@company.com",
    subject: "Quick request",
    content: "Hey,\n\nBist du gerade im Büro? Ich brauche dringend deine Hilfe bei einer Überweisung. Kannst du mir schnell die Firmenkreditkarten-Daten schicken? Ich sitze gerade in einem Meeting und komme nicht an meine Unterlagen.\n\nDanke!\nMax (CEO)",
    isPhishing: true,
    redFlags: {
      en: ["CEO fraud", "Urgency", "Unusual request (credit card data via email)", "Informal tone for sensitive data"],
      de: ["CEO-Fraud (Betrug als Chef)", "Dringlichkeit", "Unübliche Anfrage (Kreditkartendaten per Mail)", "Informeller Ton für sensible Daten"],
      fr: ["Fraude CEO", "Urgence", "Demande inhabituelle (données carte crédit par email)", "Ton informel pour données sensibles"]
    },
    explanation: {
      en: "CEO fraud: Scammers pose as the boss. CEOs never request credit card data via email. When in doubt, always confirm personally or by phone!",
      de: "CEO-Fraud: Betrüger geben sich als Chef aus. Chefs verlangen nie per Email Kreditkartendaten. Bei Zweifeln immer persönlich oder per Telefonanruf bestätigen!",
      fr: "Fraude CEO: Les escrocs se font passer pour le patron. Les CEO ne demandent jamais les données de carte de crédit par email. En cas de doute, confirmez toujours personnellement ou par téléphone!"
    },
    difficulty: "hard",
  },
];

export default function PhishingDetective() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shuffledScenarios, setShuffledScenarios] = useState<Scenario[]>([]);

  const t = translations[currentLanguage];

  useEffect(() => {
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

  const getRank = (percentage: number): string => {
    if (percentage >= 90) return t.ranks.expert;
    if (percentage >= 70) return t.ranks.detective;
    if (percentage >= 50) return t.ranks.trainee;
    return t.ranks.novice;
  };

  if (shuffledScenarios.length === 0) return null;

  if (gameOver) {
    const maxScore = shuffledScenarios.length * 10;
    const percentage = Math.round((score / maxScore) * 100);
    const rank = getRank(percentage);

    return (
      <ToolLayout title={t.title} icon={Target} description={t.subtitle}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-4">
          <Shield className="w-16 h-16 text-primary" />
          <h2 className="text-2xl font-bold font-mono">{t.missionComplete}</h2>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">{t.score}</p>
              <p className="text-2xl font-bold font-mono text-primary">{score}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">{t.rank}</p>
              <p className="text-lg font-bold font-mono text-primary">{rank}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">{t.streak}</p>
              <p className="text-xl font-bold font-mono">{maxStreak}🔥</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">{t.accuracy}</p>
              <p className="text-xl font-bold font-mono">{percentage}%</p>
            </div>
          </div>

          <Button onClick={restartGame} className="gap-2 font-mono">
            <RefreshCw className="w-4 h-4" />
            {t.playAgain}
          </Button>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout title={t.title} icon={Target} description={t.subtitle}>
      <div className="max-w-2xl mx-auto space-y-4 p-4">
        {/* Language Switcher */}
        <div className="flex justify-end gap-2 mb-2">
          {(['en', 'de', 'fr'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setCurrentLanguage(lang)}
              className={`px-3 py-1 text-xs font-mono rounded border ${
                currentLanguage === lang 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-muted border-border hover:border-primary/50'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
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
            {t.case} {currentIndex + 1} {t.of} {shuffledScenarios.length}
          </div>
        </div>

        <Progress value={(currentIndex / shuffledScenarios.length) * 100} className="h-2" />

        {/* Scenario Card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentScenario.type === "email" && <Mail className="w-4 h-4 text-primary" />}
              {currentScenario.type === "sms" && <MessageSquare className="w-4 h-4 text-primary" />}
              {currentScenario.type === "website" && <ExternalLink className="w-4 h-4 text-primary" />}
              <span className="text-xs font-mono uppercase text-muted-foreground">
                {t.types[currentScenario.type]} • {t[currentScenario.difficulty]}
              </span>
            </div>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {currentScenario.type === "email" && (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">{t.from}:</p>
                  <p className="text-sm font-mono break-all">{currentScenario.sender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">{t.subject}:</p>
                  <p className="text-sm font-bold">{currentScenario.subject}</p>
                </div>
                <hr className="border-border" />
              </>
            )}
            
            {currentScenario.type === "website" && (
              <div className="space-y-1 mb-3">
                <p className="text-xs text-muted-foreground font-mono">{t.url}:</p>
                <p className="text-sm font-mono text-primary break-all">{currentScenario.sender}</p>
              </div>
            )}

            {currentScenario.type === "sms" && (
              <div className="space-y-1 mb-3">
                <p className="text-xs text-muted-foreground font-mono">{t.from}:</p>
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
              {t.legitimate}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => handleAnswer(true)}
              className="h-16 font-mono text-sm border-destructive/50 hover:bg-destructive/10"
            >
              <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
              {t.phishing}
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
                  {selectedAnswer === currentScenario.isPhishing ? t.correct : t.wrong}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {currentScenario.explanation[currentLanguage]}
              </p>
              
              {currentScenario.redFlags && currentScenario.redFlags[currentLanguage] && currentScenario.redFlags[currentLanguage].length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-mono text-primary">{t.redFlags}:</p>
                  <ul className="text-xs font-mono text-muted-foreground list-disc list-inside">
                    {currentScenario.redFlags[currentLanguage].map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button onClick={nextScenario} className="w-full font-mono gap-2">
              {currentIndex < shuffledScenarios.length - 1 ? t.next : t.finish}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
