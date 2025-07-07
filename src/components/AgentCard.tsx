import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Zap } from "lucide-react";
import { InsuranceAgent } from "../types/agents";
import { useLanguage } from "../hooks/useLanguage";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: InsuranceAgent;
  onSelect: (agent: InsuranceAgent) => void;
}

export const AgentCard = ({ agent, onSelect }: AgentCardProps) => {
  const { t } = useLanguage();

  const complexityColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  const complexityLabels = {
    low: { 'pt-BR': 'Simples', 'pt': 'Simples', 'en': 'Simple' },
    medium: { 'pt-BR': 'Médio', 'pt': 'Médio', 'en': 'Medium' },
    high: { 'pt-BR': 'Complexo', 'pt': 'Complexo', 'en': 'Complex' }
  };

  return (
    <Card className={cn(
      "agent-card agent-card-gradient",
      agent.category,
      "group cursor-pointer"
    )} onClick={() => onSelect(agent)}>
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{t(agent.name)}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {t(agent.description)}
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className={cn("ml-2", complexityColors[agent.complexityLevel])}
          >
            {t(complexityLabels[agent.complexityLevel])}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="space-y-4">
          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {agent.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {t(feature)}
              </Badge>
            ))}
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{agent.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{agent.documentTypes.length} tipos</span>
            </div>
          </div>

          {/* Use case */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {t(agent.useCase)}
          </p>

          {/* Action button */}
          <Button 
            className="w-full group-hover:shadow-lg transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(agent);
            }}
          >
            <Zap className="h-4 w-4 mr-2" />
            {t({ 'pt-BR': 'Usar Agent', 'pt': 'Usar Agent', 'en': 'Use Agent' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};