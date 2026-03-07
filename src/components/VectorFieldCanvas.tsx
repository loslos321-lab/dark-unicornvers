import { useRef, useEffect, useCallback } from "react";

export interface VectorFieldSettings {
  bgTop: string;
  bgBottom: string;
  nodeColor: string;
  accentColor: string;
  gridDensity: number;
  nodeSize: number;
  speed: number;
  pulseSpeed: number;
  pulseStrength: number;
  glow: number;
  nodeMovement: number;
  rotation: number;
  distortion: number;
}

export const defaultSettings: VectorFieldSettings = {
  bgTop: "#050a0e",
  bgBottom: "#0a1a10",
  nodeColor: "#00cc66",
  accentColor: "#ff0044",
  gridDensity: 12,
  nodeSize: 0.35,
  speed: 1,
  pulseSpeed: 8,
  pulseStrength: 0.8,
  glow: 15,
  nodeMovement: 0,
  rotation: 0,
  distortion: 0,
};

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 204, b: 102 };
}

function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface Props {
  settings: VectorFieldSettings;
  className?: string;
}

const VectorFieldCanvas = React.forwardRef<HTMLCanvasElement, Props>(({ settings, className }, ref) => {
  const innerRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || innerRef;
  const timeRef = useRef(0);
  const animRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, settings.bgTop);
    grad.addColorStop(1, settings.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Grid
    const cols = settings.gridDensity;
    const rows = Math.floor(cols * (height / width));
    const cw = width / cols;
    const ch = height / rows;

    ctx.strokeStyle = hexToRgba(settings.nodeColor, 0.12);
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, height); ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * ch); ctx.lineTo(width, i * ch); ctx.stroke();
    }

    // Nodes
    const baseR = Math.min(cw, ch) * settings.nodeSize;
    const t = timeRef.current;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let cx = col * cw + cw / 2;
        let cy = row * ch + ch / 2;

        const pulse = 1 + Math.sin((row + col) * 0.3 + t * settings.pulseSpeed * 10) * settings.pulseStrength * 0.3;
        const r = baseR * pulse;

        if (settings.nodeMovement > 0) {
          cx += Math.sin(t * 0.5 + row * 0.5) * settings.nodeMovement;
          cy += Math.cos(t * 0.5 + col * 0.5) * settings.nodeMovement;
        }

        if (settings.distortion > 0) {
          const dx = (cx - width / 2) / width;
          const dy = (cy - height / 2) / height;
          cx += dx * settings.distortion * Math.sin(t + row * 0.2);
          cy += dy * settings.distortion * Math.cos(t + col * 0.2);
        }

        if (settings.rotation > 0) {
          const angle = t * settings.rotation * 0.5;
          const ddx = cx - width / 2;
          const ddy = cy - height / 2;
          cx = width / 2 + ddx * Math.cos(angle) - ddy * Math.sin(angle);
          cy = height / 2 + ddx * Math.sin(angle) + ddy * Math.cos(angle);
        }

        // Glow
        if (settings.glow > 0) {
          const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * (1 + settings.glow * 0.1));
          glowGrad.addColorStop(0, hexToRgba(settings.nodeColor, 0.6));
          glowGrad.addColorStop(0.5, hexToRgba(settings.nodeColor, 0.2));
          glowGrad.addColorStop(1, hexToRgba(settings.nodeColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, r * (1 + settings.glow * 0.1), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = settings.nodeColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        const acc = hexToRgb(settings.accentColor);
        ctx.fillStyle = `rgba(${acc.r},${acc.g},${acc.b},0.4)`;
        ctx.beginPath();
        ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    timeRef.current += 0.016 * settings.speed;
    animRef.current = requestAnimationFrame(draw);
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />;
}

export function getCanvasRef(canvas: HTMLCanvasElement) {
  return canvas;
}
