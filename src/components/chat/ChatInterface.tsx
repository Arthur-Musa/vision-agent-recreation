import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, Bot, User, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { DocumentUploader } from '@/components/upload/DocumentUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { chatService, ChatAnalysisResult } from '@/services/chatService';

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

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou a Olga, sua assistente especializada em seguros. Como posso ajudar você hoje?',
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

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Use o serviço real de chat
      const response = await chatService.processUserMessage(currentMessage);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions,
        analysis: response.analysis
      };

      setMessages(prev => [...prev, assistantMessage]);
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
      // Usa o serviço real de chat com arquivos
      const response = await chatService.processUserMessage('Analisar documentos anexados', files);
      
      const analysisMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        analysis: response.analysis,
        suggestions: response.suggestions
      };

      setMessages(prev => [
        ...prev.map(msg => 
          msg.id === fileMessage.id 
            ? { ...msg, status: 'completed' as const }
            : msg
        ),
        analysisMessage
      ]);
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

      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
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
      </div>
    </div>
  );
};