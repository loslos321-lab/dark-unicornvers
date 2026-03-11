import { Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToolsHub from "./pages/ToolsHub";
import VectorCrypto from "./pages/VectorCrypto";
import SecretView from "./pages/SecretView";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
// Tool Imports
import PasswordGenerator from "./components/tools/PasswordGenerator";
import FileVault from "./components/tools/FileVault";
import SecureNotes from "./components/tools/SecureNotes";
import QrCrypto from "./components/tools/QrCrypto";
import EntropyChecker from "./components/tools/EntropyChecker";
import BreachChecker from "./components/tools/BreachChecker";
import SecretSharing from "./components/tools/SecretSharing";
import SecureClipboard from "./components/tools/SecureClipboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: 0, staleTime: 0, refetchOnWindowFocus: false, retry: false },
  },
});

class SecurityErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error("Security error:", error); }
  render() {
    if (this.state.hasError) return <div className="p-8 text-center">Security error. Please refresh.</div>;
    return this.props.children;
  }
}

const App = () => (
  <SecurityErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster /><Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ToolsHub />} />
            <Route path="/vector-crypto" element={<VectorCrypto />} />
            <Route path="/secret/:id" element={<SecretView />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* Tool Routes */}
            <Route path="/tools/password-generator" element={<PasswordGenerator />} />
            <Route path="/tools/file-vault" element={<FileVault />} />
            <Route path="/tools/secure-notes" element={<SecureNotes />} />
            <Route path="/tools/qr-crypto" element={<QrCrypto />} />
            <Route path="/tools/entropy" element={<EntropyChecker />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/tools/breach-checker" element={<BreachChecker />} />
            <Route path="/tools/secret-sharing" element={<SecretSharing />} />
            <Route path="/tools/secure-clipboard" element={<SecureClipboard />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SecurityErrorBoundary>
);

export default App;
