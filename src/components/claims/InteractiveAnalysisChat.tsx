import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  FileText,
  Search,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'action';
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    citations?: Array<{
      document: string;
      page: number;
      text: string;
    }>;
    actions?: Array<{
      type: 'email' | 'document_request' | 'schedule' | 'escalate';
      description: string;
      status: 'pending' | 'completed' | 'failed';
    }>;
  };
}

interface InteractiveAnalysisChatProps {
  claimId: string;
  onActionRequested: (action: string, details: any) => void;
  onCitationClick: (citation: any) => void;
}

export const InteractiveAnalysisChat = ({ 
  claimId, 
  onActionRequested, 
  onCitationClick 
}: InteractiveAnalysisChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock initial messages
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        type: 'system',
        content: 'Olá! Sou a IA da Olga, seu assistente para análise de sinistros. Posso ajudar você a analisar documentos, responder perguntas e executar ações. Como posso ajudar?',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 1.0
        }
      }
    ];
    setMessages(initialMessages);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const quickActions = [
    {
      label: 'Analisar documentos médicos',
      prompt: 'Analise todos os documentos médicos anexados e me diga se há alguma inconsistência.'
    },
    {
      label: 'Verificar valores do orçamento',
      prompt: 'Verifique se os valores do orçamento estão dentro da faixa normal para este tipo de reparo.'
    },
    {
      label: 'Buscar casos similares',
      prompt: 'Procure por casos similares nos últimos 6 meses com o mesmo segurado ou oficina.'
    },
    {
      label: 'Solicitar documentos',
      prompt: 'Prepare uma solicitação de documentos adicionais para o segurado via WhatsApp.'
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();

    if (input.includes('documento') || input.includes('relatório')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Analisei os documentos anexados. Encontrei as seguintes informações relevantes no relatório médico: "Lesão cervical compatível com acidente automobilístico". O laudo está consistente com a descrição do sinistro.',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 0.92,
          citations: [
            {
              document: 'Relatório_Médico.pdf',
              page: 2,
              text: 'Lesão cervical compatível com acidente automobilístico, sem indicação de preexistência.'
            }
          ]
        }
      };
    }

    if (input.includes('orçamento') || input.includes('valor')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Analisei os valores do orçamento. O valor de R$ 15.750 está 12% acima da média para este tipo de reparo (R$ 14.100). Recomendo solicitar um segundo orçamento de oficina credenciada.',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 0.87,
          citations: [
            {
              document: 'Orçamento_Oficina_A.pdf',
              page: 1,
              text: 'Total: R$ 15.750,00 - Serviços de funilaria e pintura'
            }
          ]
        }
      };
    }

    if (input.includes('similar') || input.includes('histórico')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Encontrei 2 casos similares nos últimos 6 meses: AUTO-789456 (mesmo segurado, valor R$ 12.300) e AUTO-654321 (mesma oficina, valor R$ 16.200). Nenhum indicador de fraude detectado no histórico.',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence: 0.95
        }
      };
    }

    if (input.includes('solicitar') || input.includes('documento')) {
      return {
        id: Date.now().toString(),
        type: 'action',
        content: 'Preparei uma solicitação de documentos adicionais. Deseja que eu envie via WhatsApp para o segurado?',
        timestamp: new Date().toISOString(),
        metadata: {
          actions: [
            {
              type: 'document_request',
              description: 'Solicitar comprovante de residência atualizado',
              status: 'pending'
            }
          ]
        }
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Entendi sua pergunta. Posso ajudar com análise de documentos, verificação de valores, busca por casos similares, ou preparar comunicações para o segurado. Pode me dar mais detalhes sobre o que precisa?',
      timestamp: new Date().toISOString(),
      metadata: {
        confidence: 0.8
      }
    };
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />;
      case 'assistant': return <Bot className="h-4 w-4" />;
      case 'system': return <Sparkles className="h-4 w-4" />;
      case 'action': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-primary text-primary-foreground ml-12';
      case 'assistant': return 'bg-muted mr-12';
      case 'system': return 'bg-blue-50 border-blue-200 mx-8';
      case 'action': return 'bg-green-50 border-green-200 mr-12';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Live View - Análise Interativa
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}>
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {getMessageIcon(message.type)}
                    <span className="text-xs font-medium capitalize">
                      {message.type === 'assistant' ? 'IA Olga' : 
                       message.type === 'user' ? 'Você' : 
                       message.type === 'action' ? 'Ação Sugerida' : 'Sistema'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                    {message.metadata?.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {(message.metadata.confidence * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="text-sm">
                    {message.content}
                  </div>

                  {/* Citations */}
                  {message.metadata?.citations && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-medium">Fontes:</div>
                      {message.metadata.citations.map((citation, index) => (
                        <div 
                          key={index}
                          className="bg-background/80 border rounded p-2 cursor-pointer hover:bg-muted/50"
                          onClick={() => onCitationClick(citation)}
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <FileText className="h-3 w-3" />
                            {citation.document} - Página {citation.page}
                          </div>
                          <div className="text-xs italic">"{citation.text}"</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {message.metadata?.actions && (
                    <div className="mt-3 space-y-2">
                      {message.metadata.actions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-background/80 border rounded">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">{action.description}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onActionRequested(action.type, action)}
                            className="text-xs"
                          >
                            Executar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="bg-muted p-3 rounded-lg mr-12">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs font-medium">IA Olga</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                  <span className="text-xs text-muted-foreground ml-2">Analisando...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="p-3 border-t bg-muted/30">
          <div className="text-xs font-medium mb-2">Ações Rápidas:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.prompt)}
                className="text-xs h-8 justify-start"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua pergunta ou comando..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};