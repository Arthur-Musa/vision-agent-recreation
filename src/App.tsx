import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ClaimsDashboard from "./pages/ClaimsDashboard";
import ClaimDetail from "./pages/ClaimDetail";
import RenewalAssistant from "./pages/RenewalAssistant";
import RenewalPreview from "./pages/RenewalPreview";
import UnderwritingForm from "./pages/UnderwritingForm";
import FraudDashboard from "./pages/FraudDashboard";
import SmartSpreadsheet from "./pages/SmartSpreadsheet";
import ManusLiveView from "./pages/ManusLiveView";
import ConnectorsConfig from "./pages/ConnectorsConfig";
import SettingsPage from "./pages/SettingsPage";
import AutomatedClaimsProcessing from "./pages/AutomatedClaimsProcessing";
import ClaimsMetricsDashboard from "./pages/ClaimsMetricsDashboard";
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
          <Route path="/claims" element={<ClaimsDashboard />} />
          <Route path="/claims/:id" element={<ClaimDetail />} />
          <Route path="/claims-processing" element={<AutomatedClaimsProcessing />} />
          <Route path="/claims-metrics" element={<ClaimsMetricsDashboard />} />
          <Route path="/renewal" element={<RenewalAssistant />} />
          <Route path="/renewal/preview" element={<RenewalPreview />} />
          <Route path="/underwriting" element={<UnderwritingForm />} />
          <Route path="/fraud" element={<FraudDashboard />} />
          <Route path="/spreadsheets" element={<SmartSpreadsheet />} />
          <Route path="/live" element={<ManusLiveView />} />
          <Route path="/connectors" element={<ConnectorsConfig />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
