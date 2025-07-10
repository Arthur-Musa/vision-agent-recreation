import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, Bot, User, FileText, AlertCircle, CheckCircle, Clock, Brain, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { DocumentUploader } from '@/components/upload/DocumentUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { chatService, ChatAnalysisResult } from '@/services/chatService';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: File[];
  analysis?: AnalysisResult;
  suggestions?: string[];
  status?: 'sending' | 'processing' | 'completed' | 'error';
}

interface AnalysisResult {
  documentType: string;
  extractedData: Record<string, any>;
  confidence: number;
  validations: Array<{
    field: string;
    status: 'success' | 'warning' | 'error';
    message: string;
  }>;
  recommendations: string[];
}

// Lista de agentes especializados
const INSURANCE_AGENTS = [
  { id: 'claims-processor', name: 'Processador de Sinistros', description: 'Análise completa de sinistros' },
  { id: 'fraud-detector', name: 'Detector de Fraudes', description: 'Identificação de padrões suspeitos' },
  { id: 'policy-analyzer', name: 'Analisador de Apólices', description: 'Verificação de coberturas e termos' },
  { id: 'underwriting-agent', name: 'Agente de Subscrição', description: 'Avaliação de riscos' },
  { id: 'legal-analyzer', name: 'Analisador Jurídico', description: 'Questões legais e regulamentares' }
];

export const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou a Olga, sua assistente especializada em seguros. Você pode selecionar um agente especializado ou deixar que eu analise e roteie sua solicitação automaticamente.',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Analisar um sinistro',
        'Verificar uma apólice',
        'Processar endosso',
        'Validar documentação'
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const currentMessage = inputMessage.trim();
    const currentAgent = selectedAgent;
    
    // Se um agente específico foi selecionado, abrir Live Workflow diretamente
    if (currentAgent) {
      const agentName = INSURANCE_AGENTS.find(a => a.id === currentAgent)?.name || 'Agente Selecionado';
      
      toast({
        title: `🤖 ${agentName} Ativado`,
        description: 'Abrindo workspace de análise ao vivo...'
      });
      
      // Navegar para Live Workflow com agente pré-selecionado
      navigate('/live-workflow', {
        state: {
          selectedAgent: currentAgent,
          initialQuery: currentMessage
        }
      });
      return;
    }

    // Se nenhum agente foi selecionado, usar o Concierge
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Concierge analisa e roteia automaticamente
      const conciergeResponse = await analyzeConciergeRequest(currentMessage);
      
      const conciergeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: conciergeResponse.content,
        timestamp: new Date().toISOString(),
        suggestions: conciergeResponse.suggestions
      };

      setMessages(prev => [...prev, conciergeMessage]);
      
      // Se o concierge recomendou um agente, abrir Live Workflow
      if (conciergeResponse.recommendedAgent) {
        setTimeout(() => {
          toast({
            title: '🎯 Roteamento Inteligente',
            description: `Ativando ${conciergeResponse.agentName} para análise especializada...`
          });
          
          navigate('/live-workflow', {
            state: {
              selectedAgent: conciergeResponse.recommendedAgent,
              initialQuery: currentMessage,
              conciergeAnalysis: conciergeResponse.analysis
            }
          });
        }, 2000);
      }
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua mensagem. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para análise do Concierge
  const analyzeConciergeRequest = async (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Simular análise inteligente
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (lowerMessage.includes('sinistro') || lowerMessage.includes('claim') || lowerMessage.includes('acidente')) {
      return {
        content: '🔍 **Concierge Analisou sua Solicitação**\n\nIdentifiquei que você precisa de análise de sinistro. Vou ativar nosso **Processador de Sinistros** especializado que irá:\n\n• Analisar documentos com OCR avançado\n• Verificar padrões de fraude\n• Calcular valores de indenização\n• Gerar relatório completo\n\n*Abrindo workspace de análise ao vivo...*',
        recommendedAgent: 'claims-processor',
        agentName: 'Processador de Sinistros',
        analysis: 'Solicitação de análise de sinistro identificada',
        suggestions: ['Aguardar abertura do workspace', 'Preparar documentos para upload']
      };
    }
    
    if (lowerMessage.includes('fraude') || lowerMessage.includes('fraud') || lowerMessage.includes('suspeito')) {
      return {
        content: '🕵️ **Concierge Analisou sua Solicitação**\n\nDetectei necessidade de análise de fraude. Ativando nosso **Detector de Fraudes** que possui:\n\n• IA especializada em padrões suspeitos\n• Análise comportamental avançada\n• Verificação de histórico\n• Score de risco detalhado\n\n*Preparando ambiente de investigação...*',
        recommendedAgent: 'fraud-detector',
        agentName: 'Detector de Fraudes',
        analysis: 'Solicitação de análise anti-fraude identificada',
        suggestions: ['Preparar documentos suspeitos', 'Aguardar ativação do detector']
      };
    }
    
    if (lowerMessage.includes('apólice') || lowerMessage.includes('policy') || lowerMessage.includes('cobertura')) {
      return {
        content: '📋 **Concierge Analisou sua Solicitação**\n\nIdentifiquei análise de apólice. Ativando nosso **Analisador de Apólices** especializado em:\n\n• Verificação de coberturas\n• Análise de cláusulas\n• Validação de termos\n• Comparação com padrões de mercado\n\n*Carregando ferramentas de análise...*',
        recommendedAgent: 'policy-analyzer',
        agentName: 'Analisador de Apólices',
        analysis: 'Solicitação de análise de apólice identificada',
        suggestions: ['Upload do documento da apólice', 'Aguardar análise completa']
      };
    }
    
    // Caso geral - concierge escolhe o melhor agente
    return {
      content: '🤖 **Concierge Analisou sua Solicitação**\n\nBaseado no contexto, recomendo nosso **Processador de Sinistros** como melhor opção para sua demanda. Este agente oferece:\n\n• Análise multifuncional\n• Processamento de documentos\n• Inteligência contextual\n• Roteamento inteligente\n\n*Inicializando análise especializada...*',
      recommendedAgent: 'claims-processor',
      agentName: 'Processador de Sinistros',
      analysis: 'Roteamento geral para processador de sinistros',
      suggestions: ['Aguardar ativação', 'Preparar documentos relevantes']
    };
  };

  const generateAssistantResponse = (userInput: string): ChatMessage => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('sinistro')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Entendo que você precisa analisar um sinistro. Para que eu possa ajudar melhor, você poderia compartilhar o documento do sinistro? Aceito arquivos em PDF, imagens ou outros formatos.',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Anexar documento de sinistro',
          'Informar número do sinistro',
          'Descrever o caso'
        ]
      };
    }
    
    if (lowerInput.includes('apólice') || lowerInput.includes('apolice')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Perfeito! Posso ajudar com a análise de apólices. Por favor, compartilhe o documento da apólice que você gostaria que eu analisasse.',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Anexar apólice',
          'Verificar cobertura',
          'Validar dados'
        ]
      };
    }

    if (lowerInput.includes('endosso')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Vou ajudar você com o processamento do endosso. Preciso do documento do endosso e da apólice original para fazer a análise completa.',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Anexar endosso',
          'Anexar apólice original',
          'Explicar alterações'
        ]
      };
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Entendi. Posso ajudar você com várias tarefas relacionadas a seguros. Você gostaria de:',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Analisar documentos de sinistro',
        'Verificar informações de apólices',
        'Processar endossos',
        'Validar documentação',
        'Calcular valores de indenização'
      ]
    };
  };

  const handleFileUpload = async (files: File[]) => {
    setShowUploader(false);
    
    // Se há um agente selecionado, ir direto para Live Workflow
    if (selectedAgent) {
      const agentName = INSURANCE_AGENTS.find(a => a.id === selectedAgent)?.name || 'Agente Selecionado';
      
      toast({
        title: `📎 Arquivos + ${agentName}`,
        description: 'Abrindo análise ao vivo com documentos...'
      });
      
      navigate('/live-workflow', {
        state: {
          selectedAgent: selectedAgent,
          initialFiles: files,
          initialQuery: `Analisar ${files.length} documento(s): ${files.map(f => f.name).join(', ')}`
        }
      });
      return;
    }
    
    // Se não há agente selecionado, concierge analisa os arquivos
    const fileMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Enviei ${files.length} arquivo(s): ${files.map(f => f.name).join(', ')}`,
      timestamp: new Date().toISOString(),
      attachments: files,
      status: 'processing'
    };

    setMessages(prev => [...prev, fileMessage]);
    setIsProcessing(true);

    try {
      // Concierge analisa arquivos e roteia
      const conciergeResponse = await analyzeConciergeFiles(files);
      
      const analysisMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: conciergeResponse.content,
        timestamp: new Date().toISOString(),
        suggestions: conciergeResponse.suggestions
      };

      setMessages(prev => [
        ...prev.map(msg => 
          msg.id === fileMessage.id 
            ? { ...msg, status: 'completed' as const }
            : msg
        ),
        analysisMessage
      ]);
      
      // Rotear para agente especializado
      if (conciergeResponse.recommendedAgent) {
        setTimeout(() => {
          navigate('/live-workflow', {
            state: {
              selectedAgent: conciergeResponse.recommendedAgent,
              initialFiles: files,
              initialQuery: `Documentos analisados pelo Concierge: ${files.map(f => f.name).join(', ')}`,
              conciergeAnalysis: conciergeResponse.analysis
            }
          });
        }, 2000);
      }
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível processar os documentos.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Análise de arquivos pelo Concierge
  const analyzeConciergeFiles = async (files: File[]) => {
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const fileNames = files.map(f => f.name.toLowerCase()).join(' ');
    
    if (fileNames.includes('sinistro') || fileNames.includes('boletim') || fileNames.includes('ocorrencia')) {
      return {
        content: '📋 **Concierge Analisou os Documentos**\n\nIdentifiquei documentos de sinistro nos arquivos enviados. Ativando **Processador de Sinistros** para:\n\n• Extração de dados via OCR\n• Análise de consistência\n• Verificação anti-fraude\n• Cálculo de indenização\n\n*Transferindo para análise especializada...*',
        recommendedAgent: 'claims-processor',
        analysis: 'Documentos de sinistro detectados',
        suggestions: ['Aguardar processamento completo']
      };
    }
    
    if (fileNames.includes('apolice') || fileNames.includes('policy') || fileNames.includes('contrato')) {
      return {
        content: '📑 **Concierge Analisou os Documentos**\n\nDocumentos de apólice identificados. Ativando **Analisador de Apólices** para:\n\n• Verificação de coberturas\n• Análise de cláusulas\n• Validação de dados\n• Comparação regulatória\n\n*Iniciando análise detalhada...*',
        recommendedAgent: 'policy-analyzer',
        analysis: 'Documentos de apólice detectados',
        suggestions: ['Aguardar análise de cobertura']
      };
    }
    
    // Análise geral
    return {
      content: '🔍 **Concierge Analisou os Documentos**\n\nDocumentos variados identificados. Utilizando **Processador de Sinistros** para análise multifuncional:\n\n• Classificação automática\n• Extração de dados\n• Análise contextual\n• Recomendações inteligentes\n\n*Processando com IA especializada...*',
      recommendedAgent: 'claims-processor',
      analysis: 'Documentos diversos para análise geral',
      suggestions: ['Aguardar classificação automática']
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === 'Anexar documento de sinistro' || 
        suggestion === 'Anexar apólice' || 
        suggestion === 'Anexar endosso') {
      setShowUploader(true);
      return;
    }
    
    setInputMessage(suggestion);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: ChatMessage) => {
    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.type === 'assistant' && (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
          <Card className={`${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <CardContent className="p-3">
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {message.attachments && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs opacity-75">
                      <FileText className="w-3 h-3" />
                      <span>{file.name}</span>
                      {message.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {message.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    </div>
                  ))}
                </div>
              )}

              {message.analysis && (
                <div className="mt-3 space-y-3">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium text-sm">{message.analysis.documentType}</span>
                      <Badge variant="secondary">
                        {Math.round(message.analysis.confidence * 100)}% confiança
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(message.analysis.extractedData).map(([key, value]) => (
                        <div key={key} className="bg-background/30 rounded p-2">
                          <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                          <div>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1">
                      {message.analysis.validations.map((validation, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {validation.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                          {validation.status === 'warning' && <AlertCircle className="w-3 h-3 text-yellow-500" />}
                          {validation.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                          <span>{validation.message}</span>
                        </div>
                      ))}
                    </div>

                    {message.analysis.recommendations.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">Recomendações:</div>
                        <ul className="text-xs space-y-1">
                          {message.analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{formatTimestamp(message.timestamp)}</span>
            {message.status === 'processing' && (
              <>
                <Clock className="w-3 h-3" />
                <span>Processando...</span>
              </>
            )}
          </div>

          {message.suggestions && message.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isProcessing}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>

        {message.type === 'user' && (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[800px]">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <div>
            <h2 className="font-semibold">Assistente Olga</h2>
            <p className="text-xs opacity-90">Especialista em seguros</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(renderMessage)}
          {isProcessing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Olga está digitando...</span>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="p-4 border-t space-y-3">
        {/* Seletor de Agente */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Agente Especializado (Opcional)
          </label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="🤖 Deixar Concierge escolher automaticamente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-medium">Concierge (Automático)</div>
                    <div className="text-xs text-muted-foreground">IA analisa e roteia automaticamente</div>
                  </div>
                </div>
              </SelectItem>
              {INSURANCE_AGENTS.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={selectedAgent ? "Mensagem será processada pelo agente selecionado..." : "Digite sua mensagem para o Concierge analisar..."}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Dialog open={showUploader} onOpenChange={setShowUploader}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Anexar Documentos</DialogTitle>
                  </DialogHeader>
                  <DocumentUploader onFilesAdded={(documents) => {
                    const files = documents.map(doc => doc.file).filter(Boolean) as File[];
                    handleFileUpload(files);
                  }} />
                </DialogContent>
              </Dialog>
              
              <Button 
                size="sm" 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                className="h-8 w-8 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {selectedAgent && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Play className="h-3 w-3" />
            <span>
              Agente selecionado: <strong>{INSURANCE_AGENTS.find(a => a.id === selectedAgent)?.name}</strong>
              - Abrirá Live Workflow diretamente
            </span>
          </div>
        )}
        
        {!selectedAgent && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Brain className="h-3 w-3" />
            <span>Concierge ativo - Analisará sua solicitação e roteará para o agente mais adequado</span>
          </div>
        )}
      </div>
    </div>
  );
};