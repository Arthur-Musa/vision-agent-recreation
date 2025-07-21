import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { aiAgentService, AIAgent } from '@/services/aiAgents/agentService';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Users, 
  Activity,
  Settings,
  Brain,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AgentManager = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
    conversationsToday: 0
  });
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    system_prompt: '',
    capabilities: '',
    avatar_url: ''
  });

  useEffect(() => {
    loadAgents();
    loadStatistics();
  }, []);

  const loadAgents = async () => {
    try {
      const agentList = await aiAgentService.listAgents();
      setAgents(agentList);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agentes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await aiAgentService.getAgentStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleCreateAgent = async () => {
    if (!formData.name || !formData.description || !formData.type || !formData.system_prompt) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      const capabilities = formData.capabilities
        .split(',')
        .map(cap => cap.trim())
        .filter(cap => cap.length > 0);

      await aiAgentService.createAgent({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        system_prompt: formData.system_prompt,
        capabilities,
        avatar_url: formData.avatar_url || null,
        is_active: true
      });

      toast({
        title: 'Agente criado',
        description: 'Agente criado com sucesso!'
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadAgents();
      loadStatistics();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o agente',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;

    try {
      const capabilities = formData.capabilities
        .split(',')
        .map(cap => cap.trim())
        .filter(cap => cap.length > 0);

      await aiAgentService.updateAgent(selectedAgent.id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        system_prompt: formData.system_prompt,
        capabilities,
        avatar_url: formData.avatar_url || null
      });

      toast({
        title: 'Agente atualizado',
        description: 'Agente atualizado com sucesso!'
      });

      setIsEditDialogOpen(false);
      setSelectedAgent(null);
      resetForm();
      loadAgents();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o agente',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este agente?')) return;

    try {
      await aiAgentService.deleteAgent(agentId);
      toast({
        title: 'Agente deletado',
        description: 'Agente deletado com sucesso!'
      });
      loadAgents();
      loadStatistics();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o agente',
        variant: 'destructive'
      });
    }
  };

  const handleEditAgent = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      type: agent.type,
      system_prompt: agent.system_prompt,
      capabilities: agent.capabilities.join(', '),
      avatar_url: agent.avatar_url || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      system_prompt: '',
      capabilities: '',
      avatar_url: ''
    });
  };

  const createDefaultAgents = async () => {
    try {
      const created = await aiAgentService.createDefaultAgents();
      if (created.length > 0) {
        toast({
          title: 'Agentes criados',
          description: `${created.length} agentes padrão foram criados`
        });
        loadAgents();
        loadStatistics();
      } else {
        toast({
          title: 'Agentes já existem',
          description: 'Os agentes padrão já foram criados anteriormente'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar os agentes padrão',
        variant: 'destructive'
      });
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'claims': return <Bot className="h-4 w-4" />;
      case 'fraud': return <AlertCircle className="h-4 w-4" />;
      case 'underwriting': return <CheckCircle className="h-4 w-4" />;
      case 'legal': return <Settings className="h-4 w-4" />;
      case 'customer': return <Users className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'claims': return 'bg-blue-100 text-blue-800';
      case 'fraud': return 'bg-red-100 text-red-800';
      case 'underwriting': return 'bg-green-100 text-green-800';
      case 'legal': return 'bg-purple-100 text-purple-800';
      case 'customer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando agentes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gerenciador de Agentes IA</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={createDefaultAgents} variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            Criar Agentes Padrão
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Agente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do agente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claims">Sinistros</SelectItem>
                        <SelectItem value="fraud">Fraude</SelectItem>
                        <SelectItem value="underwriting">Subscrição</SelectItem>
                        <SelectItem value="legal">Jurídico</SelectItem>
                        <SelectItem value="customer">Atendimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do agente"
                  />
                </div>
                <div>
                  <Label htmlFor="capabilities">Capacidades</Label>
                  <Input
                    id="capabilities"
                    value={formData.capabilities}
                    onChange={(e) => setFormData(prev => ({ ...prev, capabilities: e.target.value }))}
                    placeholder="document-analysis, fraud-detection, risk-assessment"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe as capacidades por vírgula
                  </p>
                </div>
                <div>
                  <Label htmlFor="system_prompt">Prompt do Sistema *</Label>
                  <Textarea
                    id="system_prompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                    placeholder="Você é um assistente especializado em..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAgent} className="flex-1">
                    Criar Agente
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }} 
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {agents.length === 0 ? (
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                Nenhum agente encontrado. Crie seus primeiros agentes usando o botão "Criar Agentes Padrão" ou "Novo Agente".
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getAgentTypeIcon(agent.type)}
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                      </div>
                      <Badge className={`text-xs ${getAgentTypeColor(agent.type)}`}>
                        {agent.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 3).map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{agent.capabilities.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        {agent.is_active ? 'Ativo' : 'Inativo'}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditAgent(agent)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total de Agentes</p>
                    <p className="text-2xl font-bold">{statistics.totalAgents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Agentes Ativos</p>
                    <p className="text-2xl font-bold">{statistics.activeAgents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Conversas</p>
                    <p className="text-2xl font-bold">{statistics.totalConversations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Conversas Hoje</p>
                    <p className="text-2xl font-bold">{statistics.conversationsToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Workflows colaborativos entre agentes em desenvolvimento. Em breve você poderá criar fluxos automáticos que passam tarefas entre diferentes agentes especializados.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Agente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do agente"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claims">Sinistros</SelectItem>
                    <SelectItem value="fraud">Fraude</SelectItem>
                    <SelectItem value="underwriting">Subscrição</SelectItem>
                    <SelectItem value="legal">Jurídico</SelectItem>
                    <SelectItem value="customer">Atendimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição *</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do agente"
              />
            </div>
            <div>
              <Label htmlFor="edit-capabilities">Capacidades</Label>
              <Input
                id="edit-capabilities"
                value={formData.capabilities}
                onChange={(e) => setFormData(prev => ({ ...prev, capabilities: e.target.value }))}
                placeholder="document-analysis, fraud-detection, risk-assessment"
              />
            </div>
            <div>
              <Label htmlFor="edit-system_prompt">Prompt do Sistema *</Label>
              <Textarea
                id="edit-system_prompt"
                value={formData.system_prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                placeholder="Você é um assistente especializado em..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateAgent} className="flex-1">
                Atualizar Agente
              </Button>
              <Button 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedAgent(null);
                  resetForm();
                }} 
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentManager;