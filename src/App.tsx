import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { TenantProvider } from './contexts/TenantContext';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';

// Essential Pages Only
import Index from './pages/Index';
import ClaimsDashboard from './pages/ClaimsDashboard';
import SmartSpreadsheet from './pages/SmartSpreadsheet';
import NotFound from './pages/NotFound';

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Index />} />
              
              {/* Dashboard de Sinistros */}
              <Route path="/dashboard" element={<ClaimsDashboard />} />
              
              {/* Spreadsheet de Sinistros */}
              <Route path="/spreadsheet" element={<SmartSpreadsheet />} />
              
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
