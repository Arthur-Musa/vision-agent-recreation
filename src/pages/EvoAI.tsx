
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EvoAIConfiguration from '@/components/evoai/EvoAIConfiguration';
import EvoAIAgentManager from '@/components/evoai/EvoAIAgentManager';

const EvoAI = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Evo AI Platform</h1>
              <p className="text-muted-foreground">
                Gerenciamento avançado de agentes de IA com suporte MCP
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="agents">Gerenciar Agentes</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <EvoAIConfiguration />
          </TabsContent>

          <TabsContent value="agents">
            <EvoAIAgentManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EvoAI;
