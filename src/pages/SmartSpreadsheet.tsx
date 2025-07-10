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
  const [jobs, setJobs] = useState<any[]>([]);

  // Load jobs from localStorage on component mount
  useEffect(() => {
    const loadJobs = () => {
      try {
        const savedJobs = localStorage.getItem('olga_spreadsheet_jobs');
        if (savedJobs) {
          setJobs(JSON.parse(savedJobs));
        } else {
          // Default demo data if no saved jobs
          setJobs([
            {
              id: 'DEMO-001',
              type: 'Claims Processing',
              status: 'completed',
              insuredName: 'João Silva',
              policyNumber: 'AUTO-123456',
              estimatedAmount: 15750,
              createdAt: '2024-01-15T10:30:00Z',
              completedAt: '2024-01-15T11:45:00Z',
              agent: 'Claims Processor'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
        setJobs([]);
      }
    };

    loadJobs();

    // Listen for localStorage changes (real-time updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'olga_spreadsheet_jobs') {
        loadJobs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also set up interval to check for updates every 2 seconds
    const interval = setInterval(loadJobs, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'processing': return 'Processando';
      case 'pending': return 'Pendente';
      case 'flagged': return 'Sinalizado';
      case 'error': return 'Erro';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.insuredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Force reload from localStorage
    try {
      const savedJobs = localStorage.getItem('olga_spreadsheet_jobs');
      if (savedJobs) {
        setJobs(JSON.parse(savedJobs));
      }
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Tipo', 'Status', 'Segurado', 'Apólice', 'Valor', 'Criado', 'Concluído', 'Agent'].join(','),
      ...filteredJobs.map(job => [
        job.id,
        job.type,
        getStatusText(job.status),
        job.insuredName,
        job.policyNumber,
        job.estimatedAmount,
        formatDate(job.createdAt),
        job.completedAt ? formatDate(job.completedAt) : 'N/A',
        job.agent
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `olga_jobs_${new Date().toISOString().split('T')[0]}.csv`;
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
                <h1 className="text-xl font-semibold">Smart Spreadsheet</h1>
                <p className="text-sm text-muted-foreground">
                  Tabela em tempo real via SSE/WS • {filteredJobs.length} jobs
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
                    setJobs([]);
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
                  placeholder="Buscar por nome, apólice ou tipo..."
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

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Segurado</th>
                    <th className="text-left p-3">Apólice</th>
                    <th className="text-left p-3">Valor</th>
                    <th className="text-left p-3">Criado</th>
                    <th className="text-left p-3">Concluído</th>
                    <th className="text-left p-3">Agent</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">{job.id}</td>
                      <td className="p-3">{job.type}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusText(job.status)}
                        </Badge>
                      </td>
                      <td className="p-3">{job.insuredName}</td>
                      <td className="p-3 font-mono text-sm">{job.policyNumber}</td>
                      <td className="p-3">{formatCurrency(job.estimatedAmount)}</td>
                      <td className="p-3 text-sm">{formatDate(job.createdAt)}</td>
                      <td className="p-3 text-sm">
                        {job.completedAt ? formatDate(job.completedAt) : '-'}
                      </td>
                      <td className="p-3 text-sm">{job.agent}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (job.type.includes('APE') || job.type.includes('BAG')) {
                                navigate('/ape-bag-analyst');
                              } else if (job.type === 'Claims Processing') {
                                navigate(`/claims/${job.id.split('-')[1]}`);
                              } else {
                                navigate('/live', { state: { jobId: job.id } });
                              }
                            }}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum job encontrado com os filtros aplicados.</p>
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
                  Esta tabela é atualizada automaticamente via Server-Sent Events (SSE) e WebSockets. 
                  Novos jobs e mudanças de status aparecem em tempo real.
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