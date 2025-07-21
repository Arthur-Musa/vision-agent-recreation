
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { evoAIService, EvoAIAgent } from '@/services/evoAI/evoAIService';
import { insuranceAgents } from '@/data/insuranceAgents';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Settings,
  MessageSquare,
  Users,
  Download,
  Upload
} from 'lucide-react';

const EvoAIAgentManager = () => {
  const [agents, setAgents] = useState<EvoAIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<EvoAIAgent | null>(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    instructions: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000,
    capabilities: [] as string[]
  });
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'completed' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const agentList = await evoAIService.listAgents();
      setAgents(agentList);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar agentes do Evo AI',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async () => {
    if (!newAgent.name || !newAgent.description) {
      toast({
        title: 'Erro',
        description: 'Nome e descrição são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const agent = await evoAIService.createAgent(newAgent);
      setAgents(prev => [...prev, agent]);
      setNewAgent({
        name: '',
        description: '',
        instructions: '',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
        capabilities: []
      });
      
      toast({
        title: 'Sucesso',
        description: 'Agente criado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao criar agente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este agente?')) return;

    setIsLoading(true);
    try {
      await evoAIService.deleteAgent(agentId);
      setAgents(prev => prev.filter(a => a.id !== agentId));
      
      toast({
        title: 'Sucesso',
        description: 'Agente excluído com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir agente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAgent = async (agent: EvoAIAgent) => {
    if (!testMessage.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite uma mensagem para testar',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setTestResult('');
    setSelectedAgent(agent);

    try {
      const response = await evoAIService.sendMessage({
        agentId: agent.id,
        message: testMessage,
        context: { test: true }
      });

      setTestResult(response.content);
      
      toast({
        title: 'Teste Concluído',
        description: 'Agente respondeu com sucesso!',
      });
    } catch (error) {
      setTestResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      toast({
        title: 'Erro no Teste',
        description: 'Falha ao testar agente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const migrateExistingAgents = async () => {
    setMigrationStatus('migrating');
    
    try {
      const agentsToMigrate = insuranceAgents.map(agent => ({
        id: agent.id,
        name: agent.name['pt-BR'],
        description: agent.description['pt-BR'],
        systemPrompt: `Você é um agente especializado em ${agent.category}. ${agent.description['pt-BR']}`,
        capabilities: agent.capabilities || []
      }));

      const result = await evoAIService.migrateExistingAgents(agentsToMigrate);
      
      setMigrationStatus('completed');
      
      toast({
        title: 'Migração Concluída',
        description: `${result.success.length} agentes migrados com sucesso. ${result.failed.length} falharam.`,
      });

      if (result.failed.length > 0) {
        console.error('Agentes que falharam na migração:', result.failed);
      }

      // Recarregar lista de agentes
      await loadAgents();
    } catch (error) {
      setMigrationStatus('error');
      
      toast({
        title: 'Erro na Migração',
        description: 'Falha ao migrar agentes existentes',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default">Ativo</Badge>;
      case 'inactive': return <Badge variant="secondary">Inativo</Badge>;
      case 'training': return <Badge variant="outline">Treinando</Badge>;
      default: return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gerenciar Agentes Evo AI</h2>
          <Badge variant="outline">{agents.length} agentes</Badge>
        </div>
        
        <Button onClick={loadAgents} disabled={isLoading} variant="outline">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Settings className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="create">Criar</TabsTrigger>
          <TabsTrigger value="test">Testar</TabsTrigger>
          <TabsTrigger value="migrate">Migrar</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4">
            {agents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum agente encontrado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Crie novos agentes ou migre os existentes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              agents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(agent.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAgent(agent.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Modelo</Label>
                        <p>{agent.model}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Temperatura</Label>
                        <p>{agent.temperature}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Max Tokens</Label>
                        <p>{agent.maxTokens}</p>
                      </div>
                    </div>
                    
                    {agent.capabilities.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-muted-foreground">Capacidades</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.capabilities.map((cap, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Agente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Agente</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Analista de Sinistros"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Select 
                    value={newAgent.model} 
                    onValueChange={(value) => setNewAgent(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição das funcionalidades do agente"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instruções do Sistema</Label>
                <Textarea
                  id="instructions"
                  placeholder="Instruções detalhadas para o agente..."
                  value={newAgent.instructions}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, instructions: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={newAgent.temperature}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={newAgent.maxTokens}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <Button onClick={createAgent} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Criar Agente
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testar Agente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testMessage">Mensagem de Teste</Label>
                <Textarea
                  id="testMessage"
                  placeholder="Digite uma mensagem para testar..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {agents.filter(a => a.status === 'active').map((agent) => (
                  <Button
                    key={agent.id}
                    variant="outline"
                    onClick={() => testAgent(agent)}
                    disabled={isLoading}
                  >
                    {isLoading && selectedAgent?.id === agent.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {agent.name}
                  </Button>
                ))}
              </div>

              {testResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Resultado - {selectedAgent?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{testResult}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migrate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migrar Agentes Existentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Esta função irá migrar todos os agentes existentes do sistema para o Evo AI.
                  Agentes com o mesmo nome serão ignorados para evitar duplicatas.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Agentes Disponíveis para Migração:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {insuranceAgents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-2 p-2 border rounded">
                      <Bot className="h-4 w-4" />
                      <span className="text-sm">{agent.name['pt-BR']}</span>
                      <Badge variant="outline" className="text-xs">{agent.category}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {migrationStatus === 'completed' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Migração concluída com sucesso! Os agentes foram criados no Evo AI.
                  </AlertDescription>
                </Alert>
              )}

              {migrationStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erro durante a migração. Verifique os logs e tente novamente.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={migrateExistingAgents} 
                disabled={migrationStatus === 'migrating'} 
                className="w-full"
              >
                {migrationStatus === 'migrating' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {migrationStatus === 'migrating' ? 'Migrando...' : 'Migrar Agentes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvoAIAgentManager;
