import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Shield, Bot } from "lucide-react";

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
      case 'APE':
      case 'BAG': return <FileText className="h-4 w-4" />;
      case 'Auto':
      case 'Residencial': return <Shield className="h-4 w-4" />;
      case 'Vida': return <Bot className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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


  return (
    <section aria-label="Recent Cases">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Casos Recentes</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/spreadsheets')}
        >
          Ver todos
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {recentCases.map((case_) => (
          <Card 
            key={case_.id}
            className="cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 border border-border/50"
            onClick={() => navigate('/spreadsheets')}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center border border-border/20 flex-shrink-0">
                  {getTypeIcon(case_.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{case_.claimNumber}</h3>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(case_.status)}`}>
                      {getStatusText(case_.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {case_.insuredName}
                  </p>
                  <p className="text-xs font-medium text-foreground mb-1">
                    {formatCurrency(case_.estimatedAmount)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Agente:</span>
                  <span className="text-xs font-medium">{case_.agent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Processado:</span>
                  <span className="text-xs">{formatDate(case_.processedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecentCasesSection;