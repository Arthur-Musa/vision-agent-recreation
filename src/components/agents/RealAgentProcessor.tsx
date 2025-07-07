import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';
import { useClaim } from '@/hooks/useClaims';
import { claimsApi } from '@/services/claimsApi';
import { getApiAgentType, getAgentCapabilities } from '@/services/agentMapping';
import { DocumentUploader } from '@/components/upload/DocumentUploader';
import { 
  Play, 
  RefreshCw, 
  Download, 
  FileText, 
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealAgentProcessorProps {
  claimId: string;
  agentType: string;
}

export const RealAgentProcessor: React.FC<RealAgentProcessorProps> = ({ claimId, agentType }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { claim, status, loading, error, startAnalysis, refreshStatus } = useClaim(claimId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Mapear agente do frontend para tipo da API
  const apiAgentType = getApiAgentType(agentType);
  const agentCapabilities = getAgentCapabilities(apiAgentType);

  const handleStartAnalysis = async () => {
    setIsProcessing(true);
    try {
      // Usar a API real para análise específica por agente
      const result = await claimsApi.analyzeWithAgent(claimId, apiAgentType);
      await startAnalysis();
      
      toast({
        title: "Análise Iniciada",
        description: `${agentCapabilities.name} está processando o sinistro`,
      });

      // Polling para verificar progresso
      const pollStatus = setInterval(async () => {
        await refreshStatus();
        if (status?.status === 'completed' || status?.status === 'failed') {
          clearInterval(pollStatus);
          setIsProcessing(false);
          
          if (status.status === 'completed') {
            // Buscar relatório completo
            try {
              const report = await claimsApi.getClaimReport(claimId);
              setAnalysisResult(report);
              
              toast({
                title: "Análise Concluída",
                description: `Confiança: ${report.confidence}%`,
              });
            } catch (reportError) {
              console.error('Erro ao buscar relatório:', reportError);
            }
          }
        }
      }, 2000);

    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Erro na Análise",
        description: "Falha ao iniciar processamento",
        variant: "destructive"
      });
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'fraud_detector': return <Shield className="h-5 w-5" />;
      case 'claims_processor': return <FileText className="h-5 w-5" />;
      case 'underwriting': return <TrendingUp className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'analyzing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'analyzing': return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Carregando dados do sinistro...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status do Sinistro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getAgentIcon(apiAgentType)}
            {agentCapabilities.name} - Sinistro {claim?.numero_sinistro}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(claim?.status || 'pending')}
                <span className={`font-medium ${getStatusColor(claim?.status || 'pending')}`}>
                  {claim?.status === 'completed' ? 'Concluído' : 
                   claim?.status === 'analyzing' ? 'Analisando' :
                   claim?.status === 'failed' ? 'Erro' : 'Pendente'}
                </span>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <p className="font-medium mt-1">{claim?.data.tipo_sinistro}</p>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Valor Estimado:</span>
              <p className="font-medium mt-1">
                {claim?.data.valor_estimado ? 
                  `R$ ${claim.data.valor_estimado.toLocaleString('pt-BR')}` : 
                  'Não informado'
                }
              </p>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Criado em:</span>
              <p className="font-medium mt-1">
                {claim?.created_at ? new Date(claim.created_at).toLocaleString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Progresso da Análise */}
          {status?.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da Análise</span>
                <span>{status.progress}%</span>
              </div>
              <Progress value={status.progress} className="h-2" />
              {status.current_step && (
                <p className="text-xs text-muted-foreground">
                  Etapa atual: {status.current_step}
                </p>
              )}
            </div>
          )}

          {/* Descrição */}
          <div>
            <span className="text-sm text-muted-foreground">Descrição:</span>
            <p className="mt-1 text-sm leading-relaxed">{claim?.data.descricao}</p>
          </div>
        </CardContent>
      </Card>

      {/* Upload de Documentos Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploader 
            onFilesAdded={() => {}} 
            claimId={claimId}
          />
        </CardContent>
      </Card>

      {/* Controles de Análise */}
      <Card>
        <CardHeader>
          <CardTitle>Processamento com IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleStartAnalysis}
              disabled={isProcessing || claim?.status === 'analyzing'}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isProcessing ? 'Processando...' : 'Iniciar Análise'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={refreshStatus}
              disabled={isProcessing}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar Status
            </Button>
          </div>

          {status?.estimated_completion && (
            <p className="text-sm text-muted-foreground">
              Tempo estimado: {status.estimated_completion}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resultados da Análise */}
      {(analysisResult || claim?.analysis_result) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Resultados da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const result = analysisResult || claim?.analysis_result;
              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Confiança:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={result.confidence > 80 ? 'default' : 'secondary'}>
                          {result.confidence}%
                        </Badge>
                      </div>
                    </div>
                    
                    {result.fraud_score !== undefined && (
                      <div>
                        <span className="text-sm text-muted-foreground">Score de Fraude:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={result.fraud_score > 70 ? 'destructive' : 'outline'}>
                            {result.fraud_score}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {result.findings && result.findings.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Descobertas:</span>
                      <ul className="mt-2 space-y-1">
                        {result.findings.map((finding: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.recommendation && (
                    <div>
                      <span className="text-sm text-muted-foreground">Recomendação:</span>
                      <p className="mt-1 text-sm bg-muted/50 p-3 rounded">
                        {result.recommendation}
                      </p>
                    </div>
                  )}

                  <Button variant="outline" className="gap-2" onClick={async () => {
                    try {
                      const report = await claimsApi.getClaimReport(claimId);
                      // Simular download do relatório
                      const blob = new Blob([JSON.stringify(report, null, 2)], 
                        { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `relatorio-${claim?.numero_sinistro}.json`;
                      a.click();
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Falha ao baixar relatório",
                        variant: "destructive"
                      });
                    }
                  }}>
                    <Download className="h-4 w-4" />
                    Baixar Relatório Completo
                  </Button>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};