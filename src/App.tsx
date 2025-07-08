import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import AgentDetail from "./pages/AgentDetail";
import ConversationAnalysis from "./pages/ConversationAnalysis";
import CoverageAnalysis from "./pages/CoverageAnalysis";
import { Chat } from "./pages/Chat";
import NotFound from "./pages/NotFound";
import AIAgents from "./pages/AIAgents";
import LiveWorkflow from "./pages/LiveWorkflow";
import UserJourney from "./pages/UserJourney";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/agent/:id" element={<AgentDetail />} />
          <Route path="/coverage-analysis" element={<CoverageAnalysis />} />
          <Route path="/conversation/:agentId" element={<ConversationAnalysis />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/live-workflow" element={<LiveWorkflow />} />
          <Route path="/user-journey" element={<UserJourney />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
