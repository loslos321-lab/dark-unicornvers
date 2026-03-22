// Speech-to-Text für Aussprache-Check
// Nutzt die Web Speech API Recognition

import type { PronunciationScore } from '../types';

// Type definitions für Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = 'ru-RU'; // Standard: Russisch
  }

  /**
   * Aussprache überprüfen
   */
  async checkPronunciation(targetWord: string, lang: 'ru-RU' | 'de-DE' = 'ru-RU'): Promise<PronunciationScore> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Spracherkennung nicht unterstützt'));
        return;
      }

      if (this.isListening) {
        this.stop();
      }

      this.recognition.lang = lang;
      this.isListening = true;

      let timeoutId: NodeJS.Timeout;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        clearTimeout(timeoutId);
        this.isListening = false;

        const result = event.results[0];
        const bestMatch = result[0];
        const transcript = bestMatch.transcript.toLowerCase().trim();
        const confidence = bestMatch.confidence;

        // Ähnlichkeit berechnen
        const similarity = this.calculateSimilarity(transcript, targetWord.toLowerCase());
        
        // Genauigkeit kombinieren (Confidence + Similarity)
        const accuracy = Math.round((confidence * 0.4 + similarity * 0.6) * 100);

        // Feedback bestimmen
        let feedback: PronunciationScore['feedback'];
        if (accuracy >= 85) {
          feedback = 'perfekt';
        } else if (accuracy >= 60) {
          feedback = 'gut';
        } else {
          feedback = 'wiederholen';
        }

        // Detaillierte Rückmeldung
        const details = this.generateFeedback(transcript, targetWord, accuracy);

        resolve({
          transcript,
          accuracy,
          confidence,
          feedback,
          details,
        });
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        clearTimeout(timeoutId);
        this.isListening = false;
        reject(new Error(`Spracherkennungsfehler: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      // Timeout nach 10 Sekunden
      timeoutId = setTimeout(() => {
        this.stop();
        reject(new Error('Zeitüberschreitung - keine Sprache erkannt'));
      }, 10000);

      // Starten
      this.recognition.start();
    });
  }

  /**
   * Aufnahme stoppen
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Prüfen ob Speech Recognition verfügbar ist
   */
  isAvailable(): boolean {
    return this.recognition !== null;
  }

  /**
   * Berechtigungsstatus prüfen
   */
  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
        return 'prompt';
      }
      
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'prompt';
    }
  }

  /**
   * Levenshtein-Distanz für String-Ähnlichkeit
   */
  private calculateSimilarity(a: string, b: string): number {
    const matrix: number[][] = [];
    const lenA = a.length;
    const lenB = b.length;

    if (lenA === 0) return lenB === 0 ? 1 : 0;
    if (lenB === 0) return 0;

    // Matrix initialisieren
    for (let i = 0; i <= lenA; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= lenB; j++) {
      matrix[0][j] = j;
    }

    // Matrix füllen
    for (let i = 1; i <= lenA; i++) {
      for (let j = 1; j <= lenB; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Löschung
          matrix[i][j - 1] + 1,      // Einfügung
          matrix[i - 1][j - 1] + cost // Ersetzung
        );
      }
    }

    // Ähnlichkeit berechnen (0 bis 1)
    const maxLen = Math.max(lenA, lenB);
    return 1 - matrix[lenA][lenB] / maxLen;
  }

  /**
   * Detailliertes Feedback generieren
   */
  private generateFeedback(transcript: string, target: string, accuracy: number): string {
    if (accuracy >= 90) {
      return 'Ausgezeichnet! Deine Aussprache ist fast perfekt.';
    } else if (accuracy >= 75) {
      return 'Sehr gut! Kleine Verbesserungen möglich.';
    } else if (accuracy >= 60) {
      const suggestions = this.getSuggestions(transcript, target);
      return `Gut! ${suggestions}`;
    } else {
      const suggestions = this.getSuggestions(transcript, target);
      return `Versuch es noch einmal. ${suggestions}`;
    }
  }

  /**
   * Spezifische Verbesserungsvorschläge
   */
  private getSuggestions(transcript: string, target: string): string {
    // Analyse der Unterschiede
    const commonMistakes: Record<string, string> = {
      'ы': 'Der Laut "ы" ist wie ein tiefes "i"',
      'р': 'Das russische "р" ist ein gerolltes R',
      'ж': '"Ж" klingt wie "sch" in "Journal"',
      'ш': '"Ш" ist ein hartes "sch" wie in "Schule"',
      'щ': '"Щ" ist weicher als "ш", wie "schtsch"',
      'х': '"Х" ist ein Hauchlaut wie in "Buch"',
      'ц': '"Ц" wie "z" in "Katze"',
      'ч': '"Ч" wie "tsch" in "Deutsch"',
      'ь': 'Der weiche Zeichen (ь) weicht den vorherigen Konsonanten auf',
      'ъ': 'Der harte Zeichen (ъ) trennt zwei Laute',
    };

    // Prüfen welche Laute im Target aber nicht im Transcript sind
    for (const [letter, tip] of Object.entries(commonMistakes)) {
      if (target.includes(letter) && !transcript.includes(letter)) {
        return `Tipp: ${tip}`;
      }
    }

    // Längenunterschied
    if (Math.abs(transcript.length - target.length) > 2) {
      return 'Achte auf die Länge des Wortes und spreche alle Silben deutlich aus.';
    }

    return 'Höre dir die Aussprache noch einmal an und achte auf die Betonung.';
  }
}

// Singleton exportieren
export const speechRecognitionService = new SpeechRecognitionService();

// Hook für React
export function useSpeechRecognition() {
  return {
    checkPronunciation: (targetWord: string, lang?: 'ru-RU' | 'de-DE') => 
      speechRecognitionService.checkPronunciation(targetWord, lang),
    stop: () => speechRecognitionService.stop(),
    isAvailable: () => speechRecognitionService.isAvailable(),
    checkPermission: () => speechRecognitionService.checkPermission(),
  };
}
