import { useEffect, useRef } from 'react';

interface ThoughtParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  life: number;
  color: string;
  size: number;
}

interface NeuralSandboxProps {
  thoughts: string[];
  isThinking: boolean;
}

export const NeuralSandbox = ({ thoughts, isThinking }: NeuralSandboxProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ThoughtParticle[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn particles for new thoughts
    thoughts.forEach((thought, idx) => {
      if (idx === thoughts.length - 1) {
        const hues = [180, 200, 220, 240];
        particlesRef.current.push({
          x: canvas.width / devicePixelRatio / 2 + (Math.random() - 0.5) * 150,
          y: canvas.height / devicePixelRatio - 80,
          vx: (Math.random() - 0.5) * 6,
          vy: -3 - Math.random() * 4,
          text: thought.substring(0, 25),
          life: 1.0,
          color: `hsl(${hues[idx % hues.length]}, 100%, 50%)`,
          size: 3 + Math.random() * 6
        });
      }
    });

    let animationId: number;
    
    const animate = () => {
      frameRef.current++;
      
      // Background with pulse effect
      const pulseOpacity = isThinking ? 0.15 + Math.sin(frameRef.current * 0.05) * 0.05 : 0.1;
      ctx.fillStyle = `rgba(0, 0, 0, ${pulseOpacity})`;
      ctx.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);

      // Draw particles
      particlesRef.current.forEach((p) => {
        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.life -= 0.008;
        
        if (p.life > 0) {
          // Glow
          ctx.shadowBlur = 25 * p.life;
          ctx.shadowColor = p.color;
          
          // Particle circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Text
          if (p.life > 0.4) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.8})`;
            ctx.font = 'bold 11px monospace';
            ctx.fillText(p.text, p.x + 12, p.y + 4);
          }
        }
      });

      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [thoughts, isThinking]);

  return (
    <div className="w-full h-48 bg-gradient-to-b from-black via-slate-950 to-black rounded-lg border border-cyan-500 border-opacity-30 overflow-hidden relative shadow-lg shadow-cyan-500/20">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-3 left-4 text-xs font-mono text-cyan-400 opacity-70">
        ◆ Neural Activity Monitor
      </div>
      {isThinking && (
        <div className="absolute top-3 right-4 text-xs font-mono text-lime-400 opacity-70 animate-pulse">
          ⚡ Processing...
        </div>
      )}
    </div>
  );
};
