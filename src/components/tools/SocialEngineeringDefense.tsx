import { useState, useEffect } from "react";
import { BrainCircuit, MessageSquare, Shield, AlertTriangle, CheckCircle, XCircle, User, Building, Phone, Mail, RefreshCw, Trophy, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ToolLayout from "@/components/ToolLayout";

type Language = "en" | "de" | "fr";
type ScenarioType = "ceo-fraud" | "tech-support" | "pretexting" | "baiting";

interface Translation {
  title: string;
  subtitle: string;
  startGame: string;
  mission: string;
  trustLevel: string;
  high: string;
  medium: string;
  low: string;
  compromised: string;
  messageFrom: string;
  callerId: string;
  emailFrom: string;
  yourResponse: string;
  whatDoYouDo: string;
  correct: string;
  wrong: string;
  explanation: string;
  next: string;
  missionComplete: string;
  playAgain: string;
  rank: string;
  scenariosCompleted: string;
  trustMaintained: string;
  gameOver: string;
  trustLost: string;
  youFailed: string;
  tryAgain: string;
  ranks: {
    victim: string;
    aware: string;
    defender: string;
    expert: string;
  };
  types: Record<ScenarioType, string>;
}

const translations: Record<Language, Translation> = {
  en: {
    title: "Social Engineering Defense",
    subtitle: "Detect manipulation attempts and defend yourself",
    startGame: "START TRAINING",
    mission: "MISSION",
    trustLevel: "TRUST LEVEL",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
    compromised: "COMPROMISED!",
    messageFrom: "Message from",
    callerId: "Caller ID",
    emailFrom: "Email from",
    yourResponse: "Your response",
    whatDoYouDo: "What do you do?",
    correct: "GOOD CHOICE!",
    wrong: "DANGEROUS!",
    explanation: "Explanation",
    next: "Continue →",
    missionComplete: "TRAINING COMPLETE",
    playAgain: "TRAIN AGAIN",
    rank: "RANK",
    scenariosCompleted: "Scenarios completed",
    trustMaintained: "Trust maintained",
    gameOver: "MISSION FAILED",
    trustLost: "You fell for the social engineering attack!",
    youFailed: "The attacker got what they wanted.",
    tryAgain: "TRY AGAIN",
    ranks: {
      victim: "Easy Target",
      aware: "Security Aware",
      defender: "Human Firewall",
      expert: "Social Engineering Expert"
    },
    types: {
      "ceo-fraud": "CEO Fraud",
      "tech-support": "Tech Support Scam",
      "pretexting": "Pretexting",
      "baiting": "Baiting Attack"
    }
  },
  de: {
    title: "Social Engineering Abwehr",
    subtitle: "Erkenne Manipulationsversuche und wehre dich",
    startGame: "TRAINING STARTEN",
    mission: "MISSION",
    trustLevel: "VERTRAUENSLEVEL",
    high: "HOCH",
    medium: "MITTEL",
    low: "NIEDRIG",
    compromised: "KOMPROMITTiert!",
    messageFrom: "Nachricht von",
    callerId: "Anrufer-ID",
    emailFrom: "E-Mail von",
    yourResponse: "Deine Antwort",
    whatDoYouDo: "Was machst du?",
    correct: "RICHTIG!",
    wrong: "GEFAHR!",
    explanation: "Erklärung",
    next: "Weiter →",
    missionComplete: "TRAINING ABGESCHLOSSEN",
    playAgain: "NOCHMAL TRAINIEREN",
    rank: "RANG",
    scenariosCompleted: "Szenarien abgeschlossen",
    trustMaintained: "Vertrauen bewahrt",
    gameOver: "MISSION FEHLGESCHLAGEN",
    trustLost: "Du bist auf den Social Engineering Angriff hereingefallen!",
    youFailed: "Der Angreifer hat bekommen was er wollte.",
    tryAgain: "NOCHMAL VERSUCHEN",
    ranks: {
      victim: "Leichte Beute",
      aware: "Sicherheitsbewusst",
      defender: "Menschliche Firewall",
      expert: "Social Engineering Experte"
    },
    types: {
      "ceo-fraud": "CEO-Betrug",
      "tech-support": "Tech-Support-Betrug",
      "pretexting": "Vortäuschung",
      "baiting": "Köder-Angriff"
    }
  },
  fr: {
    title: "Défense Ingénierie Sociale",
    subtitle: "Détectez les tentatives de manipulation",
    startGame: "COMMENCER ENTRAINEMENT",
    mission: "MISSION",
    trustLevel: "NIVEAU CONFIANCE",
    high: "HAUT",
    medium: "MOYEN",
    low: "FAIBLE",
    compromised: "COMPROMIS!",
    messageFrom: "Message de",
    callerId: "ID Appelant",
    emailFrom: "Email de",
    yourResponse: "Votre réponse",
    whatDoYouDo: "Que faites-vous?",
    correct: "BON CHOIX!",
    wrong: "DANGEREUX!",
    explanation: "Explication",
    next: "Continuer →",
    missionComplete: "ENTRAINEMENT TERMINÉ",
    playAgain: "REJOUER",
    rank: "RANG",
    scenariosCompleted: "Scénarios complétés",
    trustMaintained: "Confiance maintenue",
    gameOver: "MISSION ÉCHOUÉE",
    trustLost: "Vous êtes tombé dans le piège!",
    youFailed: "L'attaquant a obtenu ce qu'il voulait.",
    tryAgain: "RÉESSAYER",
    ranks: {
      victim: "Cible Facile",
      aware: "Conscient Sécurité",
      defender: "Pare-feu Humain",
      expert: "Expert Ingénierie Sociale"
    },
    types: {
      "ceo-fraud": "Fraude CEO",
      "tech-support": "Arnaque Support Tech",
      "pretexting": "Prétexte",
      "baiting": "Appât"
    }
  }
};

interface Message {
  id: number;
  sender: "attacker" | "user" | "system";
  text: Record<Language, string>;
  trustImpact?: number; // Negative for user mistakes
}

interface Choice {
  id: string;
  text: Record<Language, string>;
  correct: boolean;
  explanation: Record<Language, string>;
  trustImpact: number; // How much trust is lost/gained
}

interface Scenario {
  id: number;
  type: ScenarioType;
  icon: React.ElementType;
  attackerName: string;
  attackerRole: Record<Language, string>;
  context: Record<Language, string>;
  messages: Message[];
  choices: Choice[];
}

const scenarios: Scenario[] = [
  {
    id: 1,
    type: "ceo-fraud",
    icon: Building,
    attackerName: "Dr. Schmidt",
    attackerRole: {
      en: "CEO",
      de: "Geschäftsführer",
      fr: "PDG"
    },
    context: {
      en: "Friday 4:55 PM - You receive an urgent message",
      de: "Freitag 16:55 Uhr - Du erhältst eine dringende Nachricht",
      fr: "Vendredi 16:55 - Vous recevez un message urgent"
    },
    messages: [
      {
        id: 1,
        sender: "attacker",
        text: {
          en: "Hi, I'm in a board meeting right now and need your help urgently. I need you to buy 10 Amazon gift cards (€100 each) for a client presentation. I can't access my corporate card from here. Send me the codes ASAP, I'll reimburse you Monday.",
          de: "Hi, ich sitze gerade in einer Vorstandssitzung und brauche dringend deine Hilfe. Ich brauche 10 Amazon Gutscheine (je 100€) für eine Kundenpräsentation. Ich komme nicht an meine Firmenkarte ran. Schick mir die Codes ASAP, ich erstatte es dir am Montag.",
          fr: "Bonjour, je suis en réunion de direction et j'ai besoin de votre aide urgente. J'ai besoin de 10 cartes cadeaux Amazon (100€ chacune) pour une présentation client. Je n'ai pas accès à ma carte entreprise. Envoyez-moi les codes ASAP, je vous rembourse lundi."
        }
      }
    ],
    choices: [
      {
        id: "a1",
        text: {
          en: "OK, I'll buy them right now and send the codes.",
          de: "OK, ich kaufe sie sofort und schicke die Codes.",
          fr: "OK, je les achète tout de suite et envoie les codes."
        },
        correct: false,
        explanation: {
          en: "NEVER buy gift cards for 'the boss' via chat. This is classic CEO fraud. Real executives don't ask for gift cards urgently.",
          de: "KAUF NIE Gutscheine für 'den Chef' via Chat. Das ist klassischer CEO-Betrug. Echte Geschäftsführer bitten nicht dringend um Gutscheine.",
          fr: "N'ACHETEZ JAMAIS de cartes cadeaux pour 'le patron' par chat. C'est la fraude CEO classique. Les vrais dirigeants ne demandent pas urgemment des cartes cadeaux."
        },
        trustImpact: -50
      },
      {
        id: "a2",
        text: {
          en: "I'll call you on your office phone to confirm this request.",
          de: "Ich rufe dich auf deinem Bürotelefon an, um das zu bestätigen.",
          fr: "Je vous appelle sur votre téléphone de bureau pour confirmer."
        },
        correct: true,
        explanation: {
          en: "EXCELLENT! Always verify unusual financial requests via a known phone number, not the one provided in the suspicious message.",
          de: "AUSGEZEICHNET! Überprüfe ungewöhnliche finanzielle Anfragen immer über eine bekannte Telefonnummer, nicht die in der verdächtigen Nachricht.",
          fr: "EXCELLENT! Vérifiez toujours les demandes financières inhabituelles via un numéro connu, pas celui fourni dans le message suspect."
        },
        trustImpact: 0
      },
      {
        id: "a3",
        text: {
          en: "Sure, but I need the company's accounting department to approve this first.",
          de: "Klar, aber ich brauche die Genehmigung der Buchhaltung erst.",
          fr: "Bien sûr, mais j'ai besoin de l'approbation de la comptabilité d'abord."
        },
        correct: true,
        explanation: {
          en: "GOOD! Following proper procedures stops fraud. Urgent requests bypassing process are red flags.",
          de: "GUT! Eingehaltene Prozesse stoppen Betrug. Dringende Anfragen die Prozesse umgehen sind Warnzeichen.",
          fr: "BIEN! Suivre les procédures arrête la fraude. Les demandes urgentes contournant les processus sont des signaux d'alerte."
        },
        trustImpact: 0
      }
    ]
  },
  {
    id: 2,
    type: "tech-support",
    icon: Phone,
    attackerName: "Microsoft Support",
    attackerRole: {
      en: "Senior Technician",
      de: "Senior Techniker",
      fr: "Technicien Senior"
    },
    context: {
      en: "Tuesday 11:30 AM - Phone call",
      de: "Dienstag 11:30 Uhr - Telefonanruf",
      fr: "Mardi 11:30 - Appel téléphonique"
    },
    messages: [
      {
        id: 1,
        sender: "attacker",
        text: {
          en: "Hello, this is Microsoft Support. We've detected a critical virus on your computer that's spreading to our servers. I need you to give me remote access immediately to stop the infection. Please download AnyDesk from the link I'll send you.",
          de: "Guten Tag, hier ist Microsoft Support. Wir haben einen kritischen Virus auf Ihrem Computer entdeckt, der sich auf unsere Server ausbreitet. Ich brauche sofortigen Fernzugriff um die Infektion zu stoppen. Bitte laden Sie AnyDesk von dem Link herunter, den ich Ihnen schicke.",
          fr: "Bonjour, ici Microsoft Support. Nous avons détecté un virus critique sur votre ordinateur qui se propage à nos serveurs. J'ai besoin d'un accès à distance immédiat pour arrêter l'infection. Veuillez télécharger AnyDesk depuis le lien que je vais vous envoyer."
        }
      }
    ],
    choices: [
      {
        id: "b1",
        text: {
          en: "OK, I'm downloading AnyDesk now. What's the code?",
          de: "OK, ich lade AnyDesk jetzt herunter. Wie ist der Code?",
          fr: "OK, je télécharge AnyDesk maintenant. Quel est le code?"
        },
        correct: false,
        explanation: {
          en: "DANGEROUS! Real Microsoft never calls users about viruses. Never give remote access to unsolicited callers.",
          de: "GEFÄHRLICH! Echtes Microsoft ruft nie wegen Viren an. Gib niemals Fernzugriff an unaufgeforderte Anrufer.",
          fr: "DANGEREUX! Le vrai Microsoft n'appelle jamais pour des virus. Ne donnez jamais d'accès à distance à des appelants non sollicités."
        },
        trustImpact: -50
      },
      {
        id: "b2",
        text: {
          en: "I don't have any issues with my computer. Please remove me from your list.",
          de: "Ich habe keine Probleme mit meinem Computer. Bitte nehmen Sie mich von Ihrer Liste.",
          fr: "Je n'ai aucun problème avec mon ordinateur. Veuillez me retirer de votre liste."
        },
        correct: true,
        explanation: {
          en: "PERFECT! Hang up on tech support scammers. Real IT departments don't make unsolicited calls about viruses.",
          de: "PERFEKT! Lege bei Tech-Support-Betrügern auf. Echte IT-Abteilungen rufen nicht unaufgefordert wegen Viren an.",
          fr: "PARFAIT! Raccrochez sur les escrocs du support technique. Les vrais services IT n'appellent pas sans sollicitation pour des virus."
        },
        trustImpact: 0
      },
      {
        id: "b3",
        text: {
          en: "Can you tell me my computer's serial number or my Microsoft account email?",
          de: "Können Sie mir die Seriennummer meines Computers oder meine Microsoft E-Mail nennen?",
          fr: "Pouvez-vous me donner le numéro de série de mon ordinateur ou mon email Microsoft?"
        },
        correct: true,
        explanation: {
          en: "SMART! Asking for verification data they should have (but don't) exposes scammers. Real support can verify your identity.",
          de: "SCHLAU! Nach Verifikationsdaten fragen die sie haben sollten (aber nicht haben) entlarvt Betrüger. Echter Support kann deine Identität verifizieren.",
          fr: "MALIN! Demander des données de vérification qu'ils devraient avoir (mais n'ont pas) expose les escrocs. Le vrai support peut vérifier votre identité."
        },
        trustImpact: 0
      }
    ]
  },
  {
    id: 3,
    type: "pretexting",
    icon: User,
    attackerName: "Sarah Miller",
    attackerRole: {
      en: "IT Security Auditor",
      de: "IT Sicherheitsauditor",
      fr: "Auditeur Sécurité IT"
    },
    context: {
      en: "Wednesday 2:15 PM - Email with official logo",
      de: "Mittwoch 14:15 Uhr - E-Mail mit offiziellem Logo",
      fr: "Mercredi 14:15 - Email avec logo officiel"
    },
    messages: [
      {
        id: 1,
        sender: "attacker",
        text: {
          en: "Hi! I'm Sarah from IT Security. We're conducting a mandatory password audit due to recent security concerns. Please reply to this email with your current password so we can verify it meets our new complexity requirements. This is required by end of day.",
          de: "Hallo! Ich bin Sarah von der IT-Sicherheit. Wir führen eine obligatorische Passwortprüfung durch aufgrund kürzlicher Sicherheitsbedenken. Bitte antworten Sie auf diese E-Mail mit Ihrem aktuellen Passwort, damit wir verifizieren können, dass es die neuen Komplexitätsanforderungen erfüllt. Erforderlich bis heute Abend.",
          fr: "Bonjour! Je suis Sarah de la sécurité IT. Nous effectuons un audit de mots de passe obligatoire suite à des problèmes de sécurité récents. Veuillez répondre à cet email avec votre mot de passe actuel pour que nous vérifiions qu'il répond aux nouvelles exigences de complexité. Requis avant ce soir."
        }
      }
    ],
    choices: [
      {
        id: "c1",
        text: {
          en: "Sure, my password is: [sends password]",
          de: "Klar, mein Passwort ist: [schickt Passwort]",
          fr: "Bien sûr, mon mot de passe est: [envoie mot de passe]"
        },
        correct: false,
        explanation: {
          en: "CRITICAL ERROR! Legitimate IT NEVER asks for passwords via email. NEVER share passwords via email, chat, or phone.",
          de: "KRITISCHER FEHLER! Echte IT fragt NIE nach Passwörtern per E-Mail. Gib NIE Passwörter per E-Mail, Chat oder Telefon weiter.",
          fr: "ERREUR CRITIQUE! L'IT légitime ne demande JAMAIS les mots de passe par email. Ne partagez JAMAIS de mots de passe par email, chat ou téléphone."
        },
        trustImpact: -50
      },
      {
        id: "c2",
        text: {
          en: "I'll change my password through the official company portal, not via email.",
          de: "Ich ändere mein Passwort über das offizielle Firmenportal, nicht per E-Mail.",
          fr: "Je changerai mon mot de passe via le portail officiel de l'entreprise, pas par email."
        },
        correct: true,
        explanation: {
          en: "EXCELLENT! Always use official channels for password changes. Real security teams never ask for current passwords.",
          de: "AUSGEZEICHNET! Nutze immer offizielle Kanäle für Passwortänderungen. Echte Sicherheitsteams fragen nie nach aktuellen Passwörtern.",
          fr: "EXCELLENT! Utilisez toujours les canaux officiels pour changer les mots de passe. Les vraies équipes de sécurité ne demandent jamais les mots de passe actuels."
        },
        trustImpact: 0
      },
      {
        id: "c3",
        text: {
          en: "I need to verify your identity first. What's your employee ID and extension?",
          de: "Ich muss Ihre Identität zuerst verifizieren. Wie ist Ihre Mitarbeiternummer und Durchwahl?",
          fr: "Je dois d'abord vérifier votre identité. Quel est votre ID employé et votre extension?"
        },
        correct: true,
        explanation: {
          en: "GREAT! Verification stops pretexting. Attackers can't provide valid internal details. Call them back via the company directory.",
          de: "GUT! Verifikation stoppt Vortäuschung. Angreifer können keine gültigen internen Details nennen. Rufe über das Firmenverzeichnis zurück.",
          fr: "SUPER! La vérification arrête le prétexte. Les attaquants ne peuvent pas fournir de détails internes valides. Rappelez-les via l'annuaire de l'entreprise."
        },
        trustImpact: 0
      }
    ]
  },
  {
    id: 4,
    type: "baiting",
    icon: Mail,
    attackerName: "HR Department",
    attackerRole: {
      en: "Human Resources",
      de: "Personalabteilung",
      fr: "Ressources Humaines"
    },
    context: {
      en: "Monday 9:00 AM - You found a USB stick in the parking lot",
      de: "Montag 9:00 Uhr - Du hast einen USB-Stick auf dem Parkplatz gefunden",
      fr: "Lundi 9:00 - Vous avez trouvé une clé USB dans le parking"
    },
    messages: [
      {
        id: 1,
        sender: "system",
        text: {
          en: "You found a USB drive labeled 'Q4 Salary Adjustments - Confidential' in the company parking lot. There's also a note: 'For HR Director only - urgent!'",
          de: "Du hast einen USB-Stick gefunden mit dem Aufkleber 'Q4 Gehaltsanpassungen - Vertraulich' auf dem Firmenparkplatz. Dazu ein Zettel: 'Nur für Personalchef - dringend!'",
          fr: "Vous avez trouvé une clé USB étiquetée 'Ajustements salaires Q4 - Confidentiel' dans le parking de l'entreprise. Il y a aussi une note: 'Pour DRH uniquement - urgent!'"
        }
      }
    ],
    choices: [
      {
        id: "d1",
        text: {
          en: "I'll plug it into my computer to see what's on it and forward it to HR.",
          de: "Ich stecke ihn in meinen Computer um zu sehen was drauf ist und leite es an HR weiter.",
          fr: "Je vais le brancher sur mon ordinateur pour voir ce qu'il y a dessus et le transférer aux RH."
        },
        correct: false,
        explanation: {
          en: "DANGEROUS! Unknown USBs can contain malware that installs immediately. This is 'baiting' - leaving tempting items to compromise security.",
          de: "GEFÄHRLICH! Unbekannte USBs können Malware enthalten die sofort installiert. Das ist 'Baiting' - Köder auslegen um Sicherheit zu kompromittieren.",
          fr: "DANGEREUX! Les USB inconnus peuvent contenir des malwares qui s'installent immédiatement. C'est de 'l'appât' - laisser des articles tentants pour compromettre la sécurité."
        },
        trustImpact: -50
      },
      {
        id: "d2",
        text: {
          en: "I'll hand it to the IT security team without plugging it in.",
          de: "Ich gebe ihn dem IT-Sicherheitsteam ohne ihn einzustecken.",
          fr: "Je vais le remettre à l'équipe de sécurité IT sans le brancher."
        },
        correct: true,
        explanation: {
          en: "PERFECT! Never plug in unknown USB devices. IT can scan them safely in an isolated environment. This could have been a targeted attack.",
          de: "PERFEKT! Stecke nie unbekannte USB-Geräte ein. IT kann sie sicher in isolierter Umgebung scannen. Das hätte ein gezielter Angriff sein können.",
          fr: "PARFAIT! Ne branchez jamais de périphériques USB inconnus. L'IT peut les scanner en toute sécurité dans un environnement isolé. Cela aurait pu être une attaque ciblée."
        },
        trustImpact: 0
      },
      {
        id: "d3",
        text: {
          en: "I'll throw it away. It's probably junk.",
          de: "Ich werfe ihn weg. Es ist wahrscheinlich Müll.",
          fr: "Je vais le jeter. C'est probablement des ordures."
        },
        correct: false,
        explanation: {
          en: "Better than plugging it in, but reporting it helps security investigate potential targeted attacks. Still, not plugging it in saved you!",
          de: "Besser als einstecken, aber Melden hilft Sicherheit potenzielle gezielte Angriffe zu untersuchen. Trotzdem: Nicht einstecken hat dich gerettet!",
          fr: "Mieux que de le brancher, mais signaler aide la sécurité à enquêter sur les attaques ciblées potentielles. Néanmoins, ne pas le brancher vous a sauvé!"
        },
        trustImpact: -10
      }
    ]
  }
];

export default function SocialEngineeringDefense() {
  const [language, setLanguage] = useState<Language>("en");
  const [gameState, setGameState] = useState<"menu" | "playing" | "result" | "gameover">("menu");
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [trust, setTrust] = useState(100);
  const [completedScenarios, setCompletedScenarios] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const t = translations[language];
  const shuffledScenarios = [...scenarios].sort(() => Math.random() - 0.5);

  const startGame = () => {
    setGameState("playing");
    setTrust(100);
    setScenarioIndex(0);
    setCompletedScenarios([]);
    loadScenario(0);
  };

  const loadScenario = (index: number) => {
    if (index >= shuffledScenarios.length) {
      setGameState("result");
      return;
    }
    setCurrentScenario(shuffledScenarios[index]);
    setSelectedChoice(null);
    setShowResult(false);
  };

  const makeChoice = (choice: Choice) => {
    setSelectedChoice(choice);
    setShowResult(true);
    
    const newTrust = Math.max(0, Math.min(100, trust + choice.trustImpact));
    setTrust(newTrust);
    
    if (choice.correct) {
      setCompletedScenarios([...completedScenarios, currentScenario!.id]);
    }
    
    if (newTrust <= 0) {
      setTimeout(() => setGameState("gameover"), 2000);
    }
  };

  const nextScenario = () => {
    const nextIndex = scenarioIndex + 1;
    setScenarioIndex(nextIndex);
    loadScenario(nextIndex);
  };

  const getRank = (): string => {
    const correctCount = completedScenarios.length;
    const trustLevel = trust;
    
    if (correctCount === 4 && trustLevel >= 80) return t.ranks.expert;
    if (correctCount >= 3 && trustLevel >= 60) return t.ranks.defender;
    if (correctCount >= 2) return t.ranks.aware;
    return t.ranks.victim;
  };

  const getTrustColor = () => {
    if (trust >= 70) return "text-green-500";
    if (trust >= 40) return "text-yellow-500";
    return "text-destructive";
  };

  if (gameState === "menu") {
    return (
      <ToolLayout title={t.title} icon={BrainCircuit} description={t.subtitle}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 p-4">
          <div className="text-center space-y-2">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-sm max-w-md">
              Learn to detect manipulation tactics used by attackers.
            </p>
          </div>

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

          <div className="bg-muted p-4 rounded-lg border border-border max-w-md">
            <h3 className="font-mono text-sm font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              What you'll learn:
            </h3>
            <ul className="text-xs font-mono text-muted-foreground space-y-1">
              <li>• CEO Fraud & Urgency tactics</li>
              <li>• Tech Support Scams</li>
              <li>• Pretexting & Fake authority</li>
              <li>• Baiting with malicious devices</li>
            </ul>
          </div>

          <Button size="lg" onClick={startGame} className="gap-2 font-mono text-lg px-8">
            <BrainCircuit className="w-5 h-5" />
            {t.startGame}
          </Button>
        </div>
      </ToolLayout>
    );
  }

  if (gameState === "gameover") {
    return (
      <ToolLayout title={t.title} icon={XCircle} description={t.gameOver}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-4">
          <XCircle className="w-16 h-16 text-destructive" />
          <h2 className="text-2xl font-bold font-mono text-destructive">{t.gameOver}</h2>
          <p className="text-muted-foreground font-mono text-center max-w-md">{t.trustLost}</p>
          
          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30 w-full max-w-md">
            <p className="text-sm font-mono text-destructive text-center">{t.youFailed}</p>
          </div>

          <Button onClick={startGame} variant="outline" className="gap-2 font-mono">
            <RefreshCw className="w-4 h-4" />
            {t.tryAgain}
          </Button>
        </div>
      </ToolLayout>
    );
  }

  if (gameState === "result") {
    const rank = getRank();
    
    return (
      <ToolLayout title={t.title} icon={Trophy} description={t.missionComplete}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-4">
          <Trophy className="w-16 h-16 text-primary" />
          <h2 className="text-2xl font-bold font-mono">{t.missionComplete}</h2>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">{t.rank}</p>
              <p className="text-lg font-bold font-mono text-primary">{rank}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border">
              <p className="text-xs text-muted-foreground font-mono">{t.trustMaintained}</p>
              <p className={`text-xl font-bold font-mono ${getTrustColor()}`}>{trust}%</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center border border-border col-span-2">
              <p className="text-xs text-muted-foreground font-mono">{t.scenariosCompleted}</p>
              <p className="text-xl font-bold font-mono">{completedScenarios.length}/4</p>
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
  if (!currentScenario) return null;
  const Icon = currentScenario.icon;

  return (
    <ToolLayout title={t.title} icon={BrainCircuit} description={`${t.mission} ${scenarioIndex + 1}/4`}>
      <div className="max-w-2xl mx-auto space-y-4 p-4">
        {/* Trust Meter */}
        <div className="bg-muted p-4 rounded-lg border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-muted-foreground">{t.trustLevel}</span>
            <span className={`text-xs font-mono font-bold ${getTrustColor()}`}>
              {trust >= 70 ? t.high : trust >= 40 ? t.medium : trust > 0 ? t.low : t.compromised}
            </span>
          </div>
          <Progress value={trust} className="h-3" />
        </div>

        {/* Scenario Card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-muted/50 p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  {t.types[currentScenario.type]}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {currentScenario.context[language]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold font-mono">{currentScenario.attackerName}</p>
                <p className="text-xs text-muted-foreground font-mono">{currentScenario.attackerRole[language]}</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="p-4 space-y-4">
            {currentScenario.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'attacker' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === 'attacker' 
                    ? 'bg-muted border border-border' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm font-mono">{msg.text[language]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Choices */}
        {!showResult ? (
          <div className="space-y-3">
            <p className="text-xs font-mono text-muted-foreground text-center">{t.whatDoYouDo}</p>
            {currentScenario.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => makeChoice(choice)}
                className="w-full p-4 text-left bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all font-mono text-sm"
              >
                {choice.text[language]}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              selectedChoice?.correct 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-destructive bg-destructive/10'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedChoice?.correct ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <span className={`font-bold font-mono ${
                  selectedChoice?.correct ? 'text-green-500' : 'text-destructive'
                }`}>
                  {selectedChoice?.correct ? t.correct : t.wrong}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground">{t.explanation}:</p>
                <p className="text-sm font-mono">{selectedChoice?.explanation[language]}</p>
              </div>

              {!selectedChoice?.correct && selectedChoice?.trustImpact && (
                <div className="mt-3 p-2 bg-destructive/20 rounded text-center">
                  <span className="text-xs font-mono text-destructive font-bold">
                    Trust -{Math.abs(selectedChoice.trustImpact)}%
                  </span>
                </div>
              )}
            </div>

            <Button 
              onClick={nextScenario} 
              className="w-full gap-2 font-mono"
              disabled={trust <= 0}
            >
              {t.next} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
