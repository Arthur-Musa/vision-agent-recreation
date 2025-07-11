import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, UserCheck } from 'lucide-react';
import { AgentTaskAssigner } from './AgentTaskAssigner';

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

interface BatchActionsBarProps {
  selectedCases: string[];
  cases: Case[];
  isProcessingBatch: boolean;
  onBatchAction: (action: 'approve' | 'reject' | 'review' | 'reassign') => void;
  onClearSelection: () => void;
  onCasesUpdate?: (cases: Case[]) => void;
}

export const BatchActionsBar = ({ 
  selectedCases, 
  cases, 
  isProcessingBatch, 
  onBatchAction, 
  onClearSelection,
  onCasesUpdate 
}: BatchActionsBarProps) => {
  if (selectedCases.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedCases.length} caso{selectedCases.length > 1 ? 's' : ''} selecionado{selectedCases.length > 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar seleção
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBatchAction('approve')}
            disabled={isProcessingBatch}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Check className="h-3 w-3 mr-1" />
            Aprovar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBatchAction('reject')}
            disabled={isProcessingBatch}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" />
            Rejeitar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBatchAction('review')}
            disabled={isProcessingBatch}
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Revisão
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBatchAction('reassign')}
            disabled={isProcessingBatch}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            Reatribuir
          </Button>
          <AgentTaskAssigner
            selectedCases={cases.filter(c => selectedCases.includes(c.id))}
            onAssignmentComplete={() => {
              onClearSelection();
              // Trigger data refresh
              const savedCases = localStorage.getItem('olga_spreadsheet_cases');
              if (savedCases && onCasesUpdate) {
                onCasesUpdate(JSON.parse(savedCases));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};