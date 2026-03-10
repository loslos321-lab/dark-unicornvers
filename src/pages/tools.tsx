import { Wrench, Shield, Terminal, Key, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Tools = () => {
  const tools = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Password Generator",
      description: "Generate secure, random passwords with custom length and complexity.",
      status: "coming-soon",
      color: "text-blue-500"
    },
    {
      icon: <Key className="h-5 w-5" />,
      title: "Key Derivation",
      description: "Derive encryption keys from passwords using PBKDF2.",
      status: "coming-soon",
      color: "text-green-500"
    },
    {
      icon: <Terminal className="h-5 w-5" />,
      title: "Text Encoder",
      description: "Base64, Hex, URL encoding and decoding utilities.",
      status: "coming-soon",
      color: "text-purple-500"
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Hash Generator",
      description: "Generate SHA-256, SHA-512 and other cryptographic hashes.",
      status: "coming-soon",
      color: "text-orange-500"
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Entropy Checker",
      description: "Analyze password strength and calculate entropy bits.",
      status: "coming-soon",
      color: "text-pink-500"
    }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-bold font-mono">CRYPTO TOOLS</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Collection of security utilities
        </p>
      </div>

      {/* Tools Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-1 gap-3">
          {tools.map((tool, index) => (
            <Card key={index} className="hover:border-primary/50 transition-colors group">
              <CardHeader className="p-3 pb-0">
                <div className="flex items-start justify-between">
                  <div className={`${tool.color} mb-2 group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                    {tool.status === "coming-soon" ? "SOON" : "READY"}
                  </span>
                </div>
                <CardTitle className="text-sm font-mono">{tool.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="w-full text-xs font-mono" 
                  disabled={tool.status === "coming-soon"}
                >
                  {tool.status === "coming-soon" ? "COMING SOON" : "OPEN TOOL"}
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {/* Request Tool Card */}
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[100px] bg-muted/50">
            <CardContent className="text-center p-4">
              <div className="text-2xl mb-1 text-muted-foreground">+</div>
              <p className="text-xs text-muted-foreground font-mono">REQUEST TOOL</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Footer */}
        <div className="mt-4 p-3 bg-muted rounded border border-border text-xs text-muted-foreground">
          <p className="font-mono text-[10px] mb-1">SECURITY NOTE:</p>
          <p className="text-[10px] leading-relaxed">
            All tools run client-side. No data leaves your browser. 
            Check Network tab to verify.
          </p>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Tools;
