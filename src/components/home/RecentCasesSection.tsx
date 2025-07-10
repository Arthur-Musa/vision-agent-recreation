import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentCase {
  id: string;
  claimNumber: string;
  type: string;
  status: 'completed' | 'processing' | 'flagged';
  agent: string;
  processedAt: string;
  insuredName: string;
  estimatedAmount: number;
}

const RecentCasesSection = () => {
  const navigate = useNavigate();

  const recentCases: RecentCase[] = [
    {
      id: 'APE-001234',
      claimNumber: 'APE-001234', 
      type: 'APE',
      status: 'completed',
      agent: 'Claims Processor',
      processedAt: '2025-01-10T14:30:00Z',
      insuredName: 'João Silva',
      estimatedAmount: 15000
    },
    {
      id: 'BAG-005678',
      claimNumber: 'BAG-005678',
      type: 'BAG',
      status: 'completed', 
      agent: 'Aura',
      processedAt: '2025-01-10T13:45:00Z',
      insuredName: 'Maria Santos',
      estimatedAmount: 3200
    },
    {
      id: 'AUTO-009012',
      claimNumber: 'AUTO-009012',
      type: 'Auto',
      status: 'processing',
      agent: 'Fraud Detector',
      processedAt: '2025-01-10T12:15:00Z', 
      insuredName: 'Carlos Oliveira',
      estimatedAmount: 25000
    },
    {
      id: 'RES-003456',
      claimNumber: 'RES-003456',
      type: 'Residencial',
      status: 'completed',
      agent: 'Claims Processor', 
      processedAt: '2025-01-10T11:30:00Z',
      insuredName: 'Ana Costa',
      estimatedAmount: 8500
    },
    {
      id: 'VIDA-007890',
      claimNumber: 'VIDA-007890',
      type: 'Vida',
      status: 'flagged',
      agent: 'Fraud Detector',
      processedAt: '2025-01-10T10:20:00Z',
      insuredName: 'Pedro Lima',
      estimatedAmount: 50000
    },
    {
      id: 'APE-001122',
      claimNumber: 'APE-001122',
      type: 'APE',
      status: 'completed',
      agent: 'Aura',
      processedAt: '2025-01-10T09:45:00Z',
      insuredName: 'Lucia Ferreira',
      estimatedAmount: 12000
    },
    {
      id: 'BAG-003344',
      claimNumber: 'BAG-003344',
      type: 'BAG', 
      status: 'processing',
      agent: 'Claims Processor',
      processedAt: '2025-01-10T08:30:00Z',
      insuredName: 'Rafael Souza',
      estimatedAmount: 2800
    },
    {
      id: 'AUTO-005566',
      claimNumber: 'AUTO-005566',
      type: 'Auto',
      status: 'completed',
      agent: 'Aura',
      processedAt: '2025-01-09T16:15:00Z',
      insuredName: 'Fernanda Alves',
      estimatedAmount: 18000
    },
    {
      id: 'RES-007788',
      claimNumber: 'RES-007788', 
      type: 'Residencial',
      status: 'processing',
      agent: 'Claims Processor',
      processedAt: '2025-01-09T15:20:00Z',
      insuredName: 'Bruno Martins',
      estimatedAmount: 6700
    },
    {
      id: 'VIDA-009900',
      claimNumber: 'VIDA-009900',
      type: 'Vida',
      status: 'completed',
      agent: 'Fraud Detector',
      processedAt: '2025-01-09T14:00:00Z',
      insuredName: 'Camila Rodrigues', 
      estimatedAmount: 75000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'flagged': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'flagged': return 'Sinalizado';
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
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  return (
    <section aria-label="Recent Cases">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Casos Recentes</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/spreadsheets')}
            >
              Ver todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead className="w-[120px]">Nº Sinistro</TableHead>
                <TableHead>Segurado</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Valor</TableHead>
                <TableHead className="w-[120px]">Agente</TableHead>
                <TableHead className="w-[100px]">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCases.map((case_) => (
                <TableRow 
                  key={case_.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate('/spreadsheets')}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getTypeIcon(case_.type)}</span>
                      <span className="text-sm font-medium">{case_.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{case_.claimNumber}</TableCell>
                  <TableCell className="text-sm">{case_.insuredName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(case_.status)}`}>
                      {getStatusText(case_.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(case_.estimatedAmount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{case_.agent}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(case_.processedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
};

export default RecentCasesSection;