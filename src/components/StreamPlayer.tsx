import { useState, useRef, useEffect } from "react";
import { Play, Pause, X, Volume2, VolumeX, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StreamPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const STREAM_URL = "http://81.18.165.236:80";

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume;
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Stream error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsVisible(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  if (!isVisible) {
    // Show small restore button when minimized
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all animate-pulse"
        title="Show Radio Player"
      >
        <Radio className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-64 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-mono font-bold">RADIO STREAM</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-mono text-muted-foreground">
            {isPlaying ? 'LIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 space-y-3">
        {/* Play/Pause Button */}
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "default" : "outline"}
            className={`flex-1 gap-2 font-mono text-xs ${isLoading ? 'opacity-50' : ''}`}
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> PAUSE
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> PLAY
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleExit}
            title="Close Player"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Stream Info */}
        <div className="text-[10px] font-mono text-muted-foreground text-center border-t border-border pt-2">
          {isPlaying ? (
            <span className="text-green-500 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Buffering stream...
            </span>
          ) : (
            <span>Click PLAY to start stream</span>
          )}
        </div>
      </div>
    </div>
  );
}
