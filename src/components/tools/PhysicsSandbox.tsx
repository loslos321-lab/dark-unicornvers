import { useEffect, useRef, useState, useCallback } from "react";
import { Atom, Play, Pause, RefreshCw, MousePointer2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolLayout from "@/components/ToolLayout";

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  mass: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default function PhysicsSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isRunning, setIsRunning] = useState(true);
  const [ballCount, setBallCount] = useState(0);
  const [spawnCount, setSpawnCount] = useState(0);
  const ballsRef = useRef<Ball[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const lastTimeRef = useRef(0);
  
  const GRAVITY = 0.5;
  const FRICTION = 0.99;
  const BOUNCE = 0.8;
  const SPAWN_ON_ESCAPE = true;

  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", 
    "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef"
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const createBall = (x: number, y: number, vx: number = 0, vy: number = 0, radius?: number): Ball => ({
    id: Math.random(),
    x,
    y,
    vx: vx + (Math.random() - 0.5) * 10,
    vy: vy + (Math.random() - 0.5) * 10,
    radius: radius || 10 + Math.random() * 15,
    color: getRandomColor(),
    mass: 1
  });

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color
      });
    }
  };

  const checkCollision = (b1: Ball, b2: Ball) => {
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < b1.radius + b2.radius;
  };

  const resolveCollision = (b1: Ball, b2: Ball) => {
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const nx = dx / distance;
    const ny = dy / distance;
    
    const dvx = b2.vx - b1.vx;
    const dvy = b2.vy - b1.vy;
    const velAlongNormal = dvx * nx + dvy * ny;
    
    if (velAlongNormal > 0) return;
    
    const j = -(1 + BOUNCE) * velAlongNormal;
    const impulse = j / (1/b1.mass + 1/b2.mass);
    
    b1.vx -= (impulse * nx) / b1.mass;
    b1.vy -= (impulse * ny) / b1.mass;
    b2.vx += (impulse * nx) / b2.mass;
    b2.vy += (impulse * ny) / b2.mass;
    
    // Separate balls to prevent sticking
    const overlap = (b1.radius + b2.radius - distance) / 2;
    b1.x -= overlap * nx;
    b1.y -= overlap * ny;
    b2.x += overlap * nx;
    b2.y += overlap * ny;
  };

  const update = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Update balls
    ballsRef.current.forEach(ball => {
      // Apply gravity
      ball.vy += GRAVITY;
      
      // Apply friction
      ball.vx *= FRICTION;
      ball.vy *= FRICTION;
      
      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;
      
      // Wall collisions
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -BOUNCE;
      }
      if (ball.x + ball.radius > width) {
        ball.x = width - ball.radius;
        ball.vx *= -BOUNCE;
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -BOUNCE;
      }
      
      // Floor collision
      if (ball.y + ball.radius > height) {
        ball.y = height - ball.radius;
        ball.vy *= -BOUNCE;
      }
    });
    
    // Check ball-to-ball collisions
    for (let i = 0; i < ballsRef.current.length; i++) {
      for (let j = i + 1; j < ballsRef.current.length; j++) {
        if (checkCollision(ballsRef.current[i], ballsRef.current[j])) {
          resolveCollision(ballsRef.current[i], ballsRef.current[j]);
        }
      }
    }
    
    // Check escapes and spawn new balls (THE VIRAL MECHANIC)
    const escaped: number[] = [];
    ballsRef.current.forEach((ball, index) => {
      // Escape through bottom (falling out)
      if (ball.y - ball.radius > height + 50) {
        escaped.push(index);
      }
      // Escape through sides with high velocity
      else if ((ball.x < -50 || ball.x > width + 50) && Math.abs(ball.vx) > 15) {
        escaped.push(index);
      }
    });
    
    // Remove escaped and spawn 2 new ones (with limit)
    if (escaped.length > 0 && SPAWN_ON_ESCAPE) {
      escaped.reverse().forEach(index => {
        const ball = ballsRef.current[index];
        createExplosion(ball.x, ball.y, ball.color);
        
        // Remove escaped ball
        ballsRef.current.splice(index, 1);
        
        // Spawn 2 new balls at random positions (if under limit)
        if (ballsRef.current.length < 50) {
          setTimeout(() => {
            ballsRef.current.push(createBall(
              Math.random() * width,
              -20,
              (Math.random() - 0.5) * 10,
              5
            ));
            ballsRef.current.push(createBall(
              Math.random() * width,
              -20,
              (Math.random() - 0.5) * 10,
              5
            ));
            setSpawnCount(prev => prev + 2);
          }, 100);
        }
      });
    }
    
    // Update particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });
    
    // Mouse interaction (attract/repel)
    if (mouseRef.current.isDown) {
      ballsRef.current.forEach(ball => {
        const dx = mouseRef.current.x - ball.x;
        const dy = mouseRef.current.y - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = 0.5;
          ball.vx += (dx / dist) * force;
          ball.vy += (dy / dist) * force;
        }
      });
    }
    
    setBallCount(ballsRef.current.length);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Clear with trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Draw balls
    ballsRef.current.forEach(ball => {
      // Glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = ball.color;
      
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const loop = useCallback((timestamp: number) => {
    if (!isRunning) {
      animationRef.current = requestAnimationFrame(loop);
      return;
    }
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    update(deltaTime);
    draw();
    
    animationRef.current = requestAnimationFrame(loop);
  }, [isRunning, update, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Initial balls
    for (let i = 0; i < 5; i++) {
      ballsRef.current.push(createBall(
        canvas.width / 2 + (Math.random() - 0.5) * 100,
        canvas.height / 3 + (Math.random() - 0.5) * 100
      ));
    }
    
    animationRef.current = requestAnimationFrame(loop);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [loop]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Spawn new ball on click
    ballsRef.current.push(createBall(x, y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20));
    createExplosion(x, y, getRandomColor());
  };

  const reset = () => {
    ballsRef.current = [];
    particlesRef.current = [];
    setSpawnCount(0);
    
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 5; i++) {
        ballsRef.current.push(createBall(
          canvas.width / 2,
          canvas.height / 3
        ));
      }
    }
  };

  return (
    <ToolLayout 
      title="Physics Sandbox" 
      icon={Atom}
      description="Balls spawn 2 more when they escape. Click to add balls."
    >
      <div className="h-full flex flex-col">
        {/* Controls */}
        <div className="flex items-center justify-between p-4 bg-muted border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant={isRunning ? "default" : "outline"}
              onClick={() => setIsRunning(!isRunning)}
              className="gap-2 font-mono"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "PAUSE" : "PLAY"}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              className="gap-2 font-mono"
            >
              <RefreshCw className="w-4 h-4" />
              RESET
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Atom className="w-4 h-4 text-primary" />
              <span>BALLS: {ballCount}</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <Zap className="w-4 h-4" />
              <span>SPAWNED: {spawnCount}</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-black overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={() => mouseRef.current.isDown = true}
            onMouseUp={() => mouseRef.current.isDown = false}
            onMouseLeave={() => mouseRef.current.isDown = false}
            onClick={handleClick}
            className="w-full h-full cursor-crosshair"
            style={{ imageRendering: 'crisp-edges' }}
          />
          
          {/* Instructions Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <div className="bg-card/80 backdrop-blur-sm p-3 rounded border border-border text-xs font-mono space-y-1">
              <div className="flex items-center gap-2">
                <MousePointer2 className="w-3 h-3" />
                <span>Click to spawn balls</span>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <Zap className="w-3 h-3" />
                <span>Escaped balls spawn 2 more!</span>
              </div>
              <div className="text-muted-foreground">
                Hold mouse to attract balls
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
