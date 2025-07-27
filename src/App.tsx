import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import ClaimsDashboard from './pages/ClaimsDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/claims" element={<ClaimsDashboard />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
