import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AgentCard } from "../components/AgentCard";
import { CategoryFilter } from "../components/CategoryFilter";
import { LanguageSelector } from "../components/LanguageSelector";
import { insuranceAgents } from "../data/insuranceAgents";
import { AgentCategory, InsuranceAgent } from "../types/agents";
import { useLanguage } from "../hooks/useLanguage";
import { Search, Bot, Shield, Zap, Users, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { conciergeOrchestrator } from "../services/conciergeOrchestrator";

const Index = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = insuranceAgents.filter(agent => {
    const categoryMatch = selectedCategory === 'all' || agent.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
      t(agent.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(agent.description).toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const handleAgentSelect = (agent: InsuranceAgent) => {
    navigate(`/agent/${agent.id}`);
  };

  const handleConciergeQuery = async (query: string) => {
    try {
      toast({
        title: "Analisando sua solicitação...",
        description: "O concierge está processando e acionando os agentes especializados.",
      });

      // Processa com o orquestrador
      const response = await conciergeOrchestrator.processQuery(query);
      
      if (response.success) {
        toast({
          title: "Análise concluída",
          description: response.message,
        });

        // Redireciona conforme a decisão do concierge
        if (response.redirectTo) {
          if (response.redirectTo === '/upload') {
            navigate('/upload', { 
              state: { 
                initialQuery: query,
                context: response.context 
              } 
            });
          } else {
            navigate(response.redirectTo, { 
              state: { 
                query: query,
                context: response.context,
                extractedData: response.context.extractedData
              } 
            });
          }
        }
      } else {
        toast({
          title: "Erro na análise",
          description: "Não foi possível processar sua solicitação.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha no sistema de concierge.",
        variant: "destructive"
      });
    }
  };

  const heroTexts = {
    title: { 'pt-BR': 'Explore nossa biblioteca de Agents de IA', 'pt': 'Explore nossa biblioteca de Agents de IA', 'en': 'Explore our AI Agent Library' },
    subtitle: { 'pt-BR': 'Projetados por especialistas. Prontos para usar.', 'pt': 'Projetados por especialistas. Prontos para usar.', 'en': 'Designed by experts. Ready to use.' },
    description: { 
      'pt-BR': 'Use agents especializados de IA e entregue valor mensurável desde o primeiro dia. Automatize tarefas que anteriormente exigiam 100+ horas de trabalho manual da sua equipe.',
      'pt': 'Use agents especializados de IA e entregue valor mensurável desde o primeiro dia. Automatize tarefas que anteriormente exigiam 100+ horas de trabalho manual da sua equipe.',
      'en': 'Use specialized AI agents and deliver measurable value from day one. Automate tasks that previously required 100+ hours of your team\'s manual work.'
    },
    searchPlaceholder: { 'pt-BR': 'Pesquisar agents...', 'pt': 'Pesquisar agents...', 'en': 'Search agents...' }
  };

  const statsData = [
    {
      icon: <Bot className="h-6 w-6" />,
      value: `${insuranceAgents.length}+`,
      label: { 'pt-BR': 'Agents Especializados', 'pt': 'Agents Especializados', 'en': 'Specialized Agents' }
    },
    {
      icon: <Shield className="h-6 w-6" />,
      value: '99.9%',
      label: { 'pt-BR': 'Precisão', 'pt': 'Precisão', 'en': 'Accuracy' }
    },
    {
      icon: <Zap className="h-6 w-6" />,
      value: '10x',
      label: { 'pt-BR': 'Mais Rápido', 'pt': 'Mais Rápido', 'en': 'Faster Processing' }
    },
    {
      icon: <Users className="h-6 w-6" />,
      value: '100+',
      label: { 'pt-BR': 'Horas Economizadas', 'pt': 'Horas Economizadas', 'en': 'Hours Saved' }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-foreground rounded-full flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-background rounded-full"></div>
              </div>
              <h1 className="text-xl sm:text-2xl olga-logo text-foreground">Olga</h1>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section - V7Labs Style */}
      <section className="py-8 sm:py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 text-foreground tracking-tight">
              Bom dia
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 font-light px-4">
              O que você gostaria de fazer hoje?
            </p>
          </div>

          {/* Chat Input */}
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
            <div className="bg-card rounded-2xl border shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Descreva o que você precisa ou faça upload de documentos..."
                    className="border-0 bg-transparent text-sm sm:text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchTerm.trim()) {
                        handleConciergeQuery(searchTerm);
                      }
                    }}
                  />
                </div>
                <Button 
                  size="lg" 
                  className="rounded-full px-6 w-full sm:w-auto" 
                  onClick={() => {
                    if (searchTerm.trim()) {
                      handleConciergeQuery(searchTerm);
                    } else {
                      navigate('/upload');
                    }
                  }}
                >
                  <Search className="h-5 w-5 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Iniciar</span>
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6 mt-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <span>Apólices</span>
                  <span>Sinistros</span>
                  <span>Jurídico</span>
                  <span>Atendimento</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/chat')}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat Conversacional</span>
                  <span className="sm:hidden">Chat</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8">
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t(heroTexts.searchPlaceholder)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 sm:h-12 text-sm sm:text-lg"
            />
          </div>
          
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Agents Grid - V7Labs Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} onClick={() => navigate(`/agent/${agent.id}`)}>
              <AgentCard 
                agent={agent} 
                onSelect={handleAgentSelect}
              />
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-4 h-4 bg-muted-foreground/30 rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t({ 'pt-BR': 'Nenhum agent encontrado', 'pt': 'Nenhum agent encontrado', 'en': 'No agents found' })}
            </h3>
            <p className="text-muted-foreground">
              {t({ 
                'pt-BR': 'Tente ajustar seus filtros ou termo de pesquisa.',
                'pt': 'Tente ajustar seus filtros ou termo de pesquisa.',
                'en': 'Try adjusting your filters or search term.'
              })}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Olga Insurance Platform. {t({ 'pt-BR': 'Todos os direitos reservados.', 'pt': 'Todos os direitos reservados.', 'en': 'All rights reserved.' })}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
