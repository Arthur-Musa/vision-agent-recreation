import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { openaiService } from '@/services/openaiService';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Settings,
  MessageSquare
} from 'lucide-react';

interface Assistant {
  id: string;
  name: string;
  assistantId: string;
  description: string;
  instructions?: string;
  enabled: boolean;
  model?: string;
  tools?: string[];
  files?: string[];
}

interface TestResult {
  content: string;
  status: 'completed' | 'failed' | 'in_progress';
  threadId?: string;
  usage?: any;
}

const AssistantManager = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [newAssistant, setNewAssistant] = useState<Partial<Assistant>>({
    name: '',
    assistantId: '',
    description: '',
    instructions: '',
    enabled: true
  });
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const { toast } = useToast();

  // Carregar assistants salvos
  useEffect(() => {
    const savedAssistants = localStorage.getItem('openai_assistants');
    if (savedAssistants) {
      setAssistants(JSON.parse(savedAssistants));
    }
  }, []);

  // Salvar assistants
  const saveAssistants = (updatedAssistants: Assistant[]) => {
    localStorage.setItem('openai_assistants', JSON.stringify(updatedAssistants));
    setAssistants(updatedAssistants);
  };

  // Adicionar novo assistant
  const addAssistant = () => {
    if (!newAssistant.name || !newAssistant.assistantId) {
      toast({
        title: 'Erro',
        description: 'Nome e Assistant ID são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const assistant: Assistant = {
      id: Date.now().toString(),
      name: newAssistant.name,
      assistantId: newAssistant.assistantId,
      description: newAssistant.description || '',
      instructions: newAssistant.instructions || '',
      enabled: true,
      model: 'gpt-4o-mini',
      tools: ['code_interpreter', 'retrieval'],
      files: []
    };

    const updatedAssistants = [...assistants, assistant];
    saveAssistants(updatedAssistants);
    
    setNewAssistant({
      name: '',
      assistantId: '',
      description: '',
      instructions: '',
      enabled: true
    });

    toast({
      title: 'Sucesso',
      description: 'Assistant adicionado com sucesso!',
    });
  };

  // Remover assistant
  const removeAssistant = (id: string) => {
    const updatedAssistants = assistants.filter(a => a.id !== id);
    saveAssistants(updatedAssistants);
    
    toast({
      title: 'Sucesso',
      description: 'Assistant removido com sucesso!',
    });
  };

  // Testar assistant
  const testAssistant = async (assistant: Assistant) => {
    if (!testMessage.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite uma mensagem para testar.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);
    setSelectedAssistant(assistant);

    try {
      const agentConfig = {
        name: assistant.name,
        description: assistant.description,
        systemPrompt: assistant.instructions || '',
        model: assistant.model || 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
        assistantId: assistant.assistantId
      };

      const result = await openaiService.processWithAgent(
        agentConfig,
        testMessage,
        undefined,
        {}
      );

      setTestResult({
        content: result.content,
        status: 'completed',
        usage: result.extractedData?.usage
      });

      toast({
        title: 'Teste Concluído',
        description: 'Assistant processou a mensagem com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao testar assistant:', error);
      setTestResult({
        content: `Erro: ${error.message}`,
        status: 'failed'
      });
      
      toast({
        title: 'Erro no Teste',
        description: 'Falha ao processar mensagem com o assistant.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar status do assistant
  const toggleAssistant = (id: string) => {
    const updatedAssistants = assistants.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    saveAssistants(updatedAssistants);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Gerenciar Assistants OpenAI</h2>
      </div>

      <Tabs defaultValue="assistants" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
          <TabsTrigger value="add">Adicionar</TabsTrigger>
          <TabsTrigger value="test">Testar</TabsTrigger>
        </TabsList>

        <TabsContent value="assistants" className="space-y-4">
          <div className="grid gap-4">
            {assistants.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum assistant configurado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adicione assistants OpenAI para usar funcionalidades personalizadas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              assistants.map((assistant) => (
                <Card key={assistant.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{assistant.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {assistant.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={assistant.enabled ? 'default' : 'secondary'}>
                          {assistant.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAssistant(assistant.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAssistant(assistant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Assistant ID</Label>
                        <p className="font-mono text-xs bg-muted p-1 rounded">
                          {assistant.assistantId}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Modelo</Label>
                        <p>{assistant.model || 'gpt-4o-mini'}</p>
                      </div>
                      {assistant.instructions && (
                        <div className="col-span-2">
                          <Label className="text-muted-foreground">Instruções</Label>
                          <p className="text-xs bg-muted p-2 rounded max-h-20 overflow-y-auto">
                            {assistant.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novo Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Assistant</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Analista de Sinistros"
                    value={newAssistant.name}
                    onChange={(e) => setNewAssistant(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="assistantId">Assistant ID</Label>
                  <Input
                    id="assistantId"
                    placeholder="asst_xxxxxx"
                    value={newAssistant.assistantId}
                    onChange={(e) => setNewAssistant(prev => ({...prev, assistantId: e.target.value}))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição das funcionalidades do assistant"
                  value={newAssistant.description}
                  onChange={(e) => setNewAssistant(prev => ({...prev, description: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instruções Especiais (opcional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Instruções adicionais para o assistant"
                  value={newAssistant.instructions}
                  onChange={(e) => setNewAssistant(prev => ({...prev, instructions: e.target.value}))}
                  className="min-h-[100px]"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Certifique-se de que o Assistant ID é válido e corresponde 
                  a um assistant criado na plataforma OpenAI.
                </AlertDescription>
              </Alert>

              <Button onClick={addAssistant} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Assistant
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testar Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testMessage">Mensagem de Teste</Label>
                <Textarea
                  id="testMessage"
                  placeholder="Digite uma mensagem para testar o assistant..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {assistants.filter(a => a.enabled).map((assistant) => (
                  <Button
                    key={assistant.id}
                    variant="outline"
                    onClick={() => testAssistant(assistant)}
                    disabled={isLoading}
                  >
                    {isLoading && selectedAssistant?.id === assistant.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {assistant.name}
                  </Button>
                ))}
              </div>

              {testResult && (
                <Card className="mt-4">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {testResult.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <CardTitle className="text-lg">
                        Resultado - {selectedAssistant?.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-muted-foreground">Resposta</Label>
                        <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                          <p className="text-sm whitespace-pre-wrap">{testResult.content}</p>
                        </div>
                      </div>
                      
                      {testResult.usage && (
                        <div>
                          <Label className="text-muted-foreground">Uso</Label>
                          <p className="text-xs text-muted-foreground">
                            Tokens: {JSON.stringify(testResult.usage)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistantManager;