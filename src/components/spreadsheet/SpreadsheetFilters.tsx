import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SpreadsheetFiltersProps {
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const SpreadsheetFilters = ({
  searchTerm,
  filterStatus,
  onSearchChange,
  onStatusChange
}: SpreadsheetFiltersProps) => {
  return (
    <div className="mb-4 p-3 border border-border/40 rounded-lg bg-muted/20">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-8 text-sm border-border/40 bg-background"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-2 py-1 text-sm border border-border/40 rounded bg-background text-muted-foreground"
          >
            <option value="all">Todos</option>
            <option value="completed">Concluído</option>
            <option value="processing">Processando</option>
            <option value="pending">Pendente</option>
            <option value="flagged">Sinalizado</option>
          </select>
        </div>
      </div>
    </div>
  );
};