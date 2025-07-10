import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

export const CasesTable = ({ cases }: CasesTableProps) => {
  const navigate = useNavigate();

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
    <div className="border border-border/40 rounded-lg bg-background">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border/40">
            <tr className="text-xs text-muted-foreground uppercase tracking-wide">
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
              <tr key={case_.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getTypeIcon(case_.type)}</span>
                    <span className="text-xs font-medium text-muted-foreground">{case_.type}</span>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{case_.claimNumber}</td>
                <td className="px-3 py-2 text-sm">{case_.insuredName}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                    {getStatusText(case_.status)}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm font-medium">{formatCurrency(case_.estimatedAmount)}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{case_.agent}</td>
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
  );
};