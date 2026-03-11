import { useState, useRef, useEffect } from "react";
import { Play, Pause, X, Volume2, VolumeX, Radio, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StreamPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TESTE DIESEN STREAM (Radio Paradise - funktioniert fast immer):
  //const STREAM_URL = "https://stream.radioparadise.com/aac-128";
  
  // Oder deinen Original-Stream (kann CORS-Probleme haben):
  const STREAM_URL = "https://81.18.165.236:80";

  useEffect(() => {
    audioRef.current = new Audio(STREAM_URL);
    audioRef.current.volume = volume;
    
    // Error handling
    audioRef.current.addEventListener('error', (e) => {
      console.error("Audio error:", e);
      setError("Stream unavailable or blocked (CORS)");
      setIsPlaying(false);
      setIsLoading(false);
    });

    audioRef.current.addEventListener('canplay', () => {
      setError(null);
      setIsLoading(false);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    setError(null);
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        // Bei manchen Streams muss man currentTime resetten
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Play error:", error);
        setError("Playback failed - check console");
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsVisible(false);
    setError(null);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all"
      >
        <Radio className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-64 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-2xl">
      <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold">RADIO</span>
        </div>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleExit}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-3 space-y-3">
        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/30 rounded text-[10px] font-mono text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "default" : "outline"}
            className="flex-1 gap-2 font-mono text-xs"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <><Pause className="w-4 h-4" /> PAUSE</>
            ) : (
              <><Play className="w-4 h-4" /> PLAY</>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
            }}
            className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="text-[10px] font-mono text-muted-foreground text-center">
          {isPlaying ? "🔴 LIVE" : "Standby"}
        </div>
      </div>
    </div>
  );
}
