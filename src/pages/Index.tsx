import { useState, useRef } from "react";
import VectorFieldCanvas, { defaultSettings, type VectorFieldSettings } from "@/components/VectorFieldCanvas";
import ControlPanel from "@/components/ControlPanel";
import CryptoPanel from "@/components/CryptoPanel";
import PublicChat from "@/components/PublicChat";
import HowToUse from "@/components/HowToUse";
import HostedRooms from "@/components/HostedRooms";
import { Shield, Lock, Sliders, Globe, Info, Menu, DoorOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

type PanelTab = "crypto" | "field" | "public" | "rooms" | "help";

const tabs: { key: PanelTab; label: string; icon: React.ElementType }[] = [
  { key: "crypto", label: "CRYPTO", icon: Lock },
  { key: "rooms", label: "ROOMS", icon: DoorOpen },
  { key: "public", label: "PUBLIC", icon: Globe },
  { key: "field", label: "FIELD", icon: Sliders },
  { key: "help", label: "GUIDE", icon: Info },
];

function PanelContent({
  active,
  settings,
  setSettings,
  canvasRef,
}: {
  active: PanelTab;
  settings: VectorFieldSettings;
  setSettings: (s: VectorFieldSettings) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  switch (active) {
    case "crypto":
      return <CryptoPanel canvasRef={canvasRef} />;
    case "public":
      return <PublicChat />;
    case "rooms":
      return <HostedRooms />;
    case "field":
      return <ControlPanel settings={settings} onChange={setSettings} />;
    case "help":
      return <HowToUse />;
  }
}

function TabBar({ active, onChange }: { active: PanelTab; onChange: (t: PanelTab) => void }) {
  return (
    <div className="flex border-b border-border bg-card">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 py-2.5 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 ${
            active === t.key
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <t.icon className="w-3 h-3" />
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Index() {
  const [settings, setSettings] = useState<VectorFieldSettings>(defaultSettings);
  const [activePanel, setActivePanel] = useState<PanelTab>("crypto");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-background">
      {/* Canvas area */}
      <div className="flex-1 relative min-h-0">
        <VectorFieldCanvas settings={settings} ref={canvasRef} />

        {/* Title overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 md:p-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-sm md:text-lg font-bold text-foreground font-mono text-glow">
              VECTOR CRYPTO
            </h1>
          </div>

          {/* Mobile menu button */}
          {isMobile && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button className="pointer-events-auto p-2 rounded bg-card/80 border border-border backdrop-blur-sm">
                  <Menu className="w-5 h-5 text-primary" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[75vh] p-0 rounded-t-xl">
                <SheetTitle className="sr-only">Controls</SheetTitle>
                <TabBar active={activePanel} onChange={(t) => setActivePanel(t)} />
                <div className="flex-1 overflow-y-auto h-[calc(75vh-44px)]">
                  <PanelContent
                    active={activePanel}
                    settings={settings}
                    setSettings={setSettings}
                    canvasRef={canvasRef}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Desktop side panel */}
      {!isMobile && (
        <div className="w-80 flex flex-col h-full">
          <TabBar active={activePanel} onChange={setActivePanel} />
          <div className="flex-1 overflow-hidden">
            <PanelContent
              active={activePanel}
              settings={settings}
              setSettings={setSettings}
              canvasRef={canvasRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}
