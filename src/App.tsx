
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import Index from './pages/Index';
import Upload from './pages/Upload';
import AIAgents from './pages/AIAgents';
import ClaimsDashboard from './pages/ClaimsDashboard';
import AgentSystem from './pages/AgentSystem';

function App() {
  console.log('App: Rendering started');
  
  try {
    console.log('App: Creating component tree');
    return (
      <ErrorBoundary>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/ai-agents" element={<AIAgents />} />
              <Route path="/claims" element={<ClaimsDashboard />} />
              <Route path="/agent-system" element={<AgentSystem />} />
            </Routes>
          </Layout>
        </Router>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App: Critical error during render', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Erro na Aplicação</h1>
          <p className="text-muted-foreground mb-4">Falha ao inicializar</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}

export default App;
