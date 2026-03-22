// LingoQuest - Russisch-Deutsch Lernplattform
// Haupt-Exporte

export { LingoQuestLayout } from './layout/LingoQuestLayout';

// Pages
export { Dashboard } from './pages/Dashboard';
export { LessonsPage } from './pages/LessonsPage';

// Components
export { AudioButton, BilingualAudioPlayer } from './components/AudioButton';
export { PronunciationChecker } from './components/PronunciationChecker';
export { CyrillicTrainer, SoftHardSounds } from './components/CyrillicTrainer';
export { VocabularyTrainer, VocabularyCategories } from './components/VocabularyTrainer';
export { CaseTrainer, CaseQuickReference } from './components/CaseTrainer';

// Services
export { ttsService, useTTS } from './services/ttsService';
export { speechRecognitionService, useSpeechRecognition } from './services/speechRecognition';

// Store
export { useProgressStore, getLevelTitle, getStreakEmoji, getLeagueColor } from './store/progressStore';

// Data
export { CYRILLIC_ALPHABET } from './data/cyrillic';
export { VOCABULARY_LESSONS, WORD_LISTS } from './data/vocabulary';
export { 
  RUSSIAN_CASES, 
  CASE_ENDINGS, 
  CASE_EXERCISES, 
  PREPOSITIONS,
  ASPECT_PAIRS,
  ASPECT_EXPLANATION,
  MOVEMENT_VERBS 
} from './data/grammar';

// Types
export type {
  LanguageLevel,
  LessonType,
  ExerciseType,
  Lesson,
  RussianCase,
  CyrillicLetter,
  AspectPair,
  MovementVerb,
  UserProgress,
  League,
  Achievement,
  PronunciationScore,
  LearningPath,
  CaseEnding,
} from './types';
