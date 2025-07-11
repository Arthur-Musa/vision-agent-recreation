import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

interface UseCasesTableProps {
  cases: Case[];
  onCasesUpdate?: (cases: Case[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const useCasesTable = ({ cases, onCasesUpdate, onSelectionChange }: UseCasesTableProps) => {
  const { toast } = useToast();
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null);

  // Limpar seleção quando cases mudam
  useEffect(() => {
    setSelectedCases([]);
    onSelectionChange?.([]);
  }, [cases, onSelectionChange]);

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? cases.map(c => c.id) : [];
    setSelectedCases(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectCase = (caseId: string, checked: boolean) => {
    console.log('📌 Selecionando caso:', { caseId, checked, currentSelection: selectedCases });
    const newSelection = checked 
      ? [...selectedCases, caseId]
      : selectedCases.filter(id => id !== caseId);
    console.log('📌 Nova seleção:', newSelection);
    setSelectedCases(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleBatchAction = async (action: 'approve' | 'reject' | 'review' | 'reassign') => {
    if (selectedCases.length === 0) return;

    setIsProcessingBatch(true);
    
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedCases = cases.map(case_ => {
        if (selectedCases.includes(case_.id)) {
          let newStatus = case_.status;
          switch (action) {
            case 'approve':
              newStatus = 'completed';
              break;
            case 'reject':
              newStatus = 'flagged';
              break;
            case 'review':
              newStatus = 'pending';
              break;
            case 'reassign':
              newStatus = 'processing';
              break;
          }
          return { ...case_, status: newStatus };
        }
        return case_;
      });

      // Salvar no localStorage
      localStorage.setItem('olga_spreadsheet_cases', JSON.stringify(updatedCases));
      
      // Notificar parent component se disponível
      onCasesUpdate?.(updatedCases);

      // Mostrar toast
      const actionMessages = {
        approve: 'aprovados',
        reject: 'rejeitados', 
        review: 'enviados para revisão',
        reassign: 'reatribuídos'
      };

      toast({
        title: "Ação em massa executada",
        description: `${selectedCases.length} casos ${actionMessages[action]} com sucesso.`,
      });

      setSelectedCases([]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar ação em massa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleCellEdit = async (caseId: string, field: string, value: string) => {
    try {
      const updatedCases = cases.map(case_ => 
        case_.id === caseId ? { ...case_, [field]: value } : case_
      );

      // Salvar no localStorage
      localStorage.setItem('olga_spreadsheet_cases', JSON.stringify(updatedCases));
      
      // Notificar parent component
      onCasesUpdate?.(updatedCases);
      
      setEditingCell(null);
      
      toast({
        title: "Campo atualizado",
        description: `${field === 'status' ? 'Status' : 'Responsável'} alterado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar campo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const isAllSelected = selectedCases.length === cases.length && cases.length > 0;
  const isPartiallySelected = selectedCases.length > 0 && selectedCases.length < cases.length;

  return {
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
  };
};