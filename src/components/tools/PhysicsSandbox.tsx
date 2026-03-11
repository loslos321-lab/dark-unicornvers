import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { 
  Atom, Play, Pause, RefreshCw, MousePointer2, Zap, ArrowLeft, 
  Target, Trophy, Settings, Volume2, VolumeX, Save, FolderOpen,
  Bomb, Wind, Magnet as MagnetIcon, Circle, Square, Triangle,
  ChevronRight, Sparkles, Timer, BarChart3, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==========================================
// TYPES & INTERFACES
// ==========================================

type GameMode = "sandbox" | "survival" | "targets" | "zen";
type BallType = "normal" | "heavy" | "light" | "bouncy" | "sticky" | "explosive";

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  mass: number;
  type: BallType;
  trail: { x: number; y: number }[];
  life: number; // For limited lifetime balls
  glowIntensity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: "spark" | "smoke" | "star" | "trail";
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "wall" | "bumper" | "portal" | "blackhole" | "fan";
  color: string;
  rotation: number;
  rotationSpeed: number;
  active: boolean;
  metadata?: {
    targetId?: number; // for portals
    strength?: number; // for fans/blackholes
    direction?: number; // for fans
  };
}

interface Target {
  id: number;
  x: number;
  y: number;
  radius: number;
  points: number;
  hit: boolean;
  respawnTime: number;
  color: string;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: "multiball" | "slowmo" | "explosion" | "gravity";
  active: boolean;
  duration: number;
  collectedAt?: number;
}

interface GameStats {
  score: number;
  ballsSpawned: number;
  ballsLost: number;
  targetsHit: number;
  combo: number;
  maxCombo: number;
  playTime: number;
}

interface GameState {
  mode: GameMode;
  isRunning: boolean;
  isPaused: boolean;
  showMenu: boolean;
  level: number;
  gravity: number;
  friction: number;
  soundEnabled: boolean;
  particlesEnabled: boolean;
  trailsEnabled: boolean;
}

// ==========================================
// CONSTANTS
// ==========================================

const COLORS = {
  normal: ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef"],
  neon: ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff", "#06ffa5", "#ff006e"],
  obstacles: {
    wall: "#475569",
    bumper: "#eab308",
    portal: "#a855f7",
    blackhole: "#000000",
    fan: "#06b6d4"
  }
};

const BALL_PROPERTIES: Record<BallType, { mass: number; bounce: number; friction: number; color: string }> = {
  normal: { mass: 1, bounce: 0.8, friction: 0.99, color: "#3b82f6" },
  heavy: { mass: 3, bounce: 0.3, friction: 0.98, color: "#64748b" },
  light: { mass: 0.5, bounce: 0.9, friction: 0.995, color: "#fbbf24" },
  bouncy: { mass: 0.8, bounce: 1.2, friction: 0.99, color: "#ec4899" },
  sticky: { mass: 1.2, bounce: 0.1, friction: 0.95, color: "#10b981" },
  explosive: { mass: 1.5, bounce: 0.6, friction: 0.98, color: "#ef4444" }
};

// ==========================================
// AUDIO SYSTEM (Web Audio API)
// ==========================================

class AudioSystem {
  ctx: AudioContext | null = null;
  enabled: boolean = true;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }
  
  playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.enabled || !this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
  
  playBounce(intensity: number = 1) {
    this.playTone(200 * intensity, 0.1, 'triangle', 0.05);
  }
  
  playSpawn() {
    this.playTone(440, 0.15, 'sine', 0.05);
    setTimeout(() => this.playTone(880, 0.15, 'sine', 0.05), 50);
  }
  
  playExplosion() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
  
  playPowerUp() {
    this.playTone(523.25, 0.1, 'square', 0.05);
    setTimeout(() => this.playTone(659.25, 0.1, 'square', 0.05), 100);
    setTimeout(() => this.playTone(783.99, 0.2, 'square', 0.05), 200);
  }
  
  playTargetHit() {
    this.playTone(1000, 0.1, 'sine', 0.03);
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function NeonPhysicsArena() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioRef = useRef<AudioSystem>(new AudioSystem());
  const lastTimeRef = useRef(0);
  const comboTimerRef = useRef(0);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    mode: "sandbox",
    isRunning: true,
    isPaused: false,
    showMenu: false,
    level: 1,
    gravity: 0.5,
    friction: 0.99,
    soundEnabled: true,
    particlesEnabled: true,
    trailsEnabled: true
  });
  
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    ballsSpawned: 0,
    ballsLost: 0,
    targetsHit: 0,
    combo: 0,
    maxCombo: 0,
    playTime: 0
  });
  
  const [selectedTool, setSelectedTool] = useState<BallType | "obstacle" | "delete">("normal");
  const [notification, setNotification] = useState<{ text: string; type: "info" | "success" | "warning" } | null>(null);
  
  // Game Objects Refs (for performance)
  const ballsRef = useRef<Ball[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const targetsRef = useRef<Target[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, rightDown: false });
  const slowMotionRef = useRef(1);
  const shakeRef = useRef(0);
  
  // ==========================================
  // INITIALIZATION & UTILITIES
  // ==========================================
  
  const showNotification = useCallback((text: string, type: "info" | "success" | "warning" = "info") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 2000);
  }, []);
  
  const createBall = useCallback((x: number, y: number, vx: number = 0, vy: number = 0, type: BallType = "normal", radius?: number): Ball => {
    const props = BALL_PROPERTIES[type];
    return {
      id: Math.random(),
      x,
      y,
      vx: vx + (Math.random() - 0.5) * 10,
      vy: vy + (Math.random() - 0.5) * 10,
      radius: radius || 10 + Math.random() * 15,
      color: type === "normal" ? COLORS.normal[Math.floor(Math.random() * COLORS.normal.length)] : props.color,
      mass: props.mass,
      type,
      trail: [],
      life: type === "explosive" ? 300 : Infinity,
      glowIntensity: 20
    };
  }, []);
  
  const createParticle = useCallback((x: number, y: number, vx: number, vy: number, color: string, type: Particle["type"] = "spark", size: number = 3): Particle => ({
    x, y, vx, vy, color, type, size,
    life: 1,
    maxLife: 1
  }), []);
  
  const createExplosion = useCallback((x: number, y: number, color: string, count: number = 15, intensity: number = 1) => {
    if (!gameState.particlesEnabled) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 5 * intensity;
      particlesRef.current.push(createParticle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        Math.random() > 0.5 ? "spark" : "smoke",
        Math.random() * 4 + 2
      ));
    }
    shakeRef.current = 10 * intensity;
    audioRef.current.playExplosion();
  }, [gameState.particlesEnabled, createParticle]);
  
  const createTarget = useCallback((canvasWidth: number, canvasHeight: number): Target => ({
    id: Math.random(),
    x: Math.random() * (canvasWidth - 100) + 50,
    y: Math.random() * (canvasHeight - 200) + 50,
    radius: 15 + Math.random() * 10,
    points: Math.floor(Math.random() * 50) + 10,
    hit: false,
    respawnTime: 0,
    color: COLORS.neon[Math.floor(Math.random() * COLORS.neon.length)]
  }), []);
  
  // ==========================================
  // PHYSICS ENGINE
  // ==========================================
  
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
    
    const b1Props = BALL_PROPERTIES[b1.type];
    const b2Props = BALL_PROPERTIES[b2.type];
    const bounce = (b1Props.bounce + b2Props.bounce) / 2;
    
    const j = -(1 + bounce) * velAlongNormal;
    const impulse = j / (1/b1.mass + 1/b2.mass);
    
    b1.vx -= (impulse * nx) / b1.mass;
    b1.vy -= (impulse * ny) / b1.mass;
    b2.vx += (impulse * nx) / b2.mass;
    b2.vy += (impulse * ny) / b2.mass;
    
    const overlap = (b1.radius + b2.radius - distance) / 2;
    b1.x -= overlap * nx;
    b1.y -= overlap * ny;
    b2.x += overlap * nx;
    b2.y += overlap * ny;
    
    // Audio
    if (Math.abs(velAlongNormal) > 2) {
      audioRef.current.playBounce(Math.min(Math.abs(velAlongNormal) / 10, 1));
    }
    
    // Particles on hard impact
    if (Math.abs(velAlongNormal) > 8 && gameState.particlesEnabled) {
      createExplosion((b1.x + b2.x) / 2, (b1.y + b2.y) / 2, "#ffffff", 5, 0.5);
    }
  };
  
  const checkObstacleCollision = (ball: Ball, obstacle: Obstacle) => {
    // Simple AABB collision for rectangles
    const closestX = Math.max(obstacle.x, Math.min(ball.x, obstacle.x + obstacle.width));
    const closestY = Math.max(obstacle.y, Math.min(ball.y, obstacle.y + obstacle.height));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < ball.radius) {
      if (obstacle.type === "bumper") {
        // Bounce away from center
        const centerX = obstacle.x + obstacle.width / 2;
        const centerY = obstacle.y + obstacle.height / 2;
        const angle = Math.atan2(ball.y - centerY, ball.x - centerX);
        ball.vx += Math.cos(angle) * 15;
        ball.vy += Math.sin(angle) * 15;
        createExplosion(ball.x, ball.y, COLORS.obstacles.bumper, 8, 0.8);
        setStats(s => ({ ...s, score: s.score + 50 }));
        audioRef.current.playBounce(1.5);
      } else if (obstacle.type === "portal" && obstacle.metadata?.targetId) {
        const target = obstaclesRef.current.find(o => o.id === obstacle.metadata?.targetId);
        if (target) {
          ball.x = target.x + target.width / 2;
          ball.y = target.y + target.height / 2;
          createExplosion(ball.x, ball.y, COLORS.obstacles.portal, 10, 0.6);
        }
      }
      
      // Push out of collision
      const overlap = ball.radius - distance;
      const nx = dx / distance || 0;
      const ny = dy / distance || 0;
      ball.x += nx * overlap;
      ball.y += ny * overlap;
      ball.vx *= 0.8;
      ball.vy *= 0.8;
    }
  };
  
  const applyForces = (ball: Ball, deltaTime: number) => {
    // Black holes
    obstaclesRef.current.filter(o => o.type === "blackhole").forEach(bh => {
      const centerX = bh.x + bh.width / 2;
      const centerY = bh.y + bh.height / 2;
      const dx = centerX - ball.x;
      const dy = centerY - ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const strength = bh.metadata?.strength || 1000;
      
      if (dist < 300) {
        const force = strength / (dist * dist + 100);
        ball.vx += (dx / dist) * force * deltaTime;
        ball.vy += (dy / dist) * force * deltaTime;
        
        if (dist < 20) {
          ball.life = 0; // Destroy ball
          createExplosion(ball.x, ball.y, "#000000", 20, 1);
        }
      }
    });
    
    // Fans
    obstaclesRef.current.filter(o => o.type === "fan").forEach(fan => {
      const strength = fan.metadata?.strength || 5;
      const dir = fan.metadata?.direction || 0;
      const centerX = fan.x + fan.width / 2;
      const centerY = fan.y + fan.height / 2;
      const dx = ball.x - centerX;
      const dy = ball.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 150) {
        ball.vx += Math.cos(dir) * strength * (1 - dist/150);
        ball.vy += Math.sin(dir) * strength * (1 - dist/150);
      }
    });
  };
  
  // ==========================================
  // GAME LOOP
  // ==========================================
  
  const update = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState.isPaused) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const dt = deltaTime * slowMotionRef.current;
    
    // Update combo timer
    comboTimerRef.current -= dt;
    if (comboTimerRef.current <= 0 && stats.combo > 0) {
      setStats(s => ({ ...s, combo: 0 }));
    }
    
    // Update obstacles
    obstaclesRef.current.forEach(obs => {
      obs.rotation += obs.rotationSpeed * dt;
    });
    
    // Update balls
    ballsRef.current = ballsRef.current.filter(ball => {
      // Trail
      if (gameState.trailsEnabled && ball.trail.length > 20) ball.trail.shift();
      if (gameState.trailsEnabled) ball.trail.push({ x: ball.x, y: ball.y });
      
      // Physics
      const props = BALL_PROPERTIES[ball.type];
      ball.vy += (gameState.gravity * props.mass) * dt * 0.1;
      ball.vx *= props.friction;
      ball.vy *= props.friction;
      ball.x += ball.vx * dt * 0.1;
      ball.y += ball.vy * dt * 0.1;
      
      // Life (for explosive balls)
      if (ball.life !== Infinity) {
        ball.life -= dt;
        if (ball.life <= 0) {
          createExplosion(ball.x, ball.y, ball.color, 30, 1.2);
          // Damage nearby balls
          ballsRef.current.forEach(other => {
            if (other.id !== ball.id) {
              const dx = other.x - ball.x;
              const dy = other.y - ball.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 100) {
                other.vx += (dx / dist) * 20;
                other.vy += (dy / dist) * 20;
              }
            }
          });
          return false;
        }
      }
      
      // Walls
      if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -props.bounce; }
      if (ball.x + ball.radius > width) { ball.x = width - ball.radius; ball.vx *= -props.bounce; }
      if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy *= -props.bounce; }
      
      // Floor (lose ball)
      if (ball.y - ball.radius > height + 50) {
        setStats(s => ({ ...s, ballsLost: s.ballsLost + 1, combo: 0 }));
        if (gameState.mode === "survival") {
          setStats(s => ({ ...s, score: Math.max(0, s.score - 100) }));
        }
        createExplosion(ball.x, height, "#ef4444", 10, 0.5);
        return false;
      }
      
      // Obstacles
      obstaclesRef.current.forEach(obs => checkObstacleCollision(ball, obs));
      
      // Targets
      if (gameState.mode === "targets") {
        targetsRef.current.forEach(target => {
          if (!target.hit) {
            const dx = ball.x - target.x;
            const dy = ball.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ball.radius + target.radius) {
              target.hit = true;
              const comboBonus = Math.min(stats.combo * 10, 100);
              setStats(s => ({ 
                ...s, 
                score: s.score + target.points + comboBonus, 
                targetsHit: s.targetsHit + 1,
                combo: s.combo + 1,
                maxCombo: Math.max(s.maxCombo, s.combo + 1)
              }));
              comboTimerRef.current = 3000; // 3 seconds to keep combo
              createExplosion(target.x, target.y, target.color, 20, 1);
              audioRef.current.playTargetHit();
              showNotification(`+${target.points + comboBonus} pts!`, "success");
            }
          }
        });
      }
      
      // Forces
      applyForces(ball, dt);
      
      return true;
    });
    
    // Ball-to-ball collisions
    for (let i = 0; i < ballsRef.current.length; i++) {
      for (let j = i + 1; j < ballsRef.current.length; j++) {
        if (checkCollision(ballsRef.current[i], ballsRef.current[j])) {
          resolveCollision(ballsRef.current[i], ballsRef.current[j]);
        }
      }
    }
    
    // Powerups
    powerUpsRef.current = powerUpsRef.current.filter(pu => {
      if (!pu.active) return false;
      
      // Check collection
      ballsRef.current.forEach(ball => {
        const dx = ball.x - pu.x;
        const dy = ball.y - pu.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ball.radius + 20) {
          pu.active = false;
          audioRef.current.playPowerUp();
          setStats(s => ({ ...s, score: s.score + 200 }));
          showNotification("Power Up Collected!", "success");
          
          switch (pu.type) {
            case "multiball":
              for (let i = 0; i < 3; i++) {
                ballsRef.current.push(createBall(pu.x, pu.y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20));
              }
              break;
            case "slowmo":
              slowMotionRef.current = 0.3;
              setTimeout(() => slowMotionRef.current = 1, 3000);
              break;
            case "explosion":
              createExplosion(pu.x, pu.y, "#ff006e", 40, 2);
              ballsRef.current.forEach(ball => {
                const dx = ball.x - pu.x;
                const dy = ball.y - pu.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 0) {
                  ball.vx += (dx / dist) * 30;
                  ball.vy += (dy / dist) * 30;
                }
              });
              break;
            case "gravity":
              const oldGravity = gameState.gravity;
              setGameState(s => ({ ...s, gravity: -2 }));
              setTimeout(() => setGameState(s => ({ ...s, gravity: oldGravity })), 5000);
              break;
          }
        }
      });
      
      return pu.active;
    });
    
    // Update particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx * dt * 0.1;
      p.y += p.vy * dt * 0.1;
      p.life -= 0.02 * dt * 0.1;
      if (p.type === "smoke") p.vy -= 0.1;
      return p.life > 0;
    });
    
    // Spawn targets in target mode
    if (gameState.mode === "targets" && targetsRef.current.filter(t => !t.hit).length < 3) {
      if (Math.random() < 0.02) {
        targetsRef.current.push(createTarget(width, height));
      }
    }
    
    // Random powerup spawn
    if (Math.random() < 0.001 && powerUpsRef.current.length < 2) {
      powerUpsRef.current.push({
        id: Math.random(),
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 200) + 50,
        type: ["multiball", "slowmo", "explosion", "gravity"][Math.floor(Math.random() * 4)] as PowerUp["type"],
        active: true,
        duration: 10000
      });
    }
    
    // Mouse interaction (attractor)
    if (mouseRef.current.isDown && selectedTool === "normal") {
      ballsRef.current.forEach(ball => {
        const dx = mouseRef.current.x - ball.x;
        const dy = mouseRef.current.y - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = 2;
          ball.vx += (dx / dist) * force;
          ball.vy += (dy / dist) * force;
        }
      });
    }
    
    // Screen shake decay
    if (shakeRef.current > 0) shakeRef.current *= 0.9;
    if (shakeRef.current < 0.5) shakeRef.current = 0;
    
  }, [gameState, stats.combo, createBall, createExplosion, createTarget, selectedTool, showNotification]);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Clear with trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply screen shake
    ctx.save();
    if (shakeRef.current > 0) {
      const dx = (Math.random() - 0.5) * shakeRef.current;
      const dy = (Math.random() - 0.5) * shakeRef.current;
      ctx.translate(dx, dy);
    }
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw obstacles
    obstaclesRef.current.forEach(obs => {
      ctx.save();
      ctx.translate(obs.x + obs.width/2, obs.y + obs.height/2);
      ctx.rotate(obs.rotation);
      ctx.translate(-obs.width/2, -obs.height/2);
      
      if (obs.type === "portal") {
        ctx.shadowBlur = 20;
        ctx.shadowColor = COLORS.obstacles.portal;
        ctx.fillStyle = COLORS.obstacles.portal;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(0, 0, obs.width, obs.height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, obs.width, obs.height);
      } else if (obs.type === "blackhole") {
        const gradient = ctx.createRadialGradient(obs.width/2, obs.height/2, 0, obs.width/2, obs.height/2, obs.width/2);
        gradient.addColorStop(0, "#000");
        gradient.addColorStop(0.5, "#4c1d95");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(obs.width/2, obs.height/2, obs.width/2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = COLORS.obstacles[obs.type];
        ctx.fillRect(0, 0, obs.width, obs.height);
      }
      ctx.restore();
    });
    
    // Draw targets
    if (gameState.mode === "targets") {
      targetsRef.current.forEach(target => {
        if (target.hit) return;
        ctx.shadowBlur = 20;
        ctx.shadowColor = target.color;
        ctx.fillStyle = target.color;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Rings
        ctx.strokeStyle = target.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius + 5 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Text
        ctx.fillStyle = "#fff";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(target.points.toString(), target.x, target.y + 4);
      });
    }
    
    // Draw powerups
    powerUpsRef.current.forEach(pu => {
      if (!pu.active) return;
      const colors = {
        multiball: "#ff006e",
        slowmo: "#00b4d8",
        explosion: "#ffbe0b",
        gravity: "#8338ec"
      };
      ctx.shadowBlur = 30;
      ctx.shadowColor = colors[pu.type];
      ctx.fillStyle = colors[pu.type];
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, 15 + Math.sin(Date.now() / 100) * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon
      ctx.fillStyle = "#fff";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("★", pu.x, pu.y + 5);
    });
    
    // Draw particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      if (p.type === "trail") {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    
    // Draw balls with trails
    ballsRef.current.forEach(ball => {
      // Trail
      if (gameState.trailsEnabled && ball.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
        for (let i = 1; i < ball.trail.length; i++) {
          ctx.lineTo(ball.trail[i].x, ball.trail[i].y);
        }
        ctx.strokeStyle = ball.color;
        ctx.lineWidth = ball.radius * 0.5;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // Ball
      ctx.shadowBlur = ball.glowIntensity;
      ctx.shadowColor = ball.color;
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
    });
    
    // Draw mouse force field
    if (mouseRef.current.isDown && selectedTool === "normal") {
      const gradient = ctx.createRadialGradient(mouseRef.current.x, mouseRef.current.y, 0, mouseRef.current.x, mouseRef.current.y, 200);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 200, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, [gameState.trailsEnabled, gameState.mode, selectedTool]);
  
  const loop = useCallback((timestamp: number) => {
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    if (gameState.isRunning && !gameState.isPaused) {
      update(deltaTime);
      draw();
      setStats(s => ({ ...s, playTime: s.playTime + deltaTime }));
    }
    
    animationRef.current = requestAnimationFrame(loop);
  }, [gameState.isRunning, gameState.isPaused, update, draw]);
  
  // ==========================================
  // INPUT HANDLERS
  // ==========================================
  
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
  }, [loop, createBall]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setGameState(s => ({ ...s, isPaused: !s.isPaused }));
          break;
        case 'r':
        case 'R':
          resetGame();
          break;
        case 'm':
        case 'M':
          setGameState(s => ({ ...s, showMenu: !s.showMenu }));
          break;
        case '1':
          setSelectedTool("normal");
          break;
        case '2':
          setSelectedTool("heavy");
          break;
        case '3':
          setSelectedTool("bouncy");
          break;
        case '4':
          setSelectedTool("explosive");
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Sound toggle effect
  useEffect(() => {
    audioRef.current.setEnabled(gameState.soundEnabled);
  }, [gameState.soundEnabled]);
  
  // ==========================================
  // GAME ACTIONS
  // ==========================================
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      mouseRef.current.isDown = true;
      
      if (selectedTool === "obstacle") {
        const newObs: Obstacle = {
          id: Math.random(),
          x: mouseRef.current.x - 25,
          y: mouseRef.current.y - 25,
          width: 50,
          height: 50,
          type: "wall",
          color: COLORS.obstacles.wall,
          rotation: 0,
          rotationSpeed: 0,
          active: true
        };
        obstaclesRef.current.push(newObs);
        showNotification("Obstacle placed", "info");
      } else if (selectedTool !== "delete") {
        const ball = createBall(
          mouseRef.current.x,
          mouseRef.current.y,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          selectedTool as BallType
        );
        ballsRef.current.push(ball);
        setStats(s => ({ ...s, ballsSpawned: s.ballsSpawned + 1 }));
        createExplosion(mouseRef.current.x, mouseRef.current.y, ball.color, 5, 0.3);
        audioRef.current.playSpawn();
      }
    } else if (e.button === 2) {
      mouseRef.current.rightDown = true;
      // Delete mode
      if (selectedTool === "delete") {
        obstaclesRef.current = obstaclesRef.current.filter(obs => {
          const dx = mouseRef.current.x - (obs.x + obs.width/2);
          const dy = mouseRef.current.y - (obs.y + obs.height/2);
          return Math.sqrt(dx*dx + dy*dy) > 50;
        });
      }
    }
  };
  
  const resetGame = () => {
    ballsRef.current = [];
    particlesRef.current = [];
    obstaclesRef.current = [];
    targetsRef.current = [];
    powerUpsRef.current = [];
    setStats({
      score: 0,
      ballsSpawned: 0,
      ballsLost: 0,
      targetsHit: 0,
      combo: 0,
      maxCombo: 0,
      playTime: 0
    });
    
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 5; i++) {
        ballsRef.current.push(createBall(canvas.width / 2, canvas.height / 3));
      }
    }
    showNotification("Game Reset", "info");
  };
  
  const changeMode = (mode: GameMode) => {
    setGameState(s => ({ ...s, mode }));
    resetGame();
    
    if (mode === "targets") {
      // Spawn initial targets
      const canvas = canvasRef.current;
      if (canvas) {
        for (let i = 0; i < 5; i++) {
          targetsRef.current.push(createTarget(canvas.width, canvas.height));
        }
      }
    }
  };
  
  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden font-mono select-none">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold shadow-2xl border",
              notification.type === "success" && "bg-green-500/20 border-green-500 text-green-400",
              notification.type === "warning" && "bg-yellow-500/20 border-yellow-500 text-yellow-400",
              notification.type === "info" && "bg-blue-500/20 border-blue-500 text-blue-400"
            )}
          >
            {notification.text}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Atom className="h-6 w-6 text-cyan-400 animate-pulse" />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  NEON PHYSICS ARENA
                </h1>
                <p className="text-[10px] text-zinc-400 hidden sm:block">
                  Mode: <span className="text-cyan-400 uppercase">{gameState.mode}</span> | 
                  Level: <span className="text-purple-400">{gameState.level}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGameState(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
              className={cn(!gameState.soundEnabled && "text-zinc-600")}
            >
              {gameState.soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGameState(s => ({ ...s, showMenu: !s.showMenu }))}
              className={cn(gameState.showMenu && "bg-zinc-800")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-zinc-400">SCORE:</span>
            <span className="text-white font-bold text-lg">{stats.score.toLocaleString()}</span>
          </div>
          {stats.combo > 1 && (
            <div className="flex items-center gap-2 animate-pulse">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-orange-400 font-bold">x{stats.combo} COMBO!</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-400">BALLS:</span>
            <span className="text-white">{ballsRef.current.length}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-zinc-500">
          <span>SPACE: Pause</span>
          <span>R: Reset</span>
          <span>M: Menu</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-2 z-30">
          {([
            { id: "normal", icon: Circle, color: "text-blue-400", label: "Normal" },
            { id: "heavy", icon: Circle, color: "text-slate-400", label: "Heavy" },
            { id: "bouncy", icon: Circle, color: "text-pink-400", label: "Bouncy" },
            { id: "explosive", icon: Bomb, color: "text-red-400", label: "Bomb" },
            { id: "obstacle", icon: Square, color: "text-zinc-400", label: "Wall" },
            { id: "delete", icon: Target, color: "text-red-600", label: "Delete" }
          ] as const).map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border-2",
                selectedTool === tool.id
                  ? "bg-zinc-800 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  : "bg-zinc-900 border-zinc-700 hover:border-zinc-500"
              )}
              title={`${tool.label} (${tool.id === "normal" ? "1" : tool.id === "heavy" ? "2" : tool.id === "bouncy" ? "3" : tool.id === "explosive" ? "4" : ""})`}
            >
              <tool.icon className={cn("w-6 h-6", tool.color)} strokeWidth={tool.id === "obstacle" ? 2 : selectedTool === tool.id ? 3 : 2} />
            </button>
          ))}
          
          <div className="flex-1" />
          
          <div className="px-2 w-full">
            <div className="text-[9px] text-zinc-500 text-center mb-1">GRAVITY</div>
            <Slider
              value={[gameState.gravity]}
              onValueChange={([v]) => setGameState(s => ({ ...s, gravity: v }))}
              min={-2}
              max={2}
              step={0.1}
              className="h-24"
              orientation="vertical"
            />
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 relative bg-black overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={() => { mouseRef.current.isDown = false; mouseRef.current.rightDown = false; }}
            onMouseLeave={() => { mouseRef.current.isDown = false; mouseRef.current.rightDown = false; }}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full cursor-crosshair block"
          />
          
          {/* Overlay UI */}
          <div className="absolute top-4 left-4 pointer-events-none space-y-2">
            <div className="bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-zinc-800 text-xs space-y-2 text-white min-w-[200px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Mode</span>
                <span className="text-cyan-400 capitalize">{gameState.mode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Balls Active</span>
                <span className="text-white">{ballsRef.current.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Max Combo</span>
                <span className="text-orange-400">{stats.maxCombo}x</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Time</span>
                <span className="text-white">{Math.floor(stats.playTime / 1000)}s</span>
              </div>
              
              <div className="pt-2 border-t border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MousePointer2 className="w-3 h-3" />
                  <span>Click to spawn</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Wind className="w-3 h-3" />
                  <span>Hold to attract</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Bomb className="w-3 h-3" />
                  <span>Right-click to delete</span>
                </div>
              </div>
            </div>
            
            {slowMotionRef.current < 1 && (
              <div className="bg-blue-500/20 border border-blue-500 text-blue-400 px-3 py-2 rounded-lg text-xs font-bold animate-pulse">
                SLOW MOTION ACTIVE
              </div>
            )}
          </div>
          
          {/* Pause Overlay */}
          {gameState.isPaused && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">PAUSED</h2>
                <Button onClick={() => setGameState(s => ({ ...s, isPaused: false }))}>
                  <Play className="w-4 h-4 mr-2" /> RESUME
                </Button>
              </div>
            </div>
          )}
          
          {/* Menu Overlay */}
          <AnimatePresence>
            {gameState.showMenu && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
              >
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-cyan-400" />
                    Game Settings
                  </h2>
                  
                  {/* Game Mode Selection */}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4">Game Mode</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { id: "sandbox", name: "Sandbox", desc: "Free play, build and experiment", icon: Layers },
                        { id: "targets", name: "Target Practice", desc: "Hit targets for points", icon: Target },
                        { id: "survival", name: "Survival", desc: "Don't lose too many balls", icon: Timer },
                        { id: "zen", name: "Zen Mode", desc: "Relaxing, no score", icon: Sparkles }
                      ] as const).map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => changeMode(mode.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all",
                            gameState.mode === mode.id
                              ? "border-cyan-400 bg-cyan-400/10"
                              : "border-zinc-700 hover:border-zinc-500"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <mode.icon className={cn("w-5 h-5", gameState.mode === mode.id ? "text-cyan-400" : "text-zinc-400")} />
                            <span className={cn("font-bold", gameState.mode === mode.id ? "text-white" : "text-zinc-300")}>
                              {mode.name}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">{mode.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Settings */}
                  <div className="space-y-6 mb-8">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4">Options</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Sound Effects</div>
                        <div className="text-xs text-zinc-500">Audio feedback for collisions</div>
                      </div>
                      <Switch
                        checked={gameState.soundEnabled}
                        onCheckedChange={(v) => setGameState(s => ({ ...s, soundEnabled: v }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Particle Effects</div>
                        <div className="text-xs text-zinc-500">Explosions and trails</div>
                      </div>
                      <Switch
                        checked={gameState.particlesEnabled}
                        onCheckedChange={(v) => setGameState(s => ({ ...s, particlesEnabled: v }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Ball Trails</div>
                        <div className="text-xs text-zinc-500">Show movement trails</div>
                      </div>
                      <Switch
                        checked={gameState.trailsEnabled}
                        onCheckedChange={(v) => setGameState(s => ({ ...s, trailsEnabled: v }))}
                      />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={resetGame} className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" /> Reset Game
                    </Button>
                    <Button onClick={() => setGameState(s => ({ ...s, showMenu: false }))} className="flex-1 bg-cyan-600 hover:bg-cyan-500">
                      <ChevronRight className="w-4 h-4 mr-2" /> Resume
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
