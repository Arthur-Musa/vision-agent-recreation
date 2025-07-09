import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Filter, Plus, FileText, Calendar, User, BarChart3 } from 'lucide-react';

interface Claim {
  id: string;
  policyNumber: string;
  insuredName: string;
  incidentDate: string;
  claimType: string;
  estimatedAmount: number;
  status: 'processing' | 'completed' | 'pending' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  channel: 'email' | 'whatsapp' | 'manual';
  createdAt: string;
}

const ClaimsDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const claims: Claim[] = [
    {
      id: '1',
      policyNumber: 'AUTO-123456',
      insuredName: 'João Silva',
      incidentDate: '2024-01-10',
      claimType: 'Colisão',
      estimatedAmount: 15750,
      status: 'processing',
      priority: 'high',
      channel: 'email',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      policyNumber: 'RES-789012',
      insuredName: 'Maria Santos',
      incidentDate: '2024-01-08',
      claimType: 'Incêndio',
      estimatedAmount: 45000,
      status: 'completed',
      priority: 'high',
      channel: 'whatsapp',
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      policyNumber: 'VIDA-345678',
      insuredName: 'Carlos Oliveira',
      incidentDate: '2024-01-12',
      claimType: 'Morte Natural',
      estimatedAmount: 100000,
      status: 'pending',
      priority: 'medium',
      channel: 'manual',
      createdAt: '2024-01-13T09:15:00Z'
    }
  ];

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = searchTerm === '' || 
      claim.insuredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || claim.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return '📧';
      case 'whatsapp': return '📱';
      case 'manual': return '📝';
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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold">Claims Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Gerenciar processamentos de sinistros
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/claims-processing')} className="gap-2">
                <Plus className="h-4 w-4" />
                Processar Sinistros
              </Button>
              <Button onClick={() => navigate('/claims-metrics')} variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Métricas
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, apólice ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todos os Status</option>
              <option value="processing">Processando</option>
              <option value="completed">Concluído</option>
              <option value="pending">Pendente</option>
              <option value="rejected">Rejeitado</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Claims Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => (
            <Card 
              key={claim.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/claims/${claim.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{claim.policyNumber}</CardTitle>
                  <span className="text-lg">{getChannelIcon(claim.channel)}</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(claim.status)}>
                    {claim.status}
                  </Badge>
                  <Badge className={getPriorityColor(claim.priority)}>
                    {claim.priority}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{claim.insuredName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{claim.claimType}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(claim.incidentDate)}</span>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor estimado:</span>
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(claim.estimatedAmount)}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Criado em {formatDate(claim.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum sinistro encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou criar um novo sinistro.
            </p>
            <Button onClick={() => navigate('/live')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Sinistro
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClaimsDashboard;