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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SecurityErrorBoundary>
);

export default App;
