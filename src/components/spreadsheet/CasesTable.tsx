import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Check, X, RotateCcw, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
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

interface CasesTableProps {
  cases: Case[];
  onCasesUpdate?: (cases: Case[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const CasesTable = ({ cases, onCasesUpdate, onSelectionChange }: CasesTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null);

  // Limpar seleção quando cases mudam
  useEffect(() => {
    setSelectedCases([]);
    onSelectionChange?.([]);
  }, [cases, onSelectionChange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-600 border-green-200';
      case 'flagged': return 'bg-red-50 text-red-600 border-red-200';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'flagged': return 'Sinalizado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'APE': return '🩺';
      case 'BAG': return '🧳';
      case 'Auto': return '🚗';
      case 'Residencial': return '🏠';
      case 'Vida': return '❤️';
      default: return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funções de seleção
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

  const isAllSelected = selectedCases.length === cases.length && cases.length > 0;
  const isPartiallySelected = selectedCases.length > 0 && selectedCases.length < cases.length;

  // Ações em massa
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

  // Edição inline
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

  const handleViewCase = (case_: Case) => {
    if (case_.type === 'APE' || case_.type === 'BAG') {
      navigate('/ape-bag-analyst');
    } else if (case_.type === 'Auto') {
      navigate('/claims-dashboard');
    } else {
      navigate('/live', { state: { caseId: case_.id } });
    }
  };

  const availableAgents = ['Claims Processor', 'Aura', 'Fraud Detector'];
  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'processing', label: 'Processando' },
    { value: 'completed', label: 'Concluído' },
    { value: 'flagged', label: 'Sinalizado' }
  ];

  return (
    <div className="space-y-4">
      {/* Barra de ações em massa */}
      {selectedCases.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedCases.length} caso{selectedCases.length > 1 ? 's' : ''} selecionado{selectedCases.length > 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCases([])}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar seleção
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchAction('approve')}
                disabled={isProcessingBatch}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Check className="h-3 w-3 mr-1" />
                Aprovar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchAction('reject')}
                disabled={isProcessingBatch}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-3 w-3 mr-1" />
                Rejeitar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchAction('review')}
                disabled={isProcessingBatch}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Revisão
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchAction('reassign')}
                disabled={isProcessingBatch}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Reatribuir
              </Button>
              <AgentTaskAssigner
                selectedCases={cases.filter(c => selectedCases.includes(c.id))}
                onAssignmentComplete={() => {
                  setSelectedCases([]);
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
      )}

      {/* Tabela */}
      <div className="border border-border/40 rounded-lg bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/40">
              <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                <th className="text-left px-3 py-2 font-medium w-10">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
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
            <tbody>
              {cases.map((case_) => (
                  <tr 
                  key={case_.id} 
                  className={`border-b border-border/20 hover:bg-muted/30 transition-colors ${
                    selectedCases.includes(case_.id) ? 'bg-primary/10 border-primary/30' : ''
                  }`}
                >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selectedCases.includes(case_.id)}
                      onCheckedChange={(checked) => {
                        console.log('🔄 Checkbox mudou:', { caseId: case_.id, checked });
                        handleSelectCase(case_.id, checked as boolean);
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
                        onValueChange={(value) => handleCellEdit(case_.id, 'status', value)}
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
                        onClick={() => setEditingCell({ id: case_.id, field: 'status' })}
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
                        onValueChange={(value) => handleCellEdit(case_.id, 'agent', value)}
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
                        onClick={() => setEditingCell({ id: case_.id, field: 'agent' })}
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
                      onClick={() => handleViewCase(case_)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
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