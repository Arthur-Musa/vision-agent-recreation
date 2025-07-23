import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Index from './pages/Index';
import Upload from './pages/Upload';
import AIAgents from './pages/AIAgents';
import ClaimsDashboard from './pages/ClaimsDashboard';
import AgentSystem from './pages/AgentSystem';
import AgentBuilder from './pages/AgentBuilder';
import Cases from './pages/Cases';
import SmartSpreadsheet from './pages/SmartSpreadsheet';
import LiveWorkflow from './pages/LiveWorkflow';
import ManusLiveView from './pages/ManusLiveView';
import OpenAITestCenter from './pages/OpenAITestCenter';
import NotFound from './pages/NotFound';
import KnowledgeHub from './pages/KnowledgeHub';
import SettingsPage from './pages/SettingsPage';
import RenewalAssistant from './pages/RenewalAssistant';

function App() {
  console.log('App component loading...');
  
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/claims" element={<ClaimsDashboard />} />
          <Route path="/agent-system" element={<AgentSystem />} />
          <Route path="/agent-builder" element={<AgentBuilder />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/spreadsheets" element={<SmartSpreadsheet />} />
          <Route path="/live" element={<LiveWorkflow />} />
          <Route path="/live-workflow" element={<LiveWorkflow />} />
          <Route path="/manus-live" element={<ManusLiveView />} />
          <Route path="/manus-live-view" element={<ManusLiveView />} />
          <Route path="/openai-test" element={<OpenAITestCenter />} />
          <Route path="/knowledge" element={<KnowledgeHub />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/renewal" element={<RenewalAssistant />} />
          <Route path="/invite" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
