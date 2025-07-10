import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { IntelligentClaimsQueue } from '@/components/claims/IntelligentClaimsQueue';

interface Claim {
  id: string;
  policyNumber: string;
  insuredName: string;
  incidentDate: string;
  claimType: string;
  estimatedAmount: number;
  status: 'processing' | 'completed' | 'pending' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  channel: 'email' | 'whatsapp' | 'manual';
  createdAt: string;
}

const ClaimsDashboard = () => {
  const navigate = useNavigate();

  const handleClaimSelect = (claimId: string) => {
    navigate(`/claims/${claimId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold">Fila Inteligente de Sinistros</h1>
                <p className="text-sm text-muted-foreground">
                  Dashboard otimizado para Analistas de Sinistros
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/claims-metrics')} variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Métricas
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <IntelligentClaimsQueue onClaimSelect={handleClaimSelect} />
      </main>
    </div>
  );
};

export default ClaimsDashboard;