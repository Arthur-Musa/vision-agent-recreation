import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useCreateClaim } from "@/hooks/useClaims";
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'delivered' | 'processing' | 'completed' | 'error';
}

const ConversationAnalysis = () => {
  const { agentId } = useParams();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createClaim, loading } = useCreateClaim();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Analysis workspace initialized. You can now start your conversation with the agent.',
      timestamp: new Date(),
      status: 'delivered'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'delivered'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate agent processing
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `I've received your message: "${userMessage.content}". Let me analyze this information and provide insights based on the uploaded documents.`,
        timestamp: new Date(),
        status: 'processing'
      };

      setMessages(prev => [...prev, agentResponse]);

      // Simulate completion
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === agentResponse.id 
            ? { ...msg, status: 'completed' }
            : msg
        ));
        setIsProcessing(false);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (message: Message) => {
    switch (message.status) {
      case 'processing':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const texts = {
    title: { 'pt-BR': 'Análise Conversacional', 'pt': 'Análise Conversacional', 'en': 'Conversational Analysis' },
    subtitle: { 'pt-BR': 'Interaja com o agente de IA para análise detalhada', 'pt': 'Interaja com o agente de IA para análise detalhada', 'en': 'Interact with the AI agent for detailed analysis' },
    back: { 'pt-BR': 'Voltar', 'pt': 'Voltar', 'en': 'Back' },
    placeholder: { 'pt-BR': 'Digite sua mensagem...', 'pt': 'Digite sua mensagem...', 'en': 'Type your message...' },
    send: { 'pt-BR': 'Enviar', 'pt': 'Enviar', 'en': 'Send' }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border/50 flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/upload')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-medium text-foreground">{t(texts.title)}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t(texts.subtitle)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Agent ID: {agentId}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Conversation Area */}
      <div className="flex-1 flex">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                    <div
                      className={`
                        conversation-message
                        ${message.type === 'user' 
                          ? 'bg-foreground text-background' 
                          : message.type === 'system'
                          ? 'bg-muted/30 text-muted-foreground border-dashed'
                          : 'bg-card'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-60">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {getMessageIcon(message)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 p-6 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t(texts.placeholder)}
                    disabled={isProcessing}
                    className="min-h-[44px] border-border/50 focus:border-foreground"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isProcessing}
                  size="sm"
                  className="bg-foreground text-background hover:bg-foreground/90 px-6"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t(texts.send)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-border/50 bg-muted/30 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Session Info</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Messages</span>
                  <span className="text-foreground">{messages.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Agent Status</span>
                  <Badge variant="outline" className="text-xs">
                    {isProcessing ? 'Processing' : 'Ready'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Documents</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded border border-border/50">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Sample document.pdf</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationAnalysis;