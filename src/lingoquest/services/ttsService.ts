// Text-to-Speech Service für Russisch und Deutsch
// Nutzt die Web Speech API

export type TTSLanguage = 'de-DE' | 'ru-RU';

export interface TTSOptions {
  rate?: number;      // 0.1 bis 10 (1 = normal)
  pitch?: number;     // 0 bis 2 (1 = normal)
  volume?: number;    // 0 bis 1
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.init();
    }
  }

  private init() {
    if (!this.synth) return;
    
    // Voices laden
    const loadVoices = () => {
      this.voices = this.synth!.getVoices();
      this.isInitialized = true;
    };
    
    loadVoices();
    
    // Chrome benötigt diesen Event
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Text vorlesen
   */
  speak(text: string, lang: TTSLanguage, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Text-to-Speech nicht unterstützt'));
        return;
      }

      // Aktuelle Sprache stoppen
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      // Passende Stimme finden
      const voice = this.findBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`TTS Fehler: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * Russisch mit langsamer Geschwindigkeit sprechen (für Lernende)
   */
  speakRussianSlow(text: string): Promise<void> {
    return this.speak(text, 'ru-RU', { rate: 0.7, pitch: 1 });
  }

  /**
   * Deutsch sprechen
   */
  speakGerman(text: string, slow = false): Promise<void> {
    return this.speak(text, 'de-DE', { rate: slow ? 0.7 : 1 });
  }

  /**
   * Beide Sprachen nacheinander sprechen
   */
  async speakBoth(russian: string, german: string, options: { slow?: boolean } = {}): Promise<void> {
    await this.speakRussianSlow(russian);
    await new Promise(resolve => setTimeout(resolve, 300)); // kurze Pause
    await this.speakGerman(german, options.slow);
  }

  /**
   * Wort silbenweise sprechen (für komplexe Wörter)
   */
  async speakSyllables(word: string, lang: TTSLanguage): Promise<void> {
    // Silbentrennung (vereinfacht für Russisch)
    const syllables = this.splitSyllables(word);
    
    for (let i = 0; i < syllables.length; i++) {
      await this.speak(syllables[i], lang, { rate: 0.8 });
      if (i < syllables.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Dann das ganze Wort
    await new Promise(resolve => setTimeout(resolve, 200));
    await this.speak(word, lang);
  }

  /**
   * Aktuelle Sprache stoppen
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Prüfen ob TTS verfügbar ist
   */
  isAvailable(): boolean {
    return this.synth !== null && this.isInitialized;
  }

  /**
   * Verfügbare Stimmen auflisten
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Russische Stimmen filtern
   */
  getRussianVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.startsWith('ru'));
  }

  /**
   * Deutsche Stimmen filtern
   */
  getGermanVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.startsWith('de'));
  }

  /**
   * Beste Stimme für Sprache finden
   */
  private findBestVoice(lang: TTSLanguage): SpeechSynthesisVoice | null {
    const voices = this.voices.filter(v => v.lang === lang);
    
    // Bevorzuge natürliche Stimmen
    const naturalVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Microsoft') ||
      v.name.includes('Apple')
    );
    
    return naturalVoice || voices[0] || null;
  }

  /**
   * Einfache Silbentrennung für Russisch
   */
  private splitSyllables(word: string): string[] {
    const vowels = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ';
    const syllables: string[] = [];
    let current = '';
    
    for (const char of word) {
      current += char;
      if (vowels.includes(char)) {
        syllables.push(current);
        current = '';
      }
    }
    
    if (current) {
      if (syllables.length > 0) {
        syllables[syllables.length - 1] += current;
      } else {
        syllables.push(current);
      }
    }
    
    return syllables.length > 0 ? syllables : [word];
  }

  /**
   * Betonung visuell markieren (für Anzeige)
   * In Russisch ist die Betonung wichtig für die Aussprache
   */
  markStress(word: string, stressIndex: number): string {
    if (stressIndex < 0 || stressIndex >= word.length) return word;
    
    // Akut-Zeichen auf den betonten Vokal setzen
    const chars = word.split('');
    const vowel = chars[stressIndex];
    
    // Unicode-kombinierender Akut
    const stressedVowels: Record<string, string> = {
      'а': 'а́', 'е': 'е́', 'и': 'и́', 'о': 'о́', 'у': 'у́', 'ы': 'ы́', 'э': 'э́', 'ю': 'ю́', 'я': 'я́', 'ё': 'ё́',
      'А': 'А́', 'Е': 'Е́', 'И': 'И́', 'О': 'О́', 'У': 'У́', 'Ы': 'Ы́', 'Э': 'Э́', 'Ю': 'Ю́', 'Я': 'Я́', 'Ё': 'Ё́',
    };
    
    chars[stressIndex] = stressedVowels[vowel] || vowel;
    return chars.join('');
  }
}

// Singleton-Instanz exportieren
export const ttsService = new TTSService();

// Hook für React
export function useTTS() {
  return {
    speak: (text: string, lang: TTSLanguage, options?: TTSOptions) => 
      ttsService.speak(text, lang, options),
    speakRussianSlow: (text: string) => ttsService.speakRussianSlow(text),
    speakGerman: (text: string, slow?: boolean) => ttsService.speakGerman(text, slow),
    speakBoth: (russian: string, german: string, options?: { slow?: boolean }) => 
      ttsService.speakBoth(russian, german, options),
    speakSyllables: (word: string, lang: TTSLanguage) => ttsService.speakSyllables(word, lang),
    stop: () => ttsService.stop(),
    isAvailable: () => ttsService.isAvailable(),
    getRussianVoices: () => ttsService.getRussianVoices(),
    getGermanVoices: () => ttsService.getGermanVoices(),
  };
}
