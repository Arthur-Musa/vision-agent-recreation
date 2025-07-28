import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, FileText, Brain } from 'lucide-react';
import { ChatInterface } from '@/components/chat/ChatInterface';

const LiveWorkflow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [agentInfo, setAgentInfo] = useState<any>(null);

  useEffect(() => {
    // Pegar informações do agente do state da navegação
    if (location.state) {
      setAgentInfo(location.state);
    }
  }, [location.state]);

  const getAgentDetails = (agentId: string) => {
    const agents = {
      'claims-processor': {
        name: 'Processador de Sinistros',
        description: 'Análise completa de sinistros e documentos',
        color: 'bg-blue-500',
        icon: FileText
      },
      'fraud-detection': {
        name: 'Detector de Fraudes',
        description: 'Identificação de padrões suspeitos',
        color: 'bg-red-500',
        icon: Brain
      },
      'aura': {
        name: 'Aura',
        description: 'Assistente geral especializada',
        color: 'bg-purple-500',
        icon: Bot
      }
    };
    return agents[agentId as keyof typeof agents] || agents['claims-processor'];
  };

  const agentDetails = agentInfo?.selectedAgent ? getAgentDetails(agentInfo.selectedAgent) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          {agentDetails && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${agentDetails.color} rounded-lg`}>
                    <agentDetails.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{agentDetails.name}</CardTitle>
                    <p className="text-muted-foreground">{agentDetails.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    Ativo
                  </Badge>
                </div>
              </CardHeader>
              {agentInfo.initialQuery && (
                <CardContent>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm"><strong>Consulta inicial:</strong> {agentInfo.initialQuery}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default LiveWorkflow;