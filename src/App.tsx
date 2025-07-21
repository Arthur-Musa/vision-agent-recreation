import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultsPage from './pages/ResultsPage';
import AIAgents from './pages/AIAgents';
import ClaimsDashboard from './pages/ClaimsDashboard';
import VisionAnalysisPage from './pages/VisionAnalysisPage';
import EvoAI from '@/pages/EvoAI';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/processing" element={<ProcessingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/ai-agents" element={<AIAgents />} />
        <Route path="/claims" element={<ClaimsDashboard />} />
        <Route path="/vision" element={<VisionAnalysisPage />} />
        <Route path="/evoai" element={<EvoAI />} />
      </Routes>
    </Router>
  );
}

export default App;
