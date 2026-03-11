import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home, Menu, Search, Split, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ToolLayoutProps {
  children: ReactNode;
  title: string;
  icon?: React.ElementType;
  description?: string;
}

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/tools/password-generator", label: "Password Gen" },
  { path: "/tools/file-vault", label: "File Vault" },
  { path: "/tools/secure-notes", label: "Secure Notes" },
  { path: "/tools/qr-crypto", label: "QR Crypto" },
  { path: "/tools/entropy", label: "Entropy" },
  { path: "/tools/breach-checker", label: "Breach Check" },  // ← NEU
  { path: "/tools/secret-sharing", label: "Secret Share" },  // ← NEU
  { path: "/tools/secure-clipboard", label: "Clipboard" },   // ← NEU
  { path: "/tools/phishing-detective", label: "Phishing Game" },
  { path: "/tools/crypto-speedrun", label: "Speedrun" },
  { path: "/tools/social-engineering-quiz", label: "SE Quiz" },
  { path: "/tools/physics-sandbox", label: "Physics Sandbox" },
];

export default function ToolLayout({ children, title, icon: Icon, description }: ToolLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
              <div>
                <h1 className="text-sm font-bold font-mono">{title}</h1>
                {description && (
                  <p className="text-[10px] text-muted-foreground font-mono hidden sm:block">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 font-mono text-xs" onClick={() => navigate("/")}>
              <Home className="h-3 w-3" />
              Main Menu
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle className="font-mono text-sm">Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={location.pathname === item.path ? "default" : "ghost"}
                      className="justify-start font-mono text-xs"
                      onClick={() => navigate(item.path)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto text-xs font-mono text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-primary">Home</button>
          <span>/</span>
          <span className="text-primary">{title}</span>
          <span className="hidden sm:block">Vector Crypto Toolkit</span>
        </div>
      </footer>
    </div>
  );
}
