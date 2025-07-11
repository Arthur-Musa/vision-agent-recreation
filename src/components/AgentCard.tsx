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
    low: "badge-status-active",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
  };

  const complexityLabels = {
    low: { 'pt-BR': 'Simples', 'pt': 'Simples', 'en': 'Simple' },
    medium: { 'pt-BR': 'Médio', 'pt': 'Médio', 'en': 'Medium' },
    high: { 'pt-BR': 'Complexo', 'pt': 'Complexo', 'en': 'Complex' }
  };

  return (
    <Card 
      className="card-interactive"
      onClick={() => onSelect(agent)}
    >
      <CardContent className="spacing-lg">
        <div className="flex flex-col items-center text-center spacing-stack-md">
          {/* Minimalist gradient icon inspired by V7Labs */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            `gradient-${agent.category}`
          )}>
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Agent name */}
          <div className="text-center spacing-stack-xs">
            <h3 className="text-heading-3">{t(agent.name)}</h3>
            <p className="text-body-sm text-muted-foreground line-clamp-2">
              {t(agent.description)}
            </p>
          </div>

          {/* Meta info - simplified */}
          <div className="flex items-center gap-3 text-caption">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{agent.estimatedTime}</span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-caption ${complexityColors[agent.complexityLevel]}`}
            >
              {t(complexityLabels[agent.complexityLevel])}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};