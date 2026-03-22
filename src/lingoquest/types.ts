// LingoQuest - Russisch-Deutsch Lernplattform
// Kern-Datenstrukturen

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type LessonType = 'vocabulary' | 'grammar' | 'pronunciation' | 'cyrillic';
export type ExerciseType = 'multiple-choice' | 'listen-select' | 'speak-repeat' | 'sentence-build' | 'case-drill';

export interface Lesson {
  id: string;
  type: LessonType;
  level: LanguageLevel;
  category: string;
  title: string;
  description: string;
  order: number;
  
  // Bilingual content
  content: {
    german: string;
    russian: string;
    transliteration?: string;
    audioGerman?: string;
    audioRussian?: string;
  }[];
  
  // Grammatik-Metadaten
  grammar?: {
    case?: RussianCase;
    gender?: 'maskulin' | 'feminin' | 'neutral';
    plural?: boolean;
    verbAspect?: 'perfektiv' | 'imperfektiv';
  };
  
  // Übungs-Config
  exercise: {
    type: ExerciseType;
    options?: string[];
    correctIndex?: number;
    hint?: string;
  };
}

export type RussianCase = 'nominativ' | 'genitiv' | 'dativ' | 'akkusativ' | 'instrumental' | 'präpositiv';

export interface CyrillicLetter {
  letter: string;
  name: string;
  sound: string;
  equivalent: string;
  example: {
    russian: string;
    german: string;
  };
}

export interface AspectPair {
  imperfective: string;
  perfective: string;
  german: string;
}

export interface MovementVerb {
  unidirectional: string;  // идти
  multidirectional: string; // ходить
  german: string;
  usage: {
    unidirectional: string[];
    multidirectional: string[];
  };
}

// Gamification
export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string | null;
  crowns: number;
  completedLessons: string[];
  league: League;
}

export type League = 'Bronze' | 'Silver' | 'Gold' | 'Sapphire' | 'Ruby' | 'Diamond';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (progress: UserProgress) => boolean;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface PronunciationScore {
  transcript: string;
  accuracy: number;
  confidence: number;
  feedback: 'perfekt' | 'gut' | 'wiederholen';
  details?: string;
}

export interface LearningPath {
  phase: number;
  title: string;
  description: string;
  lessons: string[]; // lesson IDs
  requiredXP: number;
}

// Vokabel-Kategorien
export const VOCABULARY_CATEGORIES = [
  { id: 'basics', name: 'Grundlagen', icon: '🏠' },
  { id: 'food', name: 'Essen & Trinken', icon: '🍽️' },
  { id: 'travel', name: 'Reisen', icon: '✈️' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'family', name: 'Familie', icon: '👨‍👩‍👧‍👦' },
  { id: 'shopping', name: 'Einkaufen', icon: '🛒' },
  { id: 'emotions', name: 'Gefühle', icon: '❤️' },
  { id: 'weather', name: 'Wetter', icon: '🌤️' },
] as const;

// Kasus-Endungen
export interface CaseEnding {
  case: RussianCase;
  gender: 'maskulin' | 'feminin' | 'neutral';
  singular: string;
  plural: string;
  example: string;
  question: string; // Wessen? Wen? Wem?
}
