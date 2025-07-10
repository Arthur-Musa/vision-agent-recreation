import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Upload, FileText, Plus, X, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

interface KnowledgeFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  knowledgeFiles: KnowledgeFile[];
  category: string;
  capabilities: string[];
}

const OPENAI_MODELS = [
  { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1', description: 'Modelo flagship mais avançado' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Modelo otimizado para visão e código' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Versão rápida e eficiente' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Modelo rápido e econômico' }
];

const AGENT_CATEGORIES = [
  { id: 'claims', name: 'Sinistros', description: 'Processamento e análise de sinistros' },
  { id: 'underwriting', name: 'Subscrição', description: 'Avaliação de riscos e propostas' },
  { id: 'legal', name: 'Jurídico', description: 'Análise de contratos e compliance' },
  { id: 'customer', name: 'Atendimento', description: 'Suporte e atendimento ao cliente' },
  { id: 'custom', name: 'Personalizado', description: 'Agente com funcionalidade específica' }
];

const CAPABILITIES = [
  'document_parsing', 'data_extraction', 'risk_assessment', 'fraud_detection',
  'pattern_analysis', 'risk_scoring', 'premium_calculation', 'document_validation',
  'coverage_analysis', 'compliance_check', 'gap_detection', 'provision_mapping',
  'legal_analysis', 'risk_identification', 'clause_extraction', 'natural_language',
  'triage', 'escalation', 'file_search', 'code_interpreter'
];

const AgentBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [agent, setAgent] = useState<Partial<CustomAgent>>({
    name: '',
    description: '',
    systemPrompt: '',
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.1,
    maxTokens: 2000,
    knowledgeFiles: [],
    category: 'custom',
    capabilities: []
  });

  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);

  // File upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      const newFiles: KnowledgeFile[] = acceptedFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      setAgent(prev => ({
        ...prev,
        knowledgeFiles: [...(prev.knowledgeFiles || []), ...newFiles]
      }));
      
      toast({
        title: 'Arquivos adicionados',
        description: `${acceptedFiles.length} arquivo(s) adicionado(s) à base de conhecimento.`,
      });
    },
    onDropRejected: (rejectedFiles) => {
      toast({
        title: 'Erro no upload',
        description: `${rejectedFiles.length} arquivo(s) rejeitado(s). Verifique o formato e tamanho.`,
        variant: 'destructive'
      });
    }
  });

  const removeFile = (fileId: string) => {
    setAgent(prev => ({
      ...prev,
      knowledgeFiles: prev.knowledgeFiles?.filter(f => f.id !== fileId) || []
    }));
  };

  const toggleCapability = (capability: string) => {
    setAgent(prev => ({
      ...prev,
      capabilities: prev.capabilities?.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...(prev.capabilities || []), capability]
    }));
  };

  const createAssistant = async () => {
    if (!agent.name || !agent.description || !agent.systemPrompt) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, descrição e prompt do sistema.',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingAssistant(true);

    try {
      // Simulate OpenAI Assistant creation
      const assistantId = `asst_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
      
      const newAgent: CustomAgent = {
        id: Date.now().toString(),
        name: agent.name!,
        description: agent.description!,
        systemPrompt: agent.systemPrompt!,
        model: agent.model!,
        temperature: agent.temperature!,
        maxTokens: agent.maxTokens!,
        knowledgeFiles: agent.knowledgeFiles!,
        category: agent.category!,
        capabilities: agent.capabilities!
      };

      // Save to localStorage (in production, this would go to your backend)
      const existingAgents = JSON.parse(localStorage.getItem('custom_agents') || '[]');
      const updatedAgents = [...existingAgents, newAgent];
      localStorage.setItem('custom_agents', JSON.stringify(updatedAgents));

      // Also save as an OpenAI Assistant config
      const existingAssistants = JSON.parse(localStorage.getItem('openai_assistants') || '[]');
      const assistantConfig = {
        id: assistantId,
        name: agent.name,
        assistantId: assistantId,
        description: agent.description,
        enabled: true,
        model: agent.model,
        knowledgeFiles: agent.knowledgeFiles?.length || 0
      };
      const updatedAssistants = [...existingAssistants, assistantConfig];
      localStorage.setItem('openai_assistants', JSON.stringify(updatedAssistants));

      toast({
        title: 'Agente criado com sucesso!',
        description: `O agente "${agent.name}" foi criado e está disponível para uso.`,
      });

      // Redirect to agents list or settings
      navigate('/settings');

    } catch (error) {
      console.error('Erro ao criar agente:', error);
      toast({
        title: 'Erro ao criar agente',
        description: 'Ocorreu um erro ao criar o agente. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Construtor de Agentes IA
              </h1>
              <p className="text-sm text-muted-foreground">
                Crie agentes personalizados com RAG e assistants OpenAI
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Nome do Agente *</Label>
                  <Input
                    id="agent-name"
                    placeholder="Ex: Analista de Contratos Especializados"
                    value={agent.name || ''}
                    onChange={(e) => setAgent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-category">Categoria</Label>
                  <Select 
                    value={agent.category} 
                    onValueChange={(value) => setAgent(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div>
                            <div className="font-medium">{cat.name}</div>
                            <div className="text-xs text-muted-foreground">{cat.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-description">Descrição *</Label>
                <Textarea
                  id="agent-description"
                  placeholder="Descreva o que este agente faz e como pode ajudar..."
                  rows={3}
                  value={agent.description || ''}
                  onChange={(e) => setAgent(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Modelo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model-select">Modelo OpenAI</Label>
                <Select 
                  value={agent.model} 
                  onValueChange={(value) => setAgent(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPENAI_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura ({agent.temperature})</Label>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={agent.temperature}
                    onChange={(e) => setAgent(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    0 = Determinístico, 1 = Criativo
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Tokens Máximos</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={agent.maxTokens}
                    onChange={(e) => setAgent(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle>Prompt do Sistema *</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define o comportamento e personalidade do agente
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Você é um especialista em... Suas responsabilidades incluem..."
                rows={8}
                value={agent.systemPrompt || ''}
                onChange={(e) => setAgent(prev => ({ ...prev, systemPrompt: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Capacidades</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione as capacidades que este agente deve ter
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CAPABILITIES.map((capability) => (
                  <Badge
                    key={capability}
                    variant={agent.capabilities?.includes(capability) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCapability(capability)}
                  >
                    {capability.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base (RAG) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Base de Conhecimento (RAG)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload de documentos para o agente usar como referência
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">
                  {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, TXT, DOC, DOCX, XLS, XLSX • Máximo 10MB por arquivo
                </p>
              </div>

              {/* File List */}
              {agent.knowledgeFiles && agent.knowledgeFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Arquivos Carregados ({agent.knowledgeFiles.length})</h4>
                  <div className="space-y-2">
                    {agent.knowledgeFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            
            <Button 
              onClick={createAssistant} 
              disabled={isCreatingAssistant}
              className="min-w-[150px]"
            >
              {isCreatingAssistant ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Agente
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentBuilder;