import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, 
  Paperclip, 
  User, 
  Bot, 
  FileText, 
  ExternalLink,
  Quote,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Citation {
  id: string;
  document: string;
  page: number;
  text: string;
  confidence: number;
  coordinates: [number, number, number, number];
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agent?: string;
  citations?: Citation[];
  files?: File[];
  status?: 'sending' | 'sent' | 'processing' | 'completed';
}

interface ConversationalChatProps {
  onMessageSent?: (message: string, files?: File[]) => void;
  onCitationClick?: (citation: Citation) => void;
  isProcessing?: boolean;
  messages: Message[];
}

export const ConversationalChat: React.FC<ConversationalChatProps> = ({
  onMessageSent,
  onCitationClick,
  isProcessing = false,
  messages
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() && attachedFiles.length === 0) {
      toast({
        title: 'Mensagem vazia',
        description: 'Digite uma mensagem ou anexe um documento.',
        variant: 'destructive'
      });
      return;
    }

    onMessageSent?.(inputMessage, attachedFiles);
    setInputMessage('');
    setAttachedFiles([]);
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getAgentBadgeColor = (agent?: string) => {
    const colors = {
      'Concierge': 'bg-purple-100 text-purple-800 border-purple-200',
      'Claims Processor': 'bg-blue-100 text-blue-800 border-blue-200',
      'Policy Analyzer': 'bg-green-100 text-green-800 border-green-200',
      'Fraud Detective': 'bg-red-100 text-red-800 border-red-200',
      'Legal Analyzer': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[agent as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Conversa com Olga</h2>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Concierge Ativo
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Chat inteligente com citações automáticas e análise de documentos
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Olá! Sou a Olga</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seu assistente especializado em seguros. Como posso ajudar hoje?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => setInputMessage('Analisar sinistro')}>
                  Analisar Sinistro
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInputMessage('Verificar apólice')}>
                  Verificar Apólice
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInputMessage('Detectar fraude')}>
                  Detectar Fraude
                </Button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content */}
              <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                {/* Message Header */}
                <div className={`flex items-center gap-2 mb-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.agent && (
                    <Badge className={getAgentBadgeColor(message.agent)}>
                      {message.agent}
                    </Badge>
                  )}
                </div>

                {/* Message Bubble */}
                <Card className={`${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50'
                }`}>
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Files */}
                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white/10 rounded">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Quote className="h-3 w-3" />
                      <span>Fontes utilizadas:</span>
                    </div>
                    {message.citations.map((citation) => (
                      <Card 
                        key={citation.id}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => onCitationClick?.(citation)}
                      >
                        <CardContent className="p-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{citation.document}</span>
                              <Badge variant="outline" className="text-xs">
                                Pág. {citation.page}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {Math.round(citation.confidence * 100)}%
                              </Badge>
                              <ExternalLink className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground italic">
                            "{citation.text.slice(0, 80)}{citation.text.length > 80 ? '...' : ''}"
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%]">
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Analisando...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 space-y-1">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                <FileText className="h-4 w-4" />
                <span className="flex-1">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileAttach}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Digite sua mensagem ou pergunte sobre seguros..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isProcessing}
              className="pr-10"
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() && attachedFiles.length === 0 || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
};