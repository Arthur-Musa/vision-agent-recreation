import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AskGoBox from "@/components/home/AskGoBox";
import AgentCards from "@/components/home/AgentCards";
import RecentCasesSection from "@/components/home/RecentCasesSection";

const Index = () => {
  const [userName] = useState('Ana'); // Mock user name
  const navigate = useNavigate();

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AskGoBox userName={userName} getTimeGreeting={getTimeGreeting} />
        
        {/* Botões de navegação para teste */}
        <div className="mb-8 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-4">🧪 Navegação para Testes</h3>
          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={() => navigate('/case/123')}
              variant="outline"
            >
              📋 Ir para Detalhes do Caso
            </Button>
            <Button 
              onClick={() => navigate('/cases')}
              variant="outline"  
            >
              📊 Ir para Lista de Casos
            </Button>
            <Button 
              onClick={() => navigate('/spreadsheets')}
              variant="outline"
            >
              📈 Ir para Planilha Inteligente
            </Button>
          </div>
        </div>
        
        <AgentCards />
        <RecentCasesSection />
      </div>
    </div>
  );
};

export default Index;