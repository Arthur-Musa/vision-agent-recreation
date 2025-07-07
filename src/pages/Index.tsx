import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "../components/AgentCard";
import { CategoryFilter } from "../components/CategoryFilter";
import { LanguageSelector } from "../components/LanguageSelector";
import { insuranceAgents } from "../data/insuranceAgents";
import { AgentCategory, InsuranceAgent } from "../types/agents";
import { useLanguage } from "../hooks/useLanguage";
import { Search, Bot, Shield, Zap, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
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
    toast({
      title: t({ 'pt-BR': 'Agent Selecionado', 'pt': 'Agent Selecionado', 'en': 'Agent Selected' }),
      description: t({ 
        'pt-BR': `Você selecionou ${t(agent.name)}. Esta funcionalidade será implementada em breve.`,
        'pt': `Você selecionou ${t(agent.name)}. Esta funcionalidade será implementada em breve.`,
        'en': `You selected ${t(agent.name)}. This functionality will be implemented soon.`
      }),
    });
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-foreground rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-background rounded-full"></div>
              </div>
              <h1 className="text-2xl olga-logo text-foreground">Olga</h1>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section - V7Labs Style */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light mb-4 text-foreground tracking-tight">
              Bom dia
            </h1>
            <p className="text-xl text-muted-foreground mb-8 font-light">
              O que você gostaria de fazer hoje?
            </p>
          </div>

          {/* Chat Input */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Descreva o que você precisa ou faça upload de documentos..."
                    className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                  />
                </div>
                <Button size="lg" className="rounded-full px-6">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <span>Apólices</span>
                <span>Sinistros</span>
                <span>Jurídico</span>
                <span>Atendimento</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t(heroTexts.searchPlaceholder)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Agents Grid - V7Labs Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onSelect={handleAgentSelect}
            />
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
