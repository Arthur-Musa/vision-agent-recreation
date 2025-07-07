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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Olga</h1>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {t(heroTexts.title)}
          </h1>
          <p className="text-xl mb-4 opacity-90">
            {t(heroTexts.subtitle)}
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-4xl mx-auto">
            {t(heroTexts.description)}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center justify-center mb-2 text-white/90">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{t(stat.label)}</div>
              </div>
            ))}
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

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
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
