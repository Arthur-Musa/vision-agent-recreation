import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MessageSquare, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

// This is the "Manus Live View" for individual claims
const ClaimDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);

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

  const steps = [
    {
      id: 1,
      name: 'Recebimento',
      status: 'completed',
      description: 'Documento recebido via email',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Extração OCR',
      status: 'processing',
      description: 'Extraindo dados do documento...',
      timestamp: '2024-01-15T10:32:00Z'
    },
    {
      id: 3,
      name: 'Classificação',
      status: 'pending',
      description: 'Classificar tipo e prioridade',
      timestamp: null
    },
    {
      id: 4,
      name: 'Validação',
      status: 'pending',
      description: 'Verificar dados extraídos',
      timestamp: null
    },
    {
      id: 5,
      name: 'Conclusão',
      status: 'pending',
      description: 'Finalizar processamento',
      timestamp: null
    }
  ];

  const chatMessages = [
    {
      id: 1,
      type: 'system',
      content: 'Iniciando processamento do sinistro AUTO-123456...',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'system',
      content: 'Documento recebido via email - PDF de 2 páginas',
      timestamp: '2024-01-15T10:30:15Z'
    },
    {
      id: 3,
      type: 'system',
      content: 'Iniciando extração OCR...',
      timestamp: '2024-01-15T10:32:00Z'
    },
    {
      id: 4,
      type: 'processing',
      content: 'Extraindo dados: número da apólice, data do sinistro, valor estimado...',
      timestamp: '2024-01-15T10:32:30Z'
    }
  ];

  const handleControlAction = (action: string) => {
    switch (action) {
      case 'retry':
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 2000);
        break;
      case 'skip':
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
        break;
      case 'pause':
        setIsProcessing(false);
        break;
      case 'play':
        setIsProcessing(true);
        break;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-50 border-blue-200';
      case 'processing': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const progress = (currentStep / steps.length) * 100;

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
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold">Sinistro {claim.policyNumber}</h1>
                <p className="text-sm text-muted-foreground">
                  {claim.insuredName} • {claim.claimType}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getStepColor(claim.status)}>
                {claim.status}
              </Badge>
              <Badge variant="outline">
                {claim.priority}
              </Badge>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso do processamento</span>
              <span>{currentStep}/{steps.length} etapas</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Layout - 50/50 Split */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel - Chat */}
        <div className="w-1/2 border-r">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat & Logs
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleControlAction('retry')}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleControlAction('skip')}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleControlAction(isProcessing ? 'pause' : 'play')}
                >
                  {isProcessing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 h-[calc(100%-80px)] overflow-y-auto">
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div 
                  key={message.id}
                  className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{message.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
              
              {isProcessing && (
                <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Processando...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Pipeline Steps */}
        <div className="w-1/2 bg-muted/20">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Pipeline de Processamento</h2>
          </div>
          
          <div className="p-4">
            <Tabs defaultValue="steps" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="steps">Etapas</TabsTrigger>
                <TabsTrigger value="data">Dados Extraídos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="steps" className="space-y-4">
                {steps.map((step) => (
                  <Card key={step.id} className={step.id === currentStep ? 'ring-2 ring-primary' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{step.name}</CardTitle>
                        <Badge className={getStepColor(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      {step.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(step.timestamp).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados do Sinistro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Número da Apólice</label>
                        <p className="text-sm">{claim.policyNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Segurado</label>
                        <p className="text-sm">{claim.insuredName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Data do Sinistro</label>
                        <p className="text-sm">{new Date(claim.incidentDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tipo</label>
                        <p className="text-sm">{claim.claimType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Valor Estimado</label>
                        <p className="text-sm">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(claim.estimatedAmount)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Canal</label>
                        <p className="text-sm capitalize">{claim.channel}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;