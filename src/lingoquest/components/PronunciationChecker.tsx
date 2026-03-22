import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { speechRecognitionService } from '../services/speechRecognition';
import { ttsService } from '../services/ttsService';
import type { PronunciationScore } from '../types';

interface PronunciationCheckerProps {
  targetWord: string;
  targetLang?: 'ru-RU' | 'de-DE';
  onResult?: (score: PronunciationScore) => void;
  className?: string;
}

export function PronunciationChecker({
  targetWord,
  targetLang = 'ru-RU',
  onResult,
  className = '',
}: PronunciationCheckerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const isAvailable = speechRecognitionService.isAvailable();

  const handleStart = async () => {
    setError(null);
    setScore(null);
    
    // Berechtigung prüfen
    const permission = await speechRecognitionService.checkPermission();
    if (permission === 'denied') {
      setError('Mikrofon-Zugriff wurde verweigert. Bitte in den Einstellungen erlauben.');
      return;
    }

    setIsListening(true);
    setIsProcessing(true);

    try {
      const result = await speechRecognitionService.checkPronunciation(targetWord, targetLang);
      setScore(result);
      onResult?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Spracherkennung');
    } finally {
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  const handleStop = () => {
    speechRecognitionService.stop();
    setIsListening(false);
    setIsProcessing(false);
  };

  const handlePlayTarget = () => {
    ttsService.speak(targetWord, targetLang, { rate: 0.7 });
  };

  const getFeedbackColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-green-500';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 85) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isAvailable) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Mic className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Spracherkennung wird von deinem Browser nicht unterstützt.</p>
          <p className="text-xs mt-1">Versuche Chrome, Edge oder Safari.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Zielwort */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Sprich nach:</p>
            <p className="text-2xl font-bold text-indigo-600">{targetWord}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handlePlayTarget}>
            <Volume2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Mikrofon-Button */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  size="lg"
                  variant="destructive"
                  className="rounded-full h-20 w-20"
                  onClick={handleStop}
                >
                  <Square className="w-8 h-8" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  size="lg"
                  className="rounded-full h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  onClick={handleStart}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status-Text */}
        <p className="text-center text-sm text-gray-500">
          {isListening ? 'Höre zu...' : isProcessing ? 'Verarbeite...' : 'Tippe zum Sprechen'}
        </p>

        {/* Fehler */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Ergebnis */}
        <AnimatePresence>
          {score && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-2 border-t"
            >
              {/* Genauigkeit */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Genauigkeit</span>
                  <span className={`text-lg font-bold ${getFeedbackColor(score.accuracy)}`}>
                    {score.accuracy}%
                  </span>
                </div>
                <Progress 
                  value={score.accuracy} 
                  className="h-2"
                />
                <style>{`
                  [data-state="complete"] {
                    background-color: ${score.accuracy >= 85 ? '#22c55e' : score.accuracy >= 60 ? '#eab308' : '#ef4444'} !important;
                  }
                `}</style>
              </div>

              {/* Feedback */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {score.feedback === 'perfekt' ? '🌟' : score.feedback === 'gut' ? '👍' : '💪'}
                </span>
                <span className="font-medium capitalize">{score.feedback}</span>
              </div>

              {/* Erkannter Text */}
              <div className="p-2 bg-gray-50 rounded text-sm">
                <span className="text-gray-500">Erkannt: </span>
                <span className="font-medium">{score.transcript}</span>
              </div>

              {/* Detaillierte Rückmeldung */}
              {score.details && (
                <p className="text-sm text-gray-600">{score.details}</p>
              )}

              {/* Sterne-Anzeige */}
              <div className="flex justify-center gap-1 pt-2">
                {[1, 2, 3].map((star) => (
                  <motion.span
                    key={star}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: score.accuracy >= star * 33 ? 1 : 0.5,
                      opacity: score.accuracy >= star * 33 ? 1 : 0.3,
                    }}
                    transition={{ delay: star * 0.1 }}
                    className="text-2xl"
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
