import { useState, useRef, useEffect } from "react";
import { Play, Pause, X, Volume2, VolumeX, Radio, AlertCircle, Music, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stream {
  name: string;
  url: string;
  genre: string;
}

const STREAMS: Stream[] = [
  {
    name: "HardBase.FM",
    url: "https://listen.hardbase.fm/aac-64/stream.mp3",
    genre: "Hardstyle / Hardcore"
  },
  {
    name: "TechnoBase.FM",
    url: "https://listen.technobase.fm/aac-64/stream.mp3", 
    genre: "Techno / Hard Trance"
  },
  {
    name: "Hardcore Radio",
    url: "https://stream.laut.fm/hardcoreradio",
    genre: "Gabber / Hardcore"
  },
  {
    name: "Radio Paradise",
    url: "https://stream.radioparadise.com/aac-128",
    genre: "Mixed / Alternative"
  },
  {
    name: "BunkerTV Audio",
    url: "https://icecast-qts.cmgdigital.com/wbts_fmaac_64", // Beispiel - BunkerTV hat oft keinen direkten MP3 Stream, alternativ nutzen
    genre: "Hardcore (Fallback)"
  }
];

export default function StreamPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Startet minimiert
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream>(STREAMS[0]); // Default: HardBase
  const [showStreamSelect, setShowStreamSelect] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    audioRef.current = new Audio(currentStream.url);
    audioRef.current.volume = volume;
    audioRef.current.crossOrigin = "anonymous"; // Wichtig für CORS
    
    audioRef.current.addEventListener('error', () => {
      setError("Stream offline or blocked");
      setIsPlaying(false);
      setIsLoading(false);
    });

    audioRef.current.addEventListener('canplay', () => {
      setError(null);
      setIsLoading(false);
      if (isPlaying) {
        audioRef.current?.play().catch(() => {
          setError("Autoplay blocked");
          setIsPlaying(false);
        });
      }
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentStream]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    setError(null);
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        setError("Click blocked by browser");
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const changeStream = (stream: Stream) => {
    setCurrentStream(stream);
    setIsPlaying(false);
    setShowStreamSelect(false);
    setError(null);
  };

  const handleExit = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsVisible(false);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2 animate-pulse"
      >
        <Radio className="w-5 h-5" />
        <span className="text-xs font-mono hidden sm:inline">RADIO</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold">STREAM</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleExit}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Stream Selector */}
        <div className="relative">
          <button
            onClick={() => setShowStreamSelect(!showStreamSelect)}
            className="w-full p-2 bg-muted border border-border rounded text-xs font-mono flex items-center justify-between hover:border-primary/50 transition-colors"
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-primary">{currentStream.name}</span>
              <span className="text-muted-foreground text-[10px]">{currentStream.genre}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showStreamSelect && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {STREAMS.map((stream) => (
                <button
                  key={stream.name}
                  onClick={() => changeStream(stream)}
                  className={`w-full p-2 text-left text-xs font-mono border-b border-border last:border-0 hover:bg-muted transition-colors ${
                    currentStream.name === stream.name ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <div className="font-bold">{stream.name}</div>
                  <div className="text-muted-foreground text-[10px]">{stream.genre}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/30 rounded text-[10px] font-mono text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "default" : "outline"}
            className="flex-1 gap-2 font-mono text-xs h-10"
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

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Status */}
        <div className="text-[10px] font-mono text-center text-muted-foreground border-t border-border pt-2">
          {isPlaying ? (
            <span className="text-green-500 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              STREAMING {currentStream.name.toUpperCase()}
            </span>
          ) : (
            <span>Select stream & press PLAY</span>
         
