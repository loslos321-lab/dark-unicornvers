import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, PenTool, Ear } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CYRILLIC_ALPHABET, SOFT_HARD_PAIRS, HANDWRITING_PRACTICE } from '../data/cyrillic';
import { AudioButton } from './AudioButton';
import { useProgressStore } from '../store/progressStore';

export function CyrillicTrainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedLetters, setLearnedLetters] = useState<string[]>([]);
  const [mode, setMode] = useState<'learn' | 'practice' | 'handwriting'>('learn');
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  
  const addXP = useProgressStore(state => state.addXP);
  const completeLesson = useProgressStore(state => state.completeLesson);

  const currentLetter = CYRILLIC_ALPHABET[currentIndex];
  const progress = ((currentIndex + 1) / CYRILLIC_ALPHABET.length) * 100;

  const handleNext = () => {
    if (currentIndex < CYRILLIC_ALPHABET.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setPracticeAnswer(null);
      setShowHint(false);
      
      if (!learnedLetters.includes(currentLetter.letter)) {
        setLearnedLetters(prev => [...prev, currentLetter.letter]);
        addXP(5);
      }
    } else {
      // Alphabet fertig
      completeLesson('cyrillic-alphabet');
      addXP(50);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setPracticeAnswer(null);
      setShowHint(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setLearnedLetters([]);
    setPracticeAnswer(null);
  };

  // Lern-Modus
  const renderLearnMode = () => (
    <div className="space-y-6">
      {/* Buchstabe groß */}
      <div className="text-center">
        <motion.div
          key={currentLetter.letter}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-[120px] font-bold text-indigo-600 leading-none"
        >
          {currentLetter.letter}
        </motion.div>
        <p className="text-4xl text-gray-400 mt-2">{currentLetter.letter.toLowerCase()}</p>
      </div>

      {/* Aussprache */}
      <div className="flex justify-center gap-4">
        <AudioButton 
          text={currentLetter.letter} 
          lang="ru-RU" 
          size="lg"
          showWaveform
        />
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-lg font-semibold">{currentLetter.name}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Laut</p>
          <p className="text-lg font-semibold">{currentLetter.sound}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Deutsch</p>
          <p className="text-lg font-semibold">{currentLetter.equivalent}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Beispiel</p>
          <div className="text-lg">
            <span className="font-semibold">{currentLetter.example.russian}</span>
            <span className="text-gray-400 text-sm ml-2">({currentLetter.example.german})</span>
          </div>
        </Card>
      </div>
    </div>
  );

  // Übungs-Modus
  const renderPracticeMode = () => {
    // Multiple Choice generieren
    const options = [currentLetter];
    while (options.length < 4) {
      const random = CYRILLIC_ALPHABET[Math.floor(Math.random() * CYRILLIC_ALPHABET.length)];
      if (!options.find(o => o.letter === random.letter)) {
        options.push(random);
      }
    }
    options.sort(() => Math.random() - 0.5);

    const handleAnswer = (letter: string) => {
      setPracticeAnswer(letter);
      if (letter === currentLetter.letter) {
        addXP(10);
        setTimeout(handleNext, 1000);
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Welcher Buchstabe wird gesprochen?</p>
          <AudioButton 
            text={currentLetter.letter} 
            lang="ru-RU" 
            size="lg"
            showWaveform
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <Button
              key={option.letter}
              variant={
                practiceAnswer === null 
                  ? 'outline' 
                  : option.letter === currentLetter.letter 
                    ? 'default' 
                    : practiceAnswer === option.letter 
                      ? 'destructive' 
                      : 'outline'
              }
              className="h-20 text-3xl font-bold"
              onClick={() => handleAnswer(option.letter)}
              disabled={practiceAnswer !== null}
            >
              {option.letter}
            </Button>
          ))}
        </div>

        {practiceAnswer && practiceAnswer !== currentLetter.letter && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-500"
          >
            Richtig wäre: {currentLetter.letter} ({currentLetter.sound})
          </motion.p>
        )}
      </div>
    );
  };

  // Handschrift-Modus
  const renderHandwritingMode = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {HANDWRITING_PRACTICE.map((item, idx) => (
          <Card key={item.letter} className="p-4 text-center">
            <p className="text-4xl font-bold text-indigo-600 mb-2">{item.letter}</p>
            <p className="text-xs text-gray-500">{item.description}</p>
            <p className="text-xs text-gray-400 mt-1">{item.strokes} Striche</p>
          </Card>
        ))}
      </div>
      
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 Tipp: Übe die Buchstaben auf Papier. Achte besonders auf 
          <span className="font-bold"> И, Ш, Щ, Ц, Ж, Ф</span> - diese sehen anders aus als im Lateinischen.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Kyrillisches Alphabet</h2>
          <span className="text-sm text-gray-500">
            ({currentIndex + 1}/{CYRILLIC_ALPHABET.length})
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Modi */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learn">
            <Ear className="w-4 h-4 mr-1" />
            Lernen
          </TabsTrigger>
          <TabsTrigger value="practice">
            🎯 Üben
          </TabsTrigger>
          <TabsTrigger value="handwriting">
            <PenTool className="w-4 h-4 mr-1" />
            Schrift
          </TabsTrigger>
        </TabsList>

        <Card className="mt-4 p-6">
          <TabsContent value="learn" className="mt-0">
            {renderLearnMode()}
          </TabsContent>
          <TabsContent value="practice" className="mt-0">
            {renderPracticeMode()}
          </TabsContent>
          <TabsContent value="handwriting" className="mt-0">
            {renderHandwritingMode()}
          </TabsContent>
        </Card>
      </Tabs>

      {/* Navigation */}
      {mode !== 'handwriting' && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Zurück
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === CYRILLIC_ALPHABET.length - 1 && mode === 'practice'}
          >
            Weiter
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Fortschritt */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Gelernt: {learnedLetters.length}/{CYRILLIC_ALPHABET.length}</span>
        <div className="flex gap-1">
          {CYRILLIC_ALPHABET.slice(0, 10).map((l, i) => (
            <div
              key={l.letter}
              className={`w-2 h-2 rounded-full ${
                i <= currentIndex ? 'bg-indigo-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Weiche/Harte Laute Vergleich
export function SoftHardSounds() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Weiche & Harte Laute</h3>
      <div className="space-y-4">
        {SOFT_HARD_PAIRS.map((pair) => (
          <div key={pair.hard} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold">{pair.hard} → {pair.soft}</p>
              <p className="text-sm text-gray-500">
                {pair.exampleHard} → {pair.exampleSoft}
              </p>
            </div>
            <div className="flex gap-2">
              <AudioButton text={pair.exampleHard} lang="ru-RU" size="sm" />
              <AudioButton text={pair.exampleSoft} lang="ru-RU" size="sm" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
        <p className="font-medium text-blue-800">Merke:</p>
        <p className="text-blue-600">
          Der <strong>мягкий знак (ь)</strong> macht den vorherigen Konsonanten weich.
          Der <strong>твёрдый знак (ъ)</strong> trennt Laute und ist seltener.
        </p>
      </div>
    </Card>
  );
}
