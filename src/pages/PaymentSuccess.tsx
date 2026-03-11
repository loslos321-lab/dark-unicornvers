import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold font-mono text-foreground">
          Payment Successful
        </h1>
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">
          Thank you for your purchase! Premium tools are now unlocked.
        </p>
        <Button asChild variant="outline" className="font-mono">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tools
          </Link>
        </Button>
      </div>
    </div>
  );
}
