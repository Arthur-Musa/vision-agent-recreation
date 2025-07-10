import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import UserJourney from "./pages/UserJourney";
import ClaimsDashboard from "./pages/ClaimsDashboard";
import ClaimDetail from "./pages/ClaimDetail";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import LiveWorkflow from "./pages/LiveWorkflow";
import ManusLiveView from "./pages/ManusLiveView";
import RenewalAssistant from "./pages/RenewalAssistant";
import RenewalPreview from "./pages/RenewalPreview";
import UnderwritingForm from "./pages/UnderwritingForm";
import FraudDashboard from "./pages/FraudDashboard";
import SmartSpreadsheet from "./pages/SmartSpreadsheet";
import ConnectorsConfig from "./pages/ConnectorsConfig";
import SettingsPage from "./pages/SettingsPage";
import AutomatedClaimsProcessing from "./pages/AutomatedClaimsProcessing";
import ClaimsMetricsDashboard from "./pages/ClaimsMetricsDashboard";
import ConversationAnalysis from "./pages/ConversationAnalysis";
import CoverageAnalysis from "./pages/CoverageAnalysis";
import AIAgents from "./pages/AIAgents";
import AgentDetail from "./pages/AgentDetail";
import ConversationClaimsProcessor from "./pages/ConversationClaimsProcessor";
import UnderwritingIntake from "./pages/UnderwritingIntake";
import Integrations from "./pages/Integrations";
import ApeBagAnalyst from "./pages/ApeBagAnalyst";
import NotFound from "./pages/NotFound";

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
          <Route path="/journey" element={<UserJourney />} />
          <Route path="/claims" element={<ClaimsDashboard />} />
          <Route path="/claims/:id" element={<ClaimDetail />} />
          <Route path="/claims-processing" element={<AutomatedClaimsProcessing />} />
          <Route path="/claims-metrics" element={<ClaimsMetricsDashboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/live" element={<LiveWorkflow />} />
          <Route path="/manus-live" element={<ManusLiveView />} />
          <Route path="/conversation-analysis" element={<ConversationAnalysis />} />
          <Route path="/coverage-analysis" element={<CoverageAnalysis />} />
          <Route path="/renewal" element={<RenewalAssistant />} />
          <Route path="/renewal/preview" element={<RenewalPreview />} />
          <Route path="/underwriting" element={<UnderwritingForm />} />
          <Route path="/fraud" element={<FraudDashboard />} />
          <Route path="/spreadsheets" element={<SmartSpreadsheet />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/agent/:id" element={<AgentDetail />} />
          <Route path="/conversation/claims-processor" element={<ConversationClaimsProcessor />} />
          <Route path="/underwriting/intake" element={<UnderwritingIntake />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/ape-bag-analyst" element={<ApeBagAnalyst />} />
          <Route path="/connectors" element={<ConnectorsConfig />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
