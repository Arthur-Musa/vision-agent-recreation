import { Checkbox } from '@/components/ui/checkbox';

interface CasesTableHeaderProps {
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const CasesTableHeader = ({ isAllSelected, isPartiallySelected, onSelectAll }: CasesTableHeaderProps) => {
  return (
    <thead className="border-b border-border/40">
      <tr className="text-xs text-muted-foreground uppercase tracking-wide">
        <th className="text-left px-3 py-2 font-medium w-10">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            data-state={isPartiallySelected ? "indeterminate" : undefined}
            aria-label="Selecionar todos"
          />
        </th>
        <th className="text-left px-3 py-2 font-medium">Tipo</th>
        <th className="text-left px-3 py-2 font-medium">Sinistro</th>
        <th className="text-left px-3 py-2 font-medium">Segurado</th>
        <th className="text-left px-3 py-2 font-medium">Status</th>
        <th className="text-left px-3 py-2 font-medium">Valor</th>
        <th className="text-left px-3 py-2 font-medium">Agente</th>
        <th className="text-left px-3 py-2 font-medium">Data</th>
        <th className="text-left px-3 py-2 font-medium w-12"></th>
      </tr>
    </thead>
  );
};