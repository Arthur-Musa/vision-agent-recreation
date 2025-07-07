import { Button } from "@/components/ui/button";
import { AgentCategory } from "../types/agents";
import { agentCategories } from "../data/insuranceAgents";
import { useLanguage } from "../hooks/useLanguage";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: AgentCategory | 'all';
  onCategoryChange: (category: AgentCategory | 'all') => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { t } = useLanguage();

  const allLabel = { 'pt-BR': 'Todos', 'pt': 'Todos', 'en': 'All' };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onCategoryChange('all')}
        size="sm"
        className={cn(
          "transition-all duration-300 text-xs sm:text-sm",
          selectedCategory === 'all' && "gradient-hero text-white border-none"
        )}
      >
        {t(allLabel)}
      </Button>
      
      {agentCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id)}
          size="sm"
          className={cn(
            "transition-all duration-300 text-xs sm:text-sm",
            selectedCategory === category.id && [
              category.gradient,
              "text-white border-none"
            ]
          )}
        >
          {t(category.name)}
        </Button>
      ))}
    </div>
  );
};