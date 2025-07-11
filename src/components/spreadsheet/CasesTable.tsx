import { useNavigate } from 'react-router-dom';
import { useCasesTable } from '@/hooks/useCasesTable';
import { BatchActionsBar } from './BatchActionsBar';
import { CasesTableHeader } from './CasesTableHeader';
import { CasesTableRow } from './CasesTableRow';

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

interface CasesTableProps {
  cases: Case[];
  onCasesUpdate?: (cases: Case[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const CasesTable = ({ cases, onCasesUpdate, onSelectionChange }: CasesTableProps) => {
  const navigate = useNavigate();
  
  const {
    selectedCases,
    isProcessingBatch,
    editingCell,
    isAllSelected,
    isPartiallySelected,
    setSelectedCases,
    setEditingCell,
    handleSelectAll,
    handleSelectCase,
    handleBatchAction,
    handleCellEdit
  } = useCasesTable({ cases, onCasesUpdate, onSelectionChange });

  const handleViewCase = (case_: Case) => {
    if (case_.type === 'APE' || case_.type === 'BAG') {
      navigate('/ape-bag-analyst');
    } else if (case_.type === 'Auto') {
      navigate('/claims-dashboard');
    } else {
      navigate('/live', { state: { caseId: case_.id } });
    }
  };

  return (
    <div className="space-y-4">
      <BatchActionsBar
        selectedCases={selectedCases}
        cases={cases}
        isProcessingBatch={isProcessingBatch}
        onBatchAction={handleBatchAction}
        onClearSelection={() => setSelectedCases([])}
        onCasesUpdate={onCasesUpdate}
      />

      <div className="border border-border/40 rounded-lg bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <CasesTableHeader
              isAllSelected={isAllSelected}
              isPartiallySelected={isPartiallySelected}
              onSelectAll={handleSelectAll}
            />
            <tbody>
              {cases.map((case_) => (
                <CasesTableRow
                  key={case_.id}
                  case_={case_}
                  isSelected={selectedCases.includes(case_.id)}
                  editingCell={editingCell}
                  onSelectCase={handleSelectCase}
                  onCellEdit={handleCellEdit}
                  onSetEditingCell={setEditingCell}
                  onViewCase={handleViewCase}
                />
              ))}
            </tbody>
          </table>
          
          {cases.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>Nenhum caso encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};