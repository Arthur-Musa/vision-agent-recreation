import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Upload from './pages/Upload';
import AIAgents from './pages/AIAgents';
import ClaimsDashboard from './pages/ClaimsDashboard';
import EvoAI from '@/pages/EvoAI';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/ai-agents" element={<AIAgents />} />
        <Route path="/claims" element={<ClaimsDashboard />} />
        <Route path="/evoai" element={<EvoAI />} />
      </Routes>
    </Router>
  );
}

export default App;
