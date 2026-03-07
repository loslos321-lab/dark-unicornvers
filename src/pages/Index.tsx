import { useState, useRef } from "react";
import VectorFieldCanvas, { defaultSettings, type VectorFieldSettings } from "@/components/VectorFieldCanvas";
import ControlPanel from "@/components/ControlPanel";
import CryptoPanel from "@/components/CryptoPanel";
import { Shield } from "lucide-react";

export default function Index() {
  const [settings, setSettings] = useState<VectorFieldSettings>(defaultSettings);
  const [activePanel, setActivePanel] = useState<"controls" | "crypto">("crypto");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Canvas area */}
      <div className="flex-1 relative">
        <VectorFieldCanvas settings={settings} ref={canvasRef} />

        {/* Title overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground font-mono text-glow">
              VECTOR CRYPTO
            </h1>
          </div>
        </div>
      </div>

      {/* Side panels */}
      <div className="w-80 flex flex-col h-full">
        {/* Panel switcher */}
        <div className="flex border-b border-border bg-card">
          <button
            onClick={() => setActivePanel("crypto")}
            className={`flex-1 py-2.5 text-xs font-mono transition-colors ${
              activePanel === "crypto"
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            CRYPTO
          </button>
          <button
            onClick={() => setActivePanel("controls")}
            className={`flex-1 py-2.5 text-xs font-mono transition-colors ${
              activePanel === "controls"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            FIELD
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activePanel === "crypto" ? (
            <CryptoPanel canvasRef={canvasRef} />
          ) : (
            <ControlPanel settings={settings} onChange={setSettings} />
          )}
        </div>
      </div>
    </div>
  );
}
