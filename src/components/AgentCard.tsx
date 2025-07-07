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
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-border/50 bg-card hover:bg-card/80"
      onClick={() => onSelect(agent)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
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
          <div>
            <h3 className="font-medium text-base mb-2">{t(agent.name)}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {t(agent.description)}
            </p>
          </div>

          {/* Meta info - simplified */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{agent.estimatedTime}</span>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs border-current/20"
            >
              {t(complexityLabels[agent.complexityLevel])}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};