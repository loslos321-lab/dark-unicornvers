import { useState, useRef } from "react";
import VectorFieldCanvas, { defaultSettings, type VectorFieldSettings } from "@/components/VectorFieldCanvas";
import ControlPanel from "@/components/ControlPanel";
import CryptoPanel from "@/components/CryptoPanel";
import PublicChat from "@/components/PublicChat";
import HowToUse from "@/components/HowToUse";
import HostedRooms from "@/components/HostedRooms";
import SecretLinks from "@/components/SecretLinks";
// Tools Imports
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import FileVault from "@/components/tools/FileVault";
import SecureNotes from "@/components/tools/SecureNotes";
import QrCrypto from "@/components/tools/QrCrypto";
import EntropyChecker from "@/components/tools/EntropyChecker";
import { Shield, Lock, Sliders, Globe, Info, Menu, DoorOpen, Link2, Wrench, Key, FileLock, FileText, QrCode, Gauge } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

// ALLE Tabs inklusive der 5 neuen Tools
type PanelTab = "crypto" | "field" | "public" | "rooms" | "links" | "help" | "password-generator" | "file-vault" | "secure-notes" | "qr-crypto" | "entropy";

const tabs: { key: PanelTab; label: string; icon: React.ElementType }[] = [
  { key: "crypto", label: "CRYPTO", icon: Lock },
  { key: "rooms", label: "ROOMS", icon: DoorOpen },
  { key: "links", label: "LINKS", icon: Link2 },
  { key: "public", label: "PUBLIC", icon: Globe },
  { key: "field", label: "FIELD", icon: Sliders },
  { key: "help", label: "GUIDE", icon: Info },
  // Neue Tool-Tabs
  { key: "password-generator", label: "PASSWD", icon: Key },
  { key: "file-vault", label: "FILES", icon: FileLock },
  { key: "secure-notes", label: "NOTES", icon: FileText },
  { key: "qr-crypto", label: "QR", icon: QrCode },
  { key: "entropy", label: "ENTROPY", icon: Gauge },
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
  return (
    <div className="h-full relative">
      {/* Original Panels */}
      <div className={`h-full ${active === "crypto" ? "" : "hidden"}`}>
        <CryptoPanel canvasRef={canvasRef} />
      </div>
      <div className={`h-full ${active === "public" ? "" : "hidden"}`}>
        <PublicChat />
      </div>
      <div className={`h-full ${active === "rooms" ? "" : "hidden"}`}>
        <HostedRooms />
      </div>
      <div className={`h-full ${active === "links" ? "" : "hidden"}`}>
        <SecretLinks />
      </div>
      <div className={`h-full ${active === "field" ? "" : "hidden"}`}>
        <ControlPanel settings={settings} onChange={setSettings} />
      </div>
      <div className={`h-full ${active === "help" ? "" : "hidden"}`}>
        <HowToUse />
      </div>
      
      {/* Neue Tool Panels */}
      <div
