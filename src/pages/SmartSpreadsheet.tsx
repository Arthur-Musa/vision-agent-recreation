import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, Filter, Search, RefreshCw, Trash2, Eye } from 'lucide-react';
import { localStorageService } from '@/services/localStorageService';

const SmartSpreadsheet = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cases, setCases] = useState<any[]>([]);

  // Load cases from localStorage on component mount
  useEffect(() => {
    const loadCases = () => {
      try {
        const savedCases = localStorage.getItem('olga_spreadsheet_cases');
        if (savedCases) {
          setCases(JSON.parse(savedCases));
        } else {
          // Default demo data - expanded list of all cases
          setCases([
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
            },
            {
              id: 'APE-002233',
              claimNumber: 'APE-002233',
              type: 'APE',
              status: 'pending',
              agent: 'Claims Processor',
              processedAt: '2025-01-09T13:30:00Z',
              insuredName: 'Roberto Santos',
              estimatedAmount: 9500
            },
            {
              id: 'BAG-004455',
              claimNumber: 'BAG-004455',
              type: 'BAG',
              status: 'flagged',
              agent: 'Fraud Detector',
              processedAt: '2025-01-09T12:45:00Z',
              insuredName: 'Mariana Lima',
              estimatedAmount: 4200
            },
            {
              id: 'AUTO-006677',
              claimNumber: 'AUTO-006677',
              type: 'Auto',
              status: 'completed',
              agent: 'Aura',
              processedAt: '2025-01-09T11:20:00Z',
              insuredName: 'Eduardo Silva',
              estimatedAmount: 22000
            },
            {
              id: 'RES-008899',
              claimNumber: 'RES-008899',
              type: 'Residencial',
              status: 'processing',
              agent: 'Claims Processor',
              processedAt: '2025-01-09T10:15:00Z',
              insuredName: 'Patricia Costa',
              estimatedAmount: 11000
            },
            {
              id: 'VIDA-001010',
              claimNumber: 'VIDA-001010',
              type: 'Vida',
              status: 'completed',
              agent: 'Fraud Detector',
              processedAt: '2025-01-09T09:30:00Z',
              insuredName: 'Marcos Oliveira',
              estimatedAmount: 65000
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading cases:', error);
        setCases([]);
      }
    };

    loadCases();

    // Listen for localStorage changes (real-time updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'olga_spreadsheet_cases') {
        loadCases();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also set up interval to check for updates every 2 seconds
    const interval = setInterval(loadCases, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'flagged': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = searchTerm === '' || 
      case_.insuredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || case_.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Force reload from localStorage
    try {
      const savedCases = localStorage.getItem('olga_spreadsheet_cases');
      if (savedCases) {
        setCases(JSON.parse(savedCases));
      }
    } catch (error) {
      console.error('Error refreshing cases:', error);
    }
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Nº Sinistro', 'Tipo', 'Status', 'Segurado', 'Valor', 'Agente', 'Data'].join(','),
      ...filteredCases.map(case_ => [
        case_.id,
        case_.claimNumber,
        case_.type,
        getStatusText(case_.status),
        case_.insuredName,
        case_.estimatedAmount,
        case_.agent,
        formatDate(case_.processedAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `olga_casos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
                <h1 className="text-xl font-semibold">Todos os Casos</h1>
                <p className="text-sm text-muted-foreground">
                  Tabela em tempo real • {filteredCases.length} casos
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Limpar todos os dados do spreadsheet?')) {
                      localStorageService.clearAllData();
                      setCases([]);
                    }
                  }}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar
                </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, sinistro ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">Todos os Status</option>
                  <option value="completed">Concluído</option>
                  <option value="processing">Processando</option>
                  <option value="pending">Pendente</option>
                  <option value="flagged">Sinalizado</option>
                  <option value="error">Erro</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Casos de Seguro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 w-[100px]">Tipo</th>
                    <th className="text-left p-3 w-[120px]">Nº Sinistro</th>
                    <th className="text-left p-3">Segurado</th>
                    <th className="text-left p-3 w-[100px]">Status</th>
                    <th className="text-left p-3 w-[120px]">Valor</th>
                    <th className="text-left p-3 w-[120px]">Agente</th>
                    <th className="text-left p-3 w-[100px]">Data</th>
                    <th className="text-left p-3 w-[80px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((case_) => (
                    <tr key={case_.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getTypeIcon(case_.type)}</span>
                          <span className="text-sm font-medium">{case_.type}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm">{case_.claimNumber}</td>
                      <td className="p-3 text-sm">{case_.insuredName}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(case_.status)}`}>
                          {getStatusText(case_.status)}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm font-medium">{formatCurrency(case_.estimatedAmount)}</td>
                      <td className="p-3 text-sm text-muted-foreground">{case_.agent}</td>
                      <td className="p-3 text-xs text-muted-foreground">{formatDate(case_.processedAt)}</td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (case_.type === 'APE' || case_.type === 'BAG') {
                              navigate('/ape-bag-analyst');
                            } else if (case_.type === 'Auto') {
                              navigate('/claims-dashboard');
                            } else {
                              navigate('/live', { state: { caseId: case_.id } });
                            }
                          }}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCases.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum caso encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Atualização em Tempo Real</h4>
                <p className="text-sm text-blue-800">
                  Esta tabela é atualizada automaticamente. 
                  Novos casos e mudanças de status aparecem em tempo real.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SmartSpreadsheet;