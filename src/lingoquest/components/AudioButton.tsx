import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ttsService } from '../services/ttsService';
import type { TTSLanguage } from '../services/ttsService';

interface AudioButtonProps {
  text: string;
  lang: TTSLanguage;
  size?: 'sm' | 'md' | 'lg';
  showWaveform?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
  onPlay?: () => void;
  onStop?: () => void;
}

export function AudioButton({
  text,
  lang,
  size = 'md',
  showWaveform = false,
  variant = 'ghost',
  className = '',
  onPlay,
  onStop,
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const handleClick = async () => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      onStop?.();
    } else {
      setIsPlaying(true);
      onPlay?.();
      try {
        await ttsService.speak(text, lang, { rate: lang === 'ru-RU' ? 0.8 : 1 });
      } finally {
        setIsPlaying(false);
        onStop?.();
      }
    }
  };

  // Waveform Animation
  useEffect(() => {
    if (!showWaveform || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 20;
    const barWidth = canvas.width / bars;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < bars; i++) {
        const height = isPlaying 
          ? Math.random() * canvas.height * 0.8 + canvas.height * 0.2
          : isHovered 
            ? canvas.height * 0.3 
            : canvas.height * 0.1;
        
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;
        
        ctx.fillStyle = isPlaying 
          ? `rgba(99, 102, 241, ${0.5 + Math.random() * 0.5})`
          : 'rgba(156, 163, 175, 0.5)';
        ctx.fillRect(x + 1, y, barWidth - 2, height);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isHovered, showWaveform]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size="icon"
        className={`${sizeClasses[size]} rounded-full ${className} ${
          isPlaying ? 'bg-indigo-100 text-indigo-600 animate-pulse' : ''
        }`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <VolumeX size={iconSizes[size]} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              {lang === 'ru-RU' ? (
                <Volume2 size={iconSizes[size]} />
              ) : (
                <Volume1 size={iconSizes[size]} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {showWaveform && (
        <canvas
          ref={canvasRef}
          width={80}
          height={24}
          className="rounded-full bg-gray-100 dark:bg-gray-800"
        />
      )}
    </div>
  );
}

// AudioPlayer mit beidem Sprachen
interface BilingualAudioPlayerProps {
  russian: string;
  german: string;
  showLabels?: boolean;
  className?: string;
}

export function BilingualAudioPlayer({
  russian,
  german,
  showLabels = true,
  className = '',
}: BilingualAudioPlayerProps) {
  const [isPlayingBoth, setIsPlayingBoth] = useState(false);

  const handlePlayBoth = async () => {
    if (isPlayingBoth) {
      ttsService.stop();
      setIsPlayingBoth(false);
      return;
    }

    setIsPlayingBoth(true);
    try {
      await ttsService.speakBoth(russian, german, { slow: true });
    } finally {
      setIsPlayingBoth(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-red-500 w-8">RU</span>
          <span className="text-sm font-medium">{russian}</span>
          <AudioButton text={russian} lang="ru-RU" size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-500 w-8">DE</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{german}</span>
          <AudioButton text={german} lang="de-DE" size="sm" />
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handlePlayBoth}
        className={isPlayingBoth ? 'bg-indigo-50 text-indigo-600' : ''}
      >
        <Volume2 className="w-4 h-4 mr-1" />
        Beide
      </Button>
    </div>
  );
}
