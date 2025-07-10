import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { ExecutiveSummary } from '@/components/claims/ExecutiveSummary';
import { FraudDetectionPanel } from '@/components/claims/FraudDetectionPanel';
import { InteractiveAnalysisChat } from '@/components/claims/InteractiveAnalysisChat';
import { DecisionReviewPanel } from '@/components/claims/DecisionReviewPanel';

const ClaimDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('summary');

  const claim = {
    id: id || '1',
    policyNumber: 'AUTO-123456',
    insuredName: 'João Silva',
    incidentDate: '2024-01-10',
    claimType: 'Colisão',
    estimatedAmount: 15750,
    status: 'processing',
    priority: 'high',
    channel: 'email'
  };

  const mockRecommendation = {
    decision: 'APPROVE' as const,
    confidence: 0.87,
    reasoning: ['Documentação completa', 'Valores consistentes'],
    estimatedValue: 15750,
    riskScore: 0.23,
    autoExecutable: true,
    requiredActions: [],
    escalationLevel: 'none' as const
  };

  const handleCitationClick = (citation: any) => {
    console.log('Citation clicked:', citation);
  };

  const handleDataValidation = (field: string, isValid: boolean) => {
    console.log('Data validation:', field, isValid);
  };

  const handleFraudInvestigate = (indicatorId: string) => {
    console.log('Investigate fraud:', indicatorId);
  };

  const handleActionRequested = (action: string, details: any) => {
    console.log('Action requested:', action, details);
  };

  const handleDecisionConfirm = (decision: string, comments: string, escalate?: string) => {
    console.log('Decision confirmed:', decision, comments, escalate);
  };

  const handleRequestMoreInfo = (infoType: string, details: string) => {
    console.log('More info requested:', infoType, details);
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
                onClick={() => navigate('/claims')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Fila
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold">Análise de Sinistro {claim.policyNumber}</h1>
                <p className="text-sm text-muted-foreground">
                  {claim.insuredName} • {claim.claimType}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">{claim.status}</Badge>
              <Badge variant="outline">{claim.priority}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Resumo Executivo</TabsTrigger>
            <TabsTrigger value="fraud">Detecção de Fraude</TabsTrigger>
            <TabsTrigger value="chat">Live View IA</TabsTrigger>
            <TabsTrigger value="decision">Decisão</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <ExecutiveSummary
              claimId={claim.id}
              extractedData={[]}
              onCitationClick={handleCitationClick}
              onDataValidation={handleDataValidation}
            />
          </TabsContent>

          <TabsContent value="fraud">
            <FraudDetectionPanel
              claimId={claim.id}
              onInvestigate={handleFraudInvestigate}
              onMarkReviewed={(id) => console.log('Mark reviewed:', id)}
            />
          </TabsContent>

          <TabsContent value="chat">
            <InteractiveAnalysisChat
              claimId={claim.id}
              onActionRequested={handleActionRequested}
              onCitationClick={handleCitationClick}
            />
          </TabsContent>

          <TabsContent value="decision">
            <DecisionReviewPanel
              claimId={claim.id}
              recommendation={mockRecommendation}
              onDecisionConfirm={handleDecisionConfirm}
              onRequestMoreInfo={handleRequestMoreInfo}
            />
          </TabsContent>

          <TabsContent value="documents">
            <div className="text-center py-12">
              <p>Visualizador de documentos será implementado aqui</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClaimDetail;