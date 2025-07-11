import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import { 
  getStatusColor, 
  getStatusText, 
  getTypeIcon, 
  formatCurrency, 
  formatDate, 
  availableAgents,
  statusOptions 
} from '@/lib/caseUtils';

interface Case {
  id: string;
  claimNumber: string;
  type: string;
  status: string;
  agent: string;
  processedAt: string;
  insuredName: string;
  estimatedAmount: number;
}

interface CasesTableRowProps {
  case_: Case;
  isSelected: boolean;
  editingCell: {id: string, field: string} | null;
  onSelectCase: (caseId: string, checked: boolean) => void;
  onCellEdit: (caseId: string, field: string, value: string) => void;
  onSetEditingCell: (editingCell: {id: string, field: string} | null) => void;
  onViewCase: (case_: Case) => void;
}

export const CasesTableRow = ({ 
  case_, 
  isSelected, 
  editingCell, 
  onSelectCase, 
  onCellEdit, 
  onSetEditingCell, 
  onViewCase 
}: CasesTableRowProps) => {
  return (
    <tr 
      className={`border-b border-border/20 hover:bg-muted/30 transition-colors ${
        isSelected ? 'bg-primary/10 border-primary/30' : ''
      }`}
    >
      <td className="px-3 py-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            console.log('🔄 Checkbox mudou:', { caseId: case_.id, checked });
            onSelectCase(case_.id, checked as boolean);
          }}
          aria-label={`Selecionar caso ${case_.claimNumber}`}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{getTypeIcon(case_.type)}</span>
          <span className="text-xs font-medium text-muted-foreground">{case_.type}</span>
        </div>
      </td>
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{case_.claimNumber}</td>
      <td className="px-3 py-2 text-sm">{case_.insuredName}</td>
      <td className="px-3 py-2">
        {editingCell?.id === case_.id && editingCell?.field === 'status' ? (
          <Select 
            value={case_.status} 
            onValueChange={(value) => onCellEdit(case_.id, 'status', value)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge 
            variant="outline" 
            className={`text-xs cursor-pointer hover:opacity-80 ${getStatusColor(case_.status)}`}
            onClick={() => onSetEditingCell({ id: case_.id, field: 'status' })}
          >
            {getStatusText(case_.status)}
          </Badge>
        )}
      </td>
      <td className="px-3 py-2 text-sm font-medium">{formatCurrency(case_.estimatedAmount)}</td>
      <td className="px-3 py-2">
        {editingCell?.id === case_.id && editingCell?.field === 'agent' ? (
          <Select 
            value={case_.agent} 
            onValueChange={(value) => onCellEdit(case_.id, 'agent', value)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableAgents.map(agent => (
                <SelectItem key={agent} value={agent}>
                  {agent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span 
            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => onSetEditingCell({ id: case_.id, field: 'agent' })}
          >
            {case_.agent}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(case_.processedAt)}</td>
      <td className="px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewCase(case_)}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3 w-3" />
        </Button>
      </td>
    </tr>
  );
};