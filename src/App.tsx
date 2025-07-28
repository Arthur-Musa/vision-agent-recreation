import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { TenantProvider } from './contexts/TenantContext';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';

// Essential Pages Only
import Index from './pages/Index';
import SmartSpreadsheet from './pages/SmartSpreadsheet';
import { Chat } from './pages/Chat';

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Index />} />
              
              {/* Chat com Agentes */}
              <Route path="/chat" element={<Chat />} />
              
              {/* Spreadsheet de Sinistros */}
              <Route path="/spreadsheet" element={<SmartSpreadsheet />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;
