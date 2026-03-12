import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// German translations
const deTranslations = {
  nav: {
    home: 'Startseite',
    tools: 'Tools',
    agent: 'AI Agent',
    security: 'Security',
    settings: 'Einstellungen'
  },
  common: {
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    open: 'Öffnen',
    copy: 'Kopieren',
    paste: 'Einfügen',
    search: 'Suchen',
    filter: 'Filtern',
    sort: 'Sortieren',
    refresh: 'Aktualisieren',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Zurück',
    submit: 'Absenden',
    confirm: 'Bestätigen',
    warning: 'Warnung',
    info: 'Info',
    yes: 'Ja',
    no: 'Nein',
    ok: 'OK'
  },
  tools: {
    title: 'Security Tools',
    subtitle: 'Wähle ein Tool aus',
    browserAgent: {
      title: 'Browser Agent',
      description: 'Lokaler KI-Agent, der zu 100% im Browser läuft. Chat, Suche, Analyse ohne Backend.',
      status: {
        loading: 'Agent wird initialisiert...',
        ready: 'Agent bereit',
        thinking: 'Agent denkt...',
        error: 'Fehler bei der Initialisierung'
      }
    },
    securityEducation: {
      title: 'Security Education',
      description: 'Lerne, dich vor Discord Token-Grabbern, Phishing und Social Engineering zu schützen.',
      tabs: {
        learn: 'Lernen',
        analyze: 'Token Analyse',
        phishSim: 'Phishing Erkennung',
        protect: 'Schutz'
      }
    },
    passwordGenerator: {
      title: 'Passwort Generator',
      description: 'Generiere kryptographisch sichere Passwörter.'
    },
    fileVault: {
      title: 'Datei Tresor',
      description: 'Verschlüssele und speichere Dateien sicher.'
    }
  },
  agent: {
    title: '🦄 Dark Unicorn Agent',
    subtitle: 'Cybersecurity Agent // Lokale KI // Zero Trust',
    ethicalAgreement: {
      title: 'ETHICAL HACKING AGREEMENT',
      required: 'Du musst die ethische Einverständniserklärung akzeptieren',
      points: {
        authorizedOnly: 'Ich teste NUR Systeme, die mir gehören oder für die ich eine ausdrückliche schriftliche Autorisierung habe.',
        legalCompliance: 'Ich werde alle geltenden Gesetze einhalten (CFAA, StGB §202a+, etc.).',
        noHarm: 'Ich werde keine schädlichen Aktivitäten durchführen (Datendiebstahl, DoS, Ransomware).',
        disclosure: 'Bei entdeckten Schwachstellen werde ich diese verantwortungsvoll melden.',
        educationOnly: 'Ich nutze dieses Tool nur für Bildungszwecke, CTFs oder autorisiertes Penetration Testing.'
      },
      accept: 'Ich stimme zu - Agent initialisieren',
      decline: 'Ablehnen & Beenden'
    },
    status: {
      loading: 'Neuraler Kern wird geladen...',
      ready: '🦄 Dark Unicorn Agent ONLINE',
      failed: 'Initialisierung fehlgeschlagen. Seite neu laden.'
    },
    internetMode: '🌐 INTERNET MODUS AKTIV - Agent hat vollen Web-Zugriff',
    securityMode: '⚠️ SICHERHEITSMODUS: Alle Daten werden nur im Speicher gehalten',
    inputPlaceholder: 'Befehl oder Frage eingeben...',
    capabilities: {
      title: 'Fähigkeiten',
      internet: 'Voller Internet-Zugriff',
      github: 'GitHub Tool Installer',
      cli: 'Python/Node/Bash CLI',
      dynamic: 'Dynamisches Script Loading'
    }
  },
  errors: {
    generic: 'Ein Fehler ist aufgetreten',
    network: 'Netzwerkfehler',
    timeout: 'Zeitüberschreitung',
    notFound: 'Nicht gefunden',
    unauthorized: 'Nicht autorisiert'
  }
};

// English translations
const enTranslations = {
  nav: {
    home: 'Home',
    tools: 'Tools',
    agent: 'AI Agent',
    security: 'Security',
    settings: 'Settings'
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    open: 'Open',
    copy: 'Copy',
    paste: 'Paste',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    confirm: 'Confirm',
    warning: 'Warning',
    info: 'Info',
    yes: 'Yes',
    no: 'No',
    ok: 'OK'
  },
  tools: {
    title: 'Security Tools',
    subtitle: 'Choose a tool',
    browserAgent: {
      title: 'Browser Agent',
      description: 'Local AI assistant running 100% in your browser. Chat, search, analyze with zero backend.',
      status: {
        loading: 'Initializing agent...',
        ready: 'Agent ready',
        thinking: 'Agent thinking...',
        error: 'Initialization failed'
      }
    },
    securityEducation: {
      title: 'Security Education',
      description: 'Learn to protect yourself from Discord token grabbers, phishing attacks, and social engineering.',
      tabs: {
        learn: 'Learn',
        analyze: 'Token Analysis',
        phishSim: 'Phishing Detection',
        protect: 'Protection'
      }
    },
    passwordGenerator: {
      title: 'Password Generator',
      description: 'Generate cryptographically secure passwords.'
    },
    fileVault: {
      title: 'File Vault',
      description: 'Encrypt and store files securely.'
    }
  },
  agent: {
    title: '🦄 Dark Unicorn Agent',
    subtitle: 'Cybersecurity Agent // Local AI // Zero Trust',
    ethicalAgreement: {
      title: 'ETHICAL HACKING AGREEMENT',
      required: 'You must accept the ethical hacking agreement first',
      points: {
        authorizedOnly: 'I will ONLY test systems I own or have explicit written authorization to test.',
        legalCompliance: 'I will comply with all applicable laws (CFAA, StGB §202a+, etc.).',
        noHarm: 'I will not use this tool for data theft, DoS, ransomware, or harmful activities.',
        disclosure: 'If I discover vulnerabilities, I will report them responsibly.',
        educationOnly: 'I am using this tool for educational purposes, CTFs, or authorized pentesting only.'
      },
      accept: 'I Agree - Initialize Agent',
      decline: 'Decline & Exit'
    },
    status: {
      loading: 'Loading neural core...',
      ready: '🦄 Dark Unicorn Agent ONLINE',
      failed: 'Failed to initialize. Refresh page.'
    },
    internetMode: '🌐 INTERNET MODE ACTIVE - Agent has full web access',
    securityMode: '⚠️ SECURITY MODE: All data is stored in memory only',
    inputPlaceholder: 'Enter command or question...',
    capabilities: {
      title: 'Capabilities',
      internet: 'Full Internet Access',
      github: 'GitHub Tool Installer',
      cli: 'Python/Node/Bash CLI',
      dynamic: 'Dynamic Script Loading'
    }
  },
  errors: {
    generic: 'An error occurred',
    network: 'Network error',
    timeout: 'Timeout',
    notFound: 'Not found',
    unauthorized: 'Unauthorized'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: deTranslations },
      en: { translation: enTranslations }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
