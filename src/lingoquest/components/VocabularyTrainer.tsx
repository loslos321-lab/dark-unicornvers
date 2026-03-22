import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, EyeOff, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { VOCABULARY_LESSONS, WORD_LISTS } from '../data/vocabulary';
import { VOCABULARY_CATEGORIES } from '../types';
import { AudioButton, BilingualAudioPlayer } from './AudioButton';
import { PronunciationChecker } from './PronunciationChecker';
import { useProgressStore } from '../store/progressStore';
import type { Lesson } from '../types';

interface VocabularyTrainerProps {
  lessonId?: string;
  categoryId?: string;
  onComplete?: () => void;
}

export function VocabularyTrainer({ lessonId, categoryId, onComplete }: VocabularyTrainerProps) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [mode, setMode] = useState<'flashcard' | 'quiz' | 'pronunciation'>('flashcard');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const addXP = useProgressStore(state => state.addXP);
  const completeLesson = useProgressStore(state => state.completeLesson);

  // Lektion laden
  useEffect(() => {
    if (lessonId) {
      const lesson = VOCABULARY_LESSONS.find(l => l.id === lessonId);
      if (lesson) setCurrentLesson(lesson);
    } else if (categoryId) {
      const lessons = VOCABULARY_LESSONS.filter(l => l.category === categoryId);
      if (lessons.length > 0) setCurrentLesson(lessons[0]);
    } else {
      setCurrentLesson(VOCABULARY_LESSONS[0]);
    }
  }, [lessonId, categoryId]);

  if (!currentLesson) {
    return <div>Lektion nicht gefunden</div>;
  }

  const currentWord = currentLesson.content[currentIndex];
  const progress = ((currentIndex + 1) / currentLesson.content.length) * 100;
  const isComplete = currentIndex >= currentLesson.content.length - 1;

  const handleNext = () => {
    if (isComplete) {
      completeLesson(currentLesson.id);
      addXP(XP_REWARDS.LESSON_COMPLETE + (answers.correct === answers.total ? XP_REWARDS.PERFECT_LESSON : 0));
      onComplete?.();
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (selectedOption !== null) return;

    const correct = index === currentLesson.exercise.correctIndex;
    setSelectedOption(index);
    setIsCorrect(correct);
    setAnswers(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    if (correct) {
      addXP(5);
    }

    setTimeout(handleNext, 1500);
  };

  // Flashcard-Modus
  const renderFlashcard = () => (
    <div className="space-y-6">
      <Card 
        className="p-8 text-center cursor-pointer min-h-[200px] flex flex-col justify-center"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <AnimatePresence mode="wait">
          {!showAnswer ? (
            <motion.div
              key="front"
              initial={{ rotateY: 0 }}
              exit={{ rotateY: 90 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-gray-500 mb-2">Deutsch</p>
              <p className="text-3xl font-bold text-indigo-600">{currentWord.german}</p>
              <p className="text-xs text-gray-400 mt-4">Tippe zum Umdrehen</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: -90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-gray-500 mb-2">Russisch</p>
              <p className="text-4xl font-bold text-red-600 mb-2">{currentWord.russian}</p>
              {currentWord.transliteration && (
                <p className="text-lg text-gray-400">/{currentWord.transliteration}/</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <BilingualAudioPlayer 
        russian={currentWord.russian} 
        german={currentWord.german}
      />

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setAnswers(prev => ({ ...prev, total: prev.total + 1 }));
            handleNext();
          }}
        >
          <X className="w-4 h-4 mr-1 text-red-500" />
          Schwierig
        </Button>
        <Button
          onClick={() => {
            setAnswers(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
            addXP(3);
            handleNext();
          }}
        >
          <Check className="w-4 h-4 mr-1 text-green-500" />
          Gewusst
        </Button>
      </div>
    </div>
  );

  // Quiz-Modus
  const renderQuiz = () => {
    const options = currentLesson.exercise.options || [];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Wähle die richtige Übersetzung:</p>
          <p className="text-3xl font-bold text-indigo-600">{currentWord.german}</p>
        </div>

        <div className="space-y-2">
          {options.map((option, index) => (
            <Button
              key={option}
              variant={
                selectedOption === null
                  ? 'outline'
                  : index === currentLesson.exercise.correctIndex
                    ? 'default'
                    : selectedOption === index
                      ? 'destructive'
                      : 'outline'
              }
              className="w-full h-16 text-xl justify-between"
              onClick={() => handleQuizAnswer(index)}
              disabled={selectedOption !== null}
            >
              <span>{option}</span>
              {selectedOption !== null && index === currentLesson.exercise.correctIndex && (
                <Check className="w-5 h-5" />
              )}
              {selectedOption === index && index !== currentLesson.exercise.correctIndex && (
                <X className="w-5 h-5" />
              )}
            </Button>
          ))}
        </div>

        {currentLesson.exercise.hint && (
          <p className="text-center text-sm text-gray-400">
            Tipp: {currentLesson.exercise.hint}
          </p>
        )}
      </div>
    );
  };

  // Aussprache-Modus
  const renderPronunciation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Übe die Aussprache:</p>
        <p className="text-4xl font-bold text-red-600">{currentWord.russian}</p>
        <p className="text-lg text-gray-400 mt-2">{currentWord.german}</p>
      </div>

      <PronunciationChecker 
        targetWord={currentWord.russian}
        targetLang="ru-RU"
        onResult={(score) => {
          if (score.accuracy >= 60) {
            setTimeout(handleNext, 2000);
          }
        }}
      />

      <div className="flex justify-center">
        <Button variant="outline" onClick={handleNext}>
          Überspringen
        </Button>
      </div>
    </div>
  );

  // Abschluss-Bildschirm
  if (isComplete && selectedOption !== null) {
    const isPerfect = answers.correct === answers.total;
    return (
      <Card className="p-8 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl"
        >
          {isPerfect ? '🏆' : '🎉'}
        </motion.div>
        <h3 className="text-2xl font-bold">
          {isPerfect ? 'Perfekt!' : 'Gut gemacht!'}
        </h3>
        <p className="text-gray-600">
          Du hast {answers.correct} von {answers.total} Wörtern richtig!
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Trophy className="w-4 h-4 mr-1" />
            +{XP_REWARDS.LESSON_COMPLETE + (isPerfect ? XP_REWARDS.PERFECT_LESSON : 0)} XP
          </Badge>
        </div>
        <Button onClick={handleNext} className="w-full">
          Weiter
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{currentLesson.title}</h2>
          <p className="text-sm text-gray-500">{currentLesson.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {currentIndex + 1}/{currentLesson.content.length}
          </span>
          <RotateCcw 
            className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" 
            onClick={() => {
              setCurrentIndex(0);
              setAnswers({ correct: 0, total: 0 });
            }}
          />
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Modus-Selector */}
      <div className="flex justify-center gap-2">
        <Button
          variant={mode === 'flashcard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('flashcard')}
        >
          🎴 Karteikarten
        </Button>
        <Button
          variant={mode === 'quiz' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('quiz')}
        >
          🎯 Quiz
        </Button>
        <Button
          variant={mode === 'pronunciation' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('pronunciation')}
        >
          🎤 Aussprache
        </Button>
      </div>

      {/* Content */}
      <Card className="p-6">
        {mode === 'flashcard' && renderFlashcard()}
        {mode === 'quiz' && renderQuiz()}
        {mode === 'pronunciation' && renderPronunciation()}
      </Card>

      {/* Fortschritt */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Richtig: {answers.correct}/{answers.total}</span>
        <span>Genauigkeit: {answers.total > 0 ? Math.round((answers.correct / answers.total) * 100) : 0}%</span>
      </div>
    </div>
  );
}

// XP Belohnungen
const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  PERFECT_LESSON: 20,
};

// Kategorie-Übersicht
export function VocabularyCategories() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {VOCABULARY_CATEGORIES.map((category) => {
        const lessons = VOCABULARY_LESSONS.filter(l => l.category === category.id);
        return (
          <Card 
            key={category.id} 
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <h3 className="font-semibold">{category.name}</h3>
            <p className="text-sm text-gray-500">{lessons.length} Lektionen</p>
          </Card>
        );
      })}
    </div>
  );
}
