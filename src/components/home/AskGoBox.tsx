import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Globe, 
  MessageCircle
} from "lucide-react";

interface AskGoBoxProps {
  userName: string;
  getTimeGreeting: () => string;
}

const AskGoBox = ({ userName, getTimeGreeting }: AskGoBoxProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [askGoQuery, setAskGoQuery] = useState('');

  const handleAskGo = () => {
    if (!askGoQuery.trim()) {
      toast({
        title: "Digite sua solicitação",
        description: "Descreva o que você precisa para começar.",
        variant: "destructive"
      });
      return;
    }

    // Redireciona para Claims Processing com a query
    navigate('/claims-processing', { state: { initialQuery: askGoQuery } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAskGo();
    }
  };

  return (
    <>
      {/* Greeting */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light mb-2 text-foreground">
          {getTimeGreeting()}, {userName}
        </h1>
        <p className="text-xl text-muted-foreground font-light">
          O que você gostaria de fazer hoje?
        </p>
      </div>

      {/* Ask Go Box */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card className="gradient-hero border border-border/50 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Input
                  role="search"
                  placeholder="Ask Go..."
                  value={askGoQuery}
                  onChange={(e) => setAskGoQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-0 bg-background/50 backdrop-blur-sm text-lg placeholder:text-muted-foreground focus-visible:ring-0 h-12"
                />
              </div>
              <Button onClick={handleAskGo} size="lg" className="px-8">
                →
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/live')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Job
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/agent-builder')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar Agente
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/claims')}
                  className="gap-2"
                >
                  <Globe className="h-4 w-4" />
                  Cases
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/live')}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Concierge
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/live')}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AskGoBox;