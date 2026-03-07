import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { VectorFieldSettings } from "./VectorFieldCanvas";

interface Props {
  settings: VectorFieldSettings;
  onChange: (s: VectorFieldSettings) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <span className="text-xs font-medium text-foreground">{title}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="px-4 py-3 flex flex-col gap-3">{children}</div>}
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <input type="range" className="flex-1" min={min} max={max} step={step}
          value={value} onChange={e => onChange(parseFloat(e.target.value))} />
        <span className="text-xs font-mono text-muted-foreground w-10 text-right">
          {Number.isInteger(step) ? value : value.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-8 h-6 rounded border-0 cursor-pointer" />
        <span className="text-xs font-mono text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

export default function ControlPanel({ settings, onChange }: Props) {
  const set = <K extends keyof VectorFieldSettings>(key: K, val: VectorFieldSettings[K]) =>
    onChange({ ...settings, [key]: val });

  return (
    <div className="h-full overflow-y-auto bg-card border-l border-border">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-primary text-glow font-mono">FIELD CONTROLS</h2>
      </div>
      <Section title="Colors">
        <ColorRow label="BG Top" value={settings.bgTop} onChange={v => set("bgTop", v)} />
        <ColorRow label="BG Bottom" value={settings.bgBottom} onChange={v => set("bgBottom", v)} />
        <ColorRow label="Nodes" value={settings.nodeColor} onChange={v => set("nodeColor", v)} />
        <ColorRow label="Accent" value={settings.accentColor} onChange={v => set("accentColor", v)} />
      </Section>
      <Section title="Grid">
        <SliderRow label="Density" value={settings.gridDensity} min={3} max={25} step={1} onChange={v => set("gridDensity", v)} />
        <SliderRow label="Node Size" value={settings.nodeSize} min={0.1} max={0.8} step={0.01} onChange={v => set("nodeSize", v)} />
      </Section>
      <Section title="Animation">
        <SliderRow label="Speed" value={settings.speed} min={0} max={10} step={0.1} onChange={v => set("speed", v)} />
        <SliderRow label="Pulse Speed" value={settings.pulseSpeed} min={0} max={40} step={0.5} onChange={v => set("pulseSpeed", v)} />
        <SliderRow label="Pulse Str." value={settings.pulseStrength} min={0} max={2} step={0.1} onChange={v => set("pulseStrength", v)} />
        <SliderRow label="Glow" value={settings.glow} min={0} max={30} step={1} onChange={v => set("glow", v)} />
      </Section>
      <Section title="Effects">
        <SliderRow label="Movement" value={settings.nodeMovement} min={0} max={50} step={1} onChange={v => set("nodeMovement", v)} />
        <SliderRow label="Rotation" value={settings.rotation} min={0} max={2} step={0.1} onChange={v => set("rotation", v)} />
        <SliderRow label="Distortion" value={settings.distortion} min={0} max={100} step={1} onChange={v => set("distortion", v)} />
      </Section>
    </div>
  );
}
