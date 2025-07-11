import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Bot, Send, Settings, Eye, FileText, Shield, Users, Zap } from 'lucide-react';
import { openaiService } from '@/services/openaiService';
import { toast } from 'sonner';

const OpenAITestCenter = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  
  // Chat Completion States
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatModel, setChatModel] = useState('gpt-4.1-2025-04-14');
  const [chatTemperature, setChatTemperature] = useState(0.7);
  
  // Assistant States
  const [assistantMessage, setAssistantMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('claimsProcessor');
  const [documentText, setDocumentText] = useState('');
  
  // Vision States
  const [visionPrompt, setVisionPrompt] = useState('Analise esta imagem de sinistro e extraia todas as informações relevantes');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    toast.success('API Key salva com sucesso!');
  };

  const testChatCompletion = async () => {
    if (!chatPrompt.trim()) {
      toast.error('Digite um prompt para testar');
      return;
    }

    setIsLoading(true);
    try {
      const result = await openaiService.generateCompletion(chatPrompt, {
        model: chatModel,
        temperature: chatTemperature,
        maxTokens: 1000
      });
      setResponse(result);
      toast.success('Chat completion executado com sucesso!');
    } catch (error) {
      console.error('Erro no chat completion:', error);
      setResponse(`Erro: ${error.message}`);
      toast.error('Erro ao executar chat completion');
    } finally {
      setIsLoading(false);
    }
  };

  const testAssistant = async () => {
    if (!assistantMessage.trim()) {
      toast.error('Digite uma mensagem para o assistant');
      return;
    }

    setIsLoading(true);
    try {
      const agents = openaiService.getInsuranceAgents();
      const agentConfig = agents[selectedAgent];
      
      const result = await openaiService.processWithAgent(
        agentConfig,
        assistantMessage,
        documentText || undefined
      );
      
      setResponse(JSON.stringify(result, null, 2));
      toast.success('Assistant executado com sucesso!');
    } catch (error) {
      console.error('Erro no assistant:', error);
      setResponse(`Erro: ${error.message}`);
      toast.error('Erro ao executar assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const testVision = async () => {
    if (!imageFile || !visionPrompt.trim()) {
      toast.error('Selecione uma imagem e digite um prompt');
      return;
    }

    setIsLoading(true);
    try {
      const base64 = await convertToBase64(imageFile);
      const result = await openaiService.analyzeImageWithVision(
        base64.split(',')[1], // Remove data:image prefix
        visionPrompt,
        { model: 'gpt-4o' }
      );
      setResponse(result);
      toast.success('Análise de visão executada com sucesso!');
    } catch (error) {
      console.error('Erro na análise de visão:', error);
      setResponse(`Erro: ${error.message}`);
      toast.error('Erro ao analisar imagem');
    } finally {
      setIsLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const agents = openaiService.getInsuranceAgents();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-heading-1 mb-2">Centro de Testes OpenAI</h1>
        <p className="text-body text-muted-foreground">
          Teste todas as funcionalidades da API OpenAI integradas ao sistema
        </p>
      </div>

      {/* API Key Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Configuração da API</CardTitle>
          </div>
          <CardDescription>
            Configure sua API Key da OpenAI para testar as funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={saveApiKey} variant="outline">
              Salvar
            </Button>
          </div>
          {!apiKey && (
            <Alert className="mt-3">
              <AlertDescription>
                Configure sua API Key da OpenAI para usar as funcionalidades de teste
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Assistant
              </TabsTrigger>
              <TabsTrigger value="vision" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vision
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Chat Completion
                  </CardTitle>
                  <CardDescription>
                    Teste chat completions com diferentes modelos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="model">Modelo</Label>
                    <Select value={chatModel} onValueChange={setChatModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1 (Recomendado)</SelectItem>
                        <SelectItem value="o3-2025-04-16">O3 (Reasoning)</SelectItem>
                        <SelectItem value="o4-mini-2025-04-16">O4 Mini</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="temperature">Temperature: {chatTemperature}</Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={chatTemperature}
                      onChange={(e) => setChatTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      placeholder="Digite seu prompt aqui..."
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button onClick={testChatCompletion} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Testar Chat
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assistant" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Insurance Assistants
                  </CardTitle>
                  <CardDescription>
                    Teste os assistants especializados em seguros
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="agent">Agente</Label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(agents).map(([key, agent]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {key.includes('claims') && <FileText className="h-4 w-4" />}
                              {key.includes('fraud') && <Shield className="h-4 w-4" />}
                              {key.includes('customer') && <Users className="h-4 w-4" />}
                              {agent.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="document">Texto do Documento (opcional)</Label>
                    <Textarea
                      placeholder="Cole aqui o texto de um documento para análise..."
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      placeholder="Digite sua solicitação para o assistant..."
                      value={assistantMessage}
                      onChange={(e) => setAssistantMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button onClick={testAssistant} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Testar Assistant
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vision" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Vision Analysis
                  </CardTitle>
                  <CardDescription>
                    Analise imagens com GPT-4 Vision
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="image">Imagem</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-32 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="vision-prompt">Prompt de Análise</Label>
                    <Textarea
                      placeholder="Digite o que você quer que a IA analise na imagem..."
                      value={visionPrompt}
                      onChange={(e) => setVisionPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button onClick={testVision} disabled={isLoading || !imageFile} className="w-full">
                    {isLoading ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Analisar Imagem
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Response Panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Resposta da API
              </CardTitle>
              <CardDescription>
                Resultado da execução da API OpenAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {response ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap break-words">
                      {response}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {response.length} caracteres
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(response)}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Execute um teste para ver a resposta aqui</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testes Rápidos</CardTitle>
          <CardDescription>
            Experimentos pré-configurados para testar funcionalidades específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setChatPrompt('Explique como funciona o processamento de sinistros no Brasil');
                setChatModel('gpt-4.1-2025-04-14');
              }}
            >
              Teste Seguros
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAgent('fraudDetector');
                setAssistantMessage('Analise este sinistro em busca de possíveis fraudes');
                setDocumentText('Sinistro #12345 - Colisão frontal em rodovia - Valor: R$ 25.000');
              }}
            >
              Teste Fraude
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setVisionPrompt('Identifique todos os danos visíveis neste veículo e estime o valor do reparo');
              }}
            >
              Teste Vision
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenAITestCenter;