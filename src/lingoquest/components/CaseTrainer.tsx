import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, HelpCircle, Check, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RUSSIAN_CASES, CASE_ENDINGS, CASE_EXERCISES, PREPOSITIONS } from '../data/grammar';
import { AudioButton } from './AudioButton';
import { useProgressStore } from '../store/progressStore';
import type { RussianCase } from '../types';

export function CaseTrainer() {
  const [activeCase, setActiveCase] = useState<RussianCase>('nominativ');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const addXP = useProgressStore(state => state.addXP);

  const caseData = RUSSIAN_CASES.find(c => c.id === activeCase);
  const exercise = CASE_EXERCISES.find(e => e.case === activeCase);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === exercise?.examples[currentExercise].caseForm;
    
    if (isCorrect) {
      addXP(10);
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowExplanation(false);
      if (currentExercise < (exercise?.examples.length || 1) - 1) {
        setCurrentExercise(prev => prev + 1);
      } else {
        setCurrentExercise(0);
      }
    }, 2000);
  };

  const getEndingsForCase = (caseId: RussianCase) => {
    return CASE_ENDINGS.filter(e => e.case === caseId);
  };

  const getPrepositionsForCase = (caseId: RussianCase) => {
    return PREPOSITIONS.filter(p => p.case === caseId);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Kasus-Trainer</h2>
        <p className="text-gray-500">Meistere die 6 Fälle des Russischen</p>
      </div>

      {/* Kasus-Auswahl */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {RUSSIAN_CASES.map((c) => (
          <Button
            key={c.id}
            variant={activeCase === c.id ? 'default' : 'outline'}
            className="text-xs"
            onClick={() => {
              setActiveCase(c.id);
              setCurrentExercise(0);
              setSelectedAnswer(null);
            }}
          >
            {c.name.slice(0, 3)}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="learn" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learn">Lernen</TabsTrigger>
          <TabsTrigger value="endings">Endungen</TabsTrigger>
          <TabsTrigger value="practice">Üben</TabsTrigger>
        </TabsList>

        {/* Lern-Tab */}
        <TabsContent value="learn">
          <Card className="p-6 space-y-6">
            {caseData && (
              <>
                <div className="text-center">
                  <Badge className="mb-2">{caseData.name}</Badge>
                  <h3 className="text-xl font-bold mb-2">{caseData.question}</h3>
                  <p className="text-gray-600">{caseData.description}</p>
                </div>

                {exercise && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="font-medium text-indigo-900 mb-2">Beispiel:</p>
                      <div className="space-y-2">
                        {exercise.examples.slice(0, 2).map((ex, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold">{ex.russian}</p>
                              <p className="text-sm text-gray-600">{ex.german}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{ex.caseForm}</Badge>
                              <AudioButton text={ex.word} lang="ru-RU" size="sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <Lightbulb className="w-4 h-4 inline mr-1" />
                        <strong>Merke:</strong> {exercise.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Präpositionen */}
                <div>
                  <h4 className="font-semibold mb-3">Präpositionen mit {caseData.name}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {getPrepositionsForCase(activeCase).map((prep) => (
                      <TooltipProvider key={prep.preposition}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary" className="cursor-help">
                              {prep.preposition}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{prep.meaning}</p>
                            <p className="text-xs text-gray-400">{prep.example}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Endungen-Tab */}
        <TabsContent value="endings">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Endungen für {caseData?.name}</h3>
            <div className="space-y-3">
              {getEndingsForCase(activeCase).map((ending, idx) => (
                <div 
                  key={idx} 
                  className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg items-center"
                >
                  <div>
                    <p className="text-xs text-gray-500">Genus</p>
                    <p className="font-medium capitalize">{ending.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Singular</p>
                    <p className="font-medium font-mono">{ending.singular}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Plural</p>
                    <p className="font-medium font-mono">{ending.plural}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Beispiel</p>
                    <p className="font-medium">{ending.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Übungs-Tab */}
        <TabsContent value="practice">
          <Card className="p-6 space-y-6">
            {exercise && (
              <>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Übung {currentExercise + 1}/{exercise.examples.length}</Badge>
                  <span className="text-sm text-gray-500">
                    Score: {score.correct}/{score.total}
                  </span>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-lg">Welcher Kasus wird hier verwendet?</p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600 mb-2">
                      {exercise.examples[currentExercise].russian}
                    </p>
                    <p className="text-gray-600">
                      {exercise.examples[currentExercise].german}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {RUSSIAN_CASES.map((c) => (
                      <Button
                        key={c.id}
                        variant={
                          selectedAnswer === null
                            ? 'outline'
                            : c.id === activeCase
                              ? 'default'
                              : selectedAnswer === c.name && c.id !== activeCase
                                ? 'destructive'
                                : 'outline'
                        }
                        onClick={() => handleAnswer(c.name)}
                        disabled={selectedAnswer !== null}
                      >
                        {c.name}
                        {selectedAnswer === c.name && c.id === activeCase && (
                          <Check className="w-4 h-4 ml-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      selectedAnswer === exercise.examples[currentExercise].caseForm
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    <p className="font-medium">
                      {selectedAnswer === exercise.examples[currentExercise].caseForm
                        ? '✅ Richtig!'
                        : '❌ Falsch!'}
                    </p>
                    <p className="text-sm mt-1">
                      Das Wort <strong>{exercise.examples[currentExercise].word}</strong> steht im{' '}
                      <strong>{exercise.examples[currentExercise].caseForm}</strong>.
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Schnell-Referenz für alle Kasus
export function CaseQuickReference() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Kasus-Übersicht</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {RUSSIAN_CASES.map((c) => (
          <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{c.name}</span>
              <Badge variant="outline" className="text-xs">
                {c.question}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">{c.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
