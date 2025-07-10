import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Search, 
  Filter,
  Eye,
  AlertCircle,
  TrendingUp,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClaimItem {
  id: string;
  policyNumber: string;
  insuredName: string;
  claimType: string;
  coverageType: 'AUTO' | 'RESIDENCIA' | 'SAUDE' | 'VIDA';
  estimatedAmount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending_review' | 'investigation' | 'additional_docs' | 'fraud_alert';
  riskScore: number;
  daysInQueue: number;
  fraudIndicators: string[];
  incidentDate: string;
  createdAt: string;
  assignedTo?: string;
}

interface IntelligentClaimsQueueProps {
  onClaimSelect: (claimId: string) => void;
}

export const IntelligentClaimsQueue = ({ onClaimSelect }: IntelligentClaimsQueueProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('my_queue');

  // Mock data - em produção viria da API
  const claims: ClaimItem[] = [
    {
      id: '1',
      policyNumber: 'AUTO-123456',
      insuredName: 'João Silva',
      claimType: 'Colisão',
      coverageType: 'AUTO',
      estimatedAmount: 15750,
      priority: 'critical',
      status: 'fraud_alert',
      riskScore: 0.85,
      daysInQueue: 3,
      fraudIndicators: ['Documento duplicado', 'Valor atípico'],
      incidentDate: '2024-01-10',
      createdAt: '2024-01-15T10:30:00Z',
      assignedTo: 'Analista Atual'
    },
    {
      id: '2',
      policyNumber: 'RES-789012',
      insuredName: 'Maria Santos',
      claimType: 'Incêndio',
      coverageType: 'RESIDENCIA',
      estimatedAmount: 45000,
      priority: 'high',
      status: 'pending_review',
      riskScore: 0.35,
      daysInQueue: 1,
      fraudIndicators: [],
      incidentDate: '2024-01-08',
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      policyNumber: 'VIDA-345678',
      insuredName: 'Carlos Oliveira',
      claimType: 'Morte Natural',
      coverageType: 'VIDA',
      estimatedAmount: 100000,
      priority: 'high',
      status: 'investigation',
      riskScore: 0.65,
      daysInQueue: 7,
      fraudIndicators: ['Timing suspeito'],
      incidentDate: '2024-01-12',
      createdAt: '2024-01-13T09:15:00Z'
    }
  ];

  const getFilteredClaims = () => {
    return claims.filter(claim => {
      const matchesSearch = searchTerm === '' || 
        claim.insuredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCoverage = selectedCoverage === 'all' || claim.coverageType === selectedCoverage;
      const matchesPriority = selectedPriority === 'all' || claim.priority === selectedPriority;
      
      // Filtro por aba
      if (activeTab === 'my_queue') {
        return matchesSearch && matchesCoverage && matchesPriority && claim.assignedTo;
      } else if (activeTab === 'fraud_alerts') {
        return matchesSearch && matchesCoverage && matchesPriority && claim.fraudIndicators.length > 0;
      } else if (activeTab === 'escalated') {
        return matchesSearch && matchesCoverage && matchesPriority && ['critical', 'high'].includes(claim.priority);
      }
      
      return matchesSearch && matchesCoverage && matchesPriority;
    }).sort((a, b) => {
      // Ordenação por prioridade e dias na fila
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b.daysInQueue - a.daysInQueue;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fraud_alert': return 'bg-red-100 text-red-800 border-red-200';
      case 'investigation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'additional_docs': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusLabel = (status: string) => {
    const labels = {
      fraud_alert: 'Alerta de Fraude',
      investigation: 'Investigação',
      pending_review: 'Aguarda Revisão',
      additional_docs: 'Docs Pendentes'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredClaims = getFilteredClaims();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sinistros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCoverage} onValueChange={setSelectedCoverage}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Cobertura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Coberturas</SelectItem>
                <SelectItem value="AUTO">Automóvel</SelectItem>
                <SelectItem value="RESIDENCIA">Residência</SelectItem>
                <SelectItem value="SAUDE">Saúde</SelectItem>
                <SelectItem value="VIDA">Vida</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Ordenar por Risco
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Abas da Fila */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my_queue">Minha Fila</TabsTrigger>
          <TabsTrigger value="fraud_alerts">Alertas de Fraude</TabsTrigger>
          <TabsTrigger value="escalated">Escalados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {/* Lista de Sinistros */}
          <div className="space-y-3">
            {filteredClaims.map((claim) => (
              <Card 
                key={claim.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{
                  borderLeftColor: claim.priority === 'critical' ? '#ef4444' : 
                                  claim.priority === 'high' ? '#f97316' :
                                  claim.priority === 'medium' ? '#eab308' : '#22c55e'
                }}
                onClick={() => onClaimSelect(claim.id)}
              >
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Identificação */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {claim.coverageType}
                        </Badge>
                        {claim.fraudIndicators.length > 0 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="font-semibold">{claim.policyNumber}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {claim.insuredName}
                      </div>
                    </div>

                    {/* Tipo e Valor */}
                    <div className="lg:col-span-2">
                      <div className="font-medium">{claim.claimType}</div>
                      <div className="text-sm font-semibold text-primary flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(claim.estimatedAmount)}
                      </div>
                    </div>

                    {/* Indicadores de Risco */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">Risco:</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${claim.riskScore > 0.7 ? 'border-red-200 text-red-700' : 
                                                claim.riskScore > 0.4 ? 'border-yellow-200 text-yellow-700' : 
                                                'border-green-200 text-green-700'}`}
                        >
                          {(claim.riskScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      {claim.fraudIndicators.length > 0 && (
                        <div className="text-xs text-red-600">
                          {claim.fraudIndicators.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Status e Prioridade */}
                    <div className="lg:col-span-2">
                      <Badge className={`${getPriorityColor(claim.priority)} mb-1`}>
                        {claim.priority.toUpperCase()}
                      </Badge>
                      <br />
                      <Badge className={`${getStatusColor(claim.status)} text-xs`}>
                        {getStatusLabel(claim.status)}
                      </Badge>
                    </div>

                    {/* Timing */}
                    <div className="lg:col-span-2">
                      <div className="text-sm flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        {claim.daysInQueue} dias na fila
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(claim.incidentDate)}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="lg:col-span-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/claims/${claim.id}`);
                        }}
                        className="w-full gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estado Vazio */}
          {filteredClaims.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum sinistro encontrado</h3>
                <p className="text-muted-foreground">
                  Ajuste os filtros ou verifique se há novos sinistros na fila.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};