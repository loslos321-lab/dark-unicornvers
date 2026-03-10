import { Link } from "react-router-dom";
import { ArrowLeft, Wrench, Shield, Terminal, Key, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const Tools = () => {
  const tools = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Password Generator",
      description: "Generate secure, random passwords with custom length and complexity.",
      status: "coming-soon",
      color: "text-blue-500"
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "Key Derivation",
      description: "Derive encryption keys from passwords using PBKDF2 or Argon2.",
      status: "coming-soon",
      color: "text-green-500"
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "Text Encoder/Decoder",
      description: "Base64, Hex, URL encoding and decoding utilities.",
      status: "coming-soon",
      color: "text-purple-500"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Hash Generator",
      description: "Generate SHA-256, SHA-512 and other cryptographic hashes.",
      status: "coming-soon",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Wrench className="h-8 w-8 text-primary" />
              Crypto Tools
            </h1>
            <p className="text-muted-foreground mt-2">
              Collection of security and encryption utilities
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className={`${tool.color} mb-2 group-hover:scale-110 transition-transform`}>
                {tool.icon}
              </div>
              <CardTitle className="flex items-center justify-between">
                {tool.title}
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  {tool.status}
                </span>
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" disabled={tool.status === "coming-soon"}>
                {tool.status === "coming-soon" ? "Coming Soon" : "Open Tool"}
              </Button>
            </CardContent>
          </Card>
        ))}
        
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]">
          <CardContent className="text-center">
            <div className="text-4xl mb-2 text-muted-foreground">+</div>
            <p className="text-muted-foreground font-medium">Request New Tool</p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto mt-12 p-6 bg-muted rounded-lg border border-border">
        <h3 className="font-semibold mb-2">About These Tools</h3>
        <p className="text-sm text-muted-foreground">
          All tools run client-side in your browser. No data is sent to any server.
        </p>
      </div>
    </div>
  );
};

export default Tools;
