import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConciergeRequest, ConciergeResponse, Citation } from "@/types/workflow";
import { Send, Bot, User, FileText, ExternalLink, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

// Normalize monetary strings like "1.234,56" or "1,234.56"
const normalizeMoney = (s: string) => {
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }
  return parseFloat(s);
};

interface ConciergeChatProps {
  onAgentSuggestion?: (agentId: string) => void;
  onDataExtraction?: (data: Record<string, any>) => void;
}

export const ConciergeChat: React.FC<ConciergeChatProps> = ({
  onAgentSuggestion,
  onDataExtraction
}) => {
  const [messages, setMessages] = useState<(ConciergeRequest | ConciergeResponse)[]>([
    {
      id: 'welcome',
      requestId: 'welcome',
      message: 'Hi! I\'m your insurance analysis concierge. Upload documents or ask me questions about claims, and I\'ll route them to the most appropriate specialist agent.',
      confidence: 1.0,
      timestamp: new Date().toISOString()
    } as ConciergeResponse
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

    const request: ConciergeRequest = {
      id: Date.now().toString(),
      message: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, request]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate concierge processing
    setTimeout(() => {
      const response: ConciergeResponse = {
        id: (Date.now() + 1).toString(),
        requestId: request.id,
        message: generateConciergeResponse(request.message),
        suggestedAgent: getSuggestedAgent(request.message),
        extractedData: extractDataFromMessage(request.message),
        confidence: 0.87,
        citations: generateCitations(request.message),
        nextActions: generateNextActions(request.message),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, response]);
      setIsProcessing(false);

      // Trigger callbacks
      if (response.suggestedAgent && onAgentSuggestion) {
        onAgentSuggestion(response.suggestedAgent);
      }
      if (response.extractedData && onDataExtraction) {
        onDataExtraction(response.extractedData);
      }
    }, 1500);
  };

  const generateConciergeResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sinistro') || lowerMessage.includes('claim')) {
      return "I've identified this as a claims-related request. Based on the content, I recommend using our Claims Triage Agent for initial processing. This agent specializes in document analysis, damage assessment, and fraud detection.";
    }
    
    if (lowerMessage.includes('fraude') || lowerMessage.includes('fraud')) {
      return "This appears to be a fraud-related inquiry. I'll route this to our Fraud Detection Agent, which uses advanced pattern recognition to identify suspicious activities and inconsistencies in documentation.";
    }
    
    if (lowerMessage.includes('apólice') || lowerMessage.includes('policy')) {
      return "This looks like a policy-related question. Our Underwriting Agent would be best suited for this task, as it specializes in risk assessment, policy terms analysis, and coverage evaluation.";
    }
    
    return "I've analyzed your request and will route it to the most appropriate specialist agent. The recommended agent has been selected based on the content and context of your message.";
  };

  const getSuggestedAgent = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sinistro') || lowerMessage.includes('claim')) {
      return 'claims-processor';
    }
    if (lowerMessage.includes('fraude') || lowerMessage.includes('fraud')) {
      return 'fraud-detector';
    }
    if (lowerMessage.includes('apólice') || lowerMessage.includes('policy')) {
      return 'underwriting-agent';
    }
    
    return 'claims-processor'; // Default
  };

  const extractDataFromMessage = (message: string): Record<string, any> => {
    // Simple extraction logic - in real implementation this would be more sophisticated
    const data: Record<string, any> = {};
    
    const valueMatch = message.match(/R\$\s*([\d.,]+)/);
    if (valueMatch) {
      data.estimatedValue = normalizeMoney(valueMatch[1]);
    }
    
    if (message.toLowerCase().includes('auto')) {
      data.claimType = 'Automotivo';
    } else if (message.toLowerCase().includes('residencial')) {
      data.claimType = 'Residencial';
    }
    
    return Object.keys(data).length > 0 ? data : {};
  };

  const generateCitations = (message: string): Citation[] => {
    // Mock citations - in real implementation these would come from document analysis
    return [
      {
        text: "Insurance policy terms and conditions",
        source: "policy_document.pdf",
        page: 1,
        confidence: 0.92
      }
    ];
  };

  const generateNextActions = (message: string): string[] => {
    return [
      "Review extracted data",
      "Upload additional documents if needed",
      "Proceed with specialist agent analysis"
    ];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isRequest = 'files' in message;
          const response = !isRequest ? message as ConciergeResponse : null;
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex",
                isRequest ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[80%] flex gap-3",
                isRequest ? "flex-row-reverse" : "flex-row"
              )}>
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  isRequest ? "bg-foreground text-background" : "bg-muted"
                )}>
                  {isRequest ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Content */}
                <Card className={cn(
                  "flex-1",
                  isRequest && "bg-foreground text-background border-foreground"
                )}>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    
                    {/* Response-specific content */}
                    {response && (
                      <div className="mt-3 space-y-3">
                        {/* Confidence */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Confidence: {Math.round(response.confidence * 100)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Suggested Agent */}
                        {response.suggestedAgent && (
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-500" />
                            <Badge variant="outline" className="text-xs">
                              Suggested: {response.suggestedAgent}
                            </Badge>
                          </div>
                        )}

                        {/* Extracted Data */}
                        {response.extractedData && Object.keys(response.extractedData).length > 0 && (
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-xs font-medium mb-1">Extracted Data:</p>
                            {Object.entries(response.extractedData).map(([key, value]) => (
                              <div key={key} className="text-xs flex justify-between">
                                <span className="text-muted-foreground">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Citations */}
                        {response.citations && response.citations.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Sources:</p>
                            {response.citations.map((citation, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{citation.source}</span>
                                {citation.page && (
                                  <span className="text-muted-foreground">p.{citation.page}</span>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(citation.confidence * 100)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Next Actions */}
                        {response.nextActions && response.nextActions.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Next Steps:</p>
                            <ul className="text-xs space-y-1">
                              {response.nextActions.map((action, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-current rounded-full"></span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about claims, upload documents, or describe what you need..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};