import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { InsuranceAgent, DocumentUpload } from "@/types/agents";
import { insuranceAgents } from "@/data/insuranceAgents";
import { CategoryFilter } from "@/components/CategoryFilter";
import { AgentCategory } from "@/types/agents";
import { Search, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentSelectorProps {
  files: DocumentUpload[];
  onAgentSelected: (agent: InsuranceAgent) => void;
  onBack: () => void;
}

export const AgentSelector = ({ files, onAgentSelected, onBack }: AgentSelectorProps) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<InsuranceAgent | null>(null);

  const filteredAgents = insuranceAgents.filter(agent => {
    const categoryMatch = selectedCategory === 'all' || agent.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
      t(agent.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(agent.description).toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const getRecommendedAgents = () => {
    // Simple recommendation based on file types
    const fileTypes = files.map(f => f.type.toLowerCase());
    const hasImages = fileTypes.some(type => type.includes('image'));
    const hasPDF = fileTypes.some(type => type.includes('pdf'));
    
    if (hasImages && hasPDF) {
      return ['claims-processor', 'fraud-detector'];
    }
    if (hasPDF) {
      return ['contract-reviewer', 'policy-analyzer'];
    }
    return ['claims-processor'];
  };

  const recommendedIds = getRecommendedAgents();

  const texts = {
    title: { 'pt-BR': 'Selecionar Agent de IA', 'pt': 'Selecionar Agent de IA', 'en': 'Select AI Agent' },
    subtitle: { 'pt-BR': 'Escolha o agent mais adequado para seus documentos', 'pt': 'Escolha o agent mais adequado para seus documentos', 'en': 'Choose the most suitable agent for your documents' },
    recommended: { 'pt-BR': 'Recomendado', 'pt': 'Recomendado', 'en': 'Recommended' },
    searchPlaceholder: { 'pt-BR': 'Pesquisar agents...', 'pt': 'Pesquisar agents...', 'en': 'Search agents...' },
    select: { 'pt-BR': 'Selecionar', 'pt': 'Selecionar', 'en': 'Select' },
    selected: { 'pt-BR': 'Selecionado', 'pt': 'Selecionado', 'en': 'Selected' },
    continue: { 'pt-BR': 'Continuar', 'pt': 'Continuar', 'en': 'Continue' },
    back: { 'pt-BR': 'Voltar', 'pt': 'Voltar', 'en': 'Back' },
    filesUploaded: { 'pt-BR': 'arquivos carregados', 'pt': 'arquivos carregados', 'en': 'files uploaded' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-medium mb-2">{t(texts.title)}</h2>
        <p className="text-muted-foreground">{t(texts.subtitle)}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {files.length} {t(texts.filesUploaded)}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t(texts.searchPlaceholder)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Agent Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const isRecommended = recommendedIds.includes(agent.id);
          const isSelected = selectedAgent?.id === agent.id;
          
          return (
            <Card 
              key={agent.id}
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-lg",
                isSelected && "ring-2 ring-primary",
                isRecommended && "border-primary/50"
              )}
              onClick={() => setSelectedAgent(agent)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Agent Icon */}
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      `gradient-${agent.category}`
                    )}>
                      <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {isRecommended && (
                      <Badge variant="secondary" className="text-xs">
                        {t(texts.recommended)}
                      </Badge>
                    )}
                  </div>

                  {/* Agent Info */}
                  <div>
                    <h3 className="font-medium text-base mb-2">{t(agent.name)}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {t(agent.description)}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{agent.estimatedTime}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {agent.complexityLevel}
                    </Badge>
                  </div>

                  {/* Select Button */}
                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAgent(agent);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        {t(texts.selected)}
                      </>
                    ) : (
                      t(texts.select)
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          {t(texts.back)}
        </Button>
        
        {selectedAgent && (
          <Button onClick={() => onAgentSelected(selectedAgent)}>
            {t(texts.continue)}
          </Button>
        )}
      </div>
    </div>
  );
};