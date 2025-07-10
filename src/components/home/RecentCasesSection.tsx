import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentCase {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  policyNumber?: string;
  insuredName?: string;
}

const RecentCasesSection = () => {
  const navigate = useNavigate();

  const recentCases: RecentCase[] = [
    {
      id: '1',
      type: 'Sinistro Auto',
      status: 'processing',
      createdAt: '2024-01-15T10:30:00Z',
      policyNumber: 'AUTO-123456',
      insuredName: 'João Silva'
    },
    {
      id: '2',
      type: 'Renovação Residencial',
      status: 'completed',
      createdAt: '2024-01-15T09:15:00Z',
      policyNumber: 'RES-789012',
      insuredName: 'Maria Santos'
    },
    {
      id: '3',
      type: 'Cotação Vida',
      status: 'pending',
      createdAt: '2024-01-14T16:45:00Z',
      insuredName: 'Carlos Oliveira'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-accent text-accent-foreground';
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <section aria-label="Recent Cases">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Casos Recentes</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/claims')}
        >
          Ver todos
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentCases.map((case_) => (
          <Card 
            key={case_.id}
            className="agent-card cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => navigate(`/claims/${case_.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">{case_.type}</h3>
                <Badge className={getStatusColor(case_.status)}>
                  {getStatusText(case_.status)}
                </Badge>
              </div>
              {case_.policyNumber && (
                <p className="text-sm text-muted-foreground mb-1">
                  {case_.policyNumber}
                </p>
              )}
              {case_.insuredName && (
                <p className="text-sm text-muted-foreground mb-2">
                  {case_.insuredName}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(case_.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecentCasesSection;