import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { TenantProvider } from './contexts/TenantContext';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';

// Pages
import Index from './pages/Index';
import ClaimsDashboard from './pages/ClaimsDashboard';
import ClaimsMetricsDashboard from './pages/ClaimsMetricsDashboard';
import AutomatedClaimsProcessing from './pages/AutomatedClaimsProcessing';
import ConversationClaimsProcessor from './pages/ConversationClaimsProcessor';
import FraudDashboard from './pages/FraudDashboard';
import AIAgents from './pages/AIAgents';
import AgentBuilder from './pages/AgentBuilder';
import AgentDetail from './pages/AgentDetail';
import AgentSystem from './pages/AgentSystem';
import ApeBagAnalyst from './pages/ApeBagAnalyst';
import CaseDetail from './pages/CaseDetail';
import Cases from './pages/Cases';
import { Chat } from './pages/Chat';
import ClaimDetail from './pages/ClaimDetail';
import ConnectorsConfig from './pages/ConnectorsConfig';
import ConversationAnalysis from './pages/ConversationAnalysis';
import CoverageAnalysis from './pages/CoverageAnalysis';
import DataPipeline from './pages/DataPipeline';
import Integrations from './pages/Integrations';
import KnowledgeHub from './pages/KnowledgeHub';
import LiveWorkflow from './pages/LiveWorkflow';
import ManusLiveView from './pages/ManusLiveView';
import NotFound from './pages/NotFound';
import OpenAITestCenter from './pages/OpenAITestCenter';
import RenewalAssistant from './pages/RenewalAssistant';
import RenewalPreview from './pages/RenewalPreview';
import SettingsPage from './pages/SettingsPage';
import { SinistrosProcessing } from './pages/SinistrosProcessing';
import SmartSpreadsheet from './pages/SmartSpreadsheet';
import UnderwritingForm from './pages/UnderwritingForm';
import UnderwritingIntake from './pages/UnderwritingIntake';
import Upload from './pages/Upload';
import UserJourney from './pages/UserJourney';

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Index />} />
              
              {/* Claims & Sinistros */}
              <Route path="/claims" element={<ClaimsDashboard />} />
              <Route path="/claims-metrics" element={<ClaimsMetricsDashboard />} />
              <Route path="/automated-claims" element={<AutomatedClaimsProcessing />} />
              <Route path="/conversation-claims" element={<ConversationClaimsProcessor />} />
              <Route path="/fraud-dashboard" element={<FraudDashboard />} />
              <Route path="/claim/:id" element={<ClaimDetail />} />
              <Route path="/sinistros" element={<SinistrosProcessing />} />
              
              {/* AI Agents */}
              <Route path="/ai-agents" element={<AIAgents />} />
              <Route path="/agent-builder" element={<AgentBuilder />} />
              <Route path="/agent/:id" element={<AgentDetail />} />
              <Route path="/agent-system" element={<AgentSystem />} />
              <Route path="/ape-bag-analyst" element={<ApeBagAnalyst />} />
              
              {/* Cases & Analysis */}
              <Route path="/cases" element={<Cases />} />
              <Route path="/case/:id" element={<CaseDetail />} />
              <Route path="/conversation-analysis/:agentId" element={<ConversationAnalysis />} />
              <Route path="/coverage-analysis" element={<CoverageAnalysis />} />
              
              {/* Chat & Communication */}
              <Route path="/chat" element={<Chat />} />
              
              {/* Workflows & Automation */}
              <Route path="/live-workflow" element={<LiveWorkflow />} />
              <Route path="/data-pipeline" element={<DataPipeline />} />
              <Route path="/smart-spreadsheet" element={<SmartSpreadsheet />} />
              
              {/* Underwriting & Renewals */}
              <Route path="/underwriting-form" element={<UnderwritingForm />} />
              <Route path="/underwriting-intake" element={<UnderwritingIntake />} />
              <Route path="/renewal-assistant" element={<RenewalAssistant />} />
              <Route path="/renewal-preview" element={<RenewalPreview />} />
              
              {/* Tools & Utilities */}
              <Route path="/upload" element={<Upload />} />
              <Route path="/openai-test" element={<OpenAITestCenter />} />
              <Route path="/manus-live" element={<ManusLiveView />} />
              <Route path="/user-journey" element={<UserJourney />} />
              
              {/* Configuration */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/connectors" element={<ConnectorsConfig />} />
              <Route path="/knowledge-hub" element={<KnowledgeHub />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;
