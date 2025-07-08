import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useCreateClaim } from "@/hooks/useClaims";
import { ConciergeChat } from "@/components/workflow/ConciergeChat";
import { PropertyField } from "@/components/workflow/PropertyField";
import { RealAgentProcessor } from "@/components/agents/RealAgentProcessor";
import { AgentTestDashboard } from "@/components/agents/AgentTestDashboard";
import { PropertyType } from "@/types/workflow";
import { 
  ArrowLeft, 
  Brain,
  Settings,
  Eye,
  FileText,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConversationAnalysis = () => {
  const { agentId } = useParams();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { createClaim, loading } = useCreateClaim();
  
  const [suggestedAgent, setSuggestedAgent] = useState<string | null>(agentId || null);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [activeView, setActiveView] = useState<'concierge' | 'properties' | 'review' | 'processing' | 'test'>('concierge');
  const [createdClaimId, setCreatedClaimId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // Handle context from upload flow
  useEffect(() => {
    if (location.state) {
      const { files, agent, query } = location.state;
      if (files) setUploadedFiles(files);
      if (agent) setSuggestedAgent(agent.id);
      if (query) {
        setExtractedData(prev => ({ ...prev, initial_query: query }));
      }
      
      // Show context received toast
      toast({
        title: "Contexto Recebido",
        description: `${files?.length || 0} arquivo(s) e agente ${agent?.name || agentId}`,
      });
    }
  }, [location.state, agentId, toast]);

  // Mock property types for insurance claims
  const propertyTypes: PropertyType[] = [
    {
      id: 'claim_type',
      name: 'Tipo de Sinistro',
      type: 'single_select',
      required: true,
      description: 'Categoria do sinistro',
      options: ['Automotivo', 'Residencial', 'Empresarial', 'Vida', 'Saúde']
    },
    {
      id: 'estimated_value',
      name: 'Valor Estimado',
      type: 'number',
      required: true,
      description: 'Valor estimado dos danos (R$)',
      validation: { min: 0, max: 1000000 }
    },
    {
      id: 'description',
      name: 'Descrição do Sinistro',
      type: 'text',
      required: true,
      description: 'Descrição detalhada do ocorrido'
    },
    {
      id: 'risk_factors',
      name: 'Fatores de Risco',
      type: 'multi_select',
      required: false,
      description: 'Indicadores de risco identificados',
      options: ['Inconsistência documental', 'Valor elevado', 'Histórico suspeito', 'Testemunhas conflitantes']
    }
  ];

  const handleAgentSuggestion = (agentId: string) => {
    setSuggestedAgent(agentId);
    setActiveView('properties');
  };

  const handleDataExtraction = (data: Record<string, any>) => {
    setExtractedData(prev => ({ ...prev, ...data }));
  };

  const handlePropertyChange = (propertyId: string, value: any) => {
    setExtractedData(prev => ({ ...prev, [propertyId]: value }));
  };

  const handleSubmitClaim = async () => {
    try {
      const claimData = {
        tipo_sinistro: extractedData.claim_type || 'Automotivo',
        descricao: extractedData.description || 'Sinistro processado via concierge',
        valor_estimado: extractedData.estimated_value || 0,
        documentos: []
      };

      const newClaim = await createClaim(claimData);
      setCreatedClaimId(newClaim.id);
      
      toast({
        title: "Sinistro Criado",
        description: `Sinistro ${newClaim.numero_sinistro} criado com sucesso.`,
      });
      
      // Ir para a etapa de processamento real
      setActiveView('processing');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar sinistro.",
        variant: "destructive"
      });
    }
  };

  const texts = {
    title: { 'pt-BR': 'Análise Inteligente', 'pt': 'Análise Inteligente', 'en': 'Intelligent Analysis' },
    subtitle: { 'pt-BR': 'Assistente concierge para análise de sinistros', 'pt': 'Assistente concierge para análise de sinistros', 'en': 'Concierge assistant for claims analysis' },
    back: { 'pt-BR': 'Voltar', 'pt': 'Voltar', 'en': 'Back' },
    test: { 'pt-BR': 'Teste', 'pt': 'Teste', 'en': 'Test' },
    concierge: { 'pt-BR': 'Concierge', 'pt': 'Concierge', 'en': 'Concierge' },
    properties: { 'pt-BR': 'Propriedades', 'pt': 'Propriedades', 'en': 'Properties' },
    review: { 'pt-BR': 'Revisar', 'pt': 'Revisar', 'en': 'Review' },
    processing: { 'pt-BR': 'Processamento', 'pt': 'Processamento', 'en': 'Processing' },
    submit: { 'pt-BR': 'Criar Sinistro', 'pt': 'Criar Sinistro', 'en': 'Create Claim' }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border/50 flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/upload')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-medium text-foreground">{t(texts.title)}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t(texts.subtitle)}</p>
              </div>
            </div>
            
            {/* View Switcher */}
            <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={activeView === 'test' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('test')}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                {t(texts.test)}
              </Button>
              <Button
                variant={activeView === 'concierge' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('concierge')}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                {t(texts.concierge)}
              </Button>
              <Button
                variant={activeView === 'properties' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('properties')}
                disabled={!suggestedAgent}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                {t(texts.properties)}
              </Button>
              <Button
                variant={activeView === 'review' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('review')}
                disabled={!suggestedAgent}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {t(texts.review)}
              </Button>
              <Button
                variant={activeView === 'processing' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('processing')}
                disabled={!createdClaimId}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                {t(texts.processing)}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Primary Panel */}
        <div className="flex-1 flex flex-col">
          {activeView === 'test' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <AgentTestDashboard onClaimCreated={(claimId) => {
                  setCreatedClaimId(claimId);
                  setActiveView('processing');
                }} />
              </div>
            </div>
          )}

          {activeView === 'concierge' && (
            <ConciergeChat
              onAgentSuggestion={handleAgentSuggestion}
              onDataExtraction={handleDataExtraction}
            />
          )}

          {activeView === 'properties' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-medium mb-2">Configurar Propriedades</h2>
                  <p className="text-sm text-muted-foreground">
                    Ajuste os dados extraídos pelo agente {suggestedAgent}
                  </p>
                </div>

                <div className="space-y-6">
                  {propertyTypes.map((property) => (
                    <PropertyField
                      key={property.id}
                      property={property}
                      value={extractedData[property.id]}
                      onChange={(value) => handlePropertyChange(property.id, value)}
                    />
                  ))}
                </div>

                <div className="flex justify-end pt-6">
                  <Button onClick={() => setActiveView('review')}>
                    Revisar Dados
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'review' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-medium mb-2">Revisar e Submeter</h2>
                  <p className="text-sm text-muted-foreground">
                    Verifique os dados antes de criar o sinistro
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Agente Sugerido:</span>
                      <Badge variant="outline">{suggestedAgent}</Badge>
                    </div>

                    {propertyTypes.map((property) => {
                      const value = extractedData[property.id];
                      if (!value) return null;

                      return (
                        <div key={property.id} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{property.name}:</span>
                          <span className="text-sm font-medium">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveView('properties')}
                  >
                    Voltar para Propriedades
                  </Button>
                  <Button 
                    onClick={handleSubmitClaim}
                    disabled={loading}
                  >
                    {loading ? 'Criando...' : t(texts.submit)}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'processing' && createdClaimId && (
            <RealAgentProcessor 
              claimId={createdClaimId}
              agentType={suggestedAgent || 'claims_processor'}
            />
          )}
        </div>

        {/* Side Panel - Context Info */}
        <div className="w-80 border-l border-border/50 bg-muted/30 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Status da Sessão</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Agente Ativo</span>
                  <Badge variant="outline" className="text-xs">
                    {suggestedAgent || 'Concierge'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Dados Extraídos</span>
                  <span className="text-foreground">
                    {Object.keys(extractedData).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Etapa Atual</span>
                  <span className="text-foreground capitalize">{activeView}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Documentos</h3>
              <div className="space-y-2">
                {uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded border border-border/50">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-xs text-foreground truncate">{file.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded border border-border/50">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Aguardando upload...</span>
                  </div>
                )}
              </div>
            </div>

            {Object.keys(extractedData).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Dados Extraídos</h3>
                <div className="space-y-2">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className="p-2 rounded bg-card border border-border/50">
                      <div className="text-xs text-muted-foreground">{key}</div>
                      <div className="text-xs font-medium truncate">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationAnalysis;