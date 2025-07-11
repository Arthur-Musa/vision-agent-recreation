import { useState, useEffect } from 'react';
import { SpreadsheetHeader } from '@/components/spreadsheet/SpreadsheetHeader';
import { SpreadsheetFilters } from '@/components/spreadsheet/SpreadsheetFilters';
import { CasesTable } from '@/components/spreadsheet/CasesTable';
import { RealTimeInfo } from '@/components/spreadsheet/RealTimeInfo';
import { WorkflowPanel } from '@/components/spreadsheet/WorkflowPanel';
import { spreadsheetAutomation, SpreadsheetAutomation } from '@/services/spreadsheetAutomation';
import { Button } from '@/components/ui/button';
import { Play, Pause, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SmartSpreadsheet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCases, setSelectedCases] = useState<any[]>([]);
  const [automationActive, setAutomationActive] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        case_.status,
        case_.insuredName,
        case_.estimatedAmount,
        case_.agent,
        new Date(case_.processedAt).toLocaleString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `olga_casos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleClearData = () => {
    setCases([]);
  };

  const handleCasesUpdate = (updatedCases: any[]) => {
    setCases(updatedCases);
  };

  const handleCasesSelection = (selectedIds: string[]) => {
    const selected = cases.filter(c => selectedIds.includes(c.id));
    setSelectedCases(selected);
  };

  const handleStartWorkflow = async (caseIds: string[]) => {
    console.log('🚀 Iniciando fluxo de trabalho para casos:', caseIds);
    
    try {
      // Simular processamento do workflow
      toast({
        title: "Fluxo de trabalho iniciado",
        description: `Processando ${caseIds.length} caso(s) automaticamente.`,
      });

      // Marcar casos como processando
      const updatedCases = cases.map(case_ => {
        if (caseIds.includes(case_.id)) {
          return { ...case_, status: 'processing', lastUpdate: new Date().toISOString() };
        }
        return case_;
      });

      setCases(updatedCases);
      localStorage.setItem('olga_spreadsheet_cases', JSON.stringify(updatedCases));

      // Simular processamento automático
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Finalizar processamento
      const finalCases = updatedCases.map(case_ => {
        if (caseIds.includes(case_.id)) {
          return { 
            ...case_, 
            status: Math.random() > 0.8 ? 'flagged' : 'completed',
            agent: 'AI Processor',
            lastUpdate: new Date().toISOString()
          };
        }
        return case_;
      });

      setCases(finalCases);
      localStorage.setItem('olga_spreadsheet_cases', JSON.stringify(finalCases));
      setSelectedCases([]);

      toast({
        title: "Fluxo concluído",
        description: `${caseIds.length} caso(s) processado(s) com sucesso.`,
      });

    } catch (error) {
      toast({
        title: "Erro no fluxo",
        description: "Erro ao processar fluxo de trabalho. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleViewCase = (case_: any) => {
    if (case_.type === 'APE' || case_.type === 'BAG') {
      navigate('/ape-bag-analyst');
    } else if (case_.type === 'Auto') {
      navigate('/claims-dashboard');
    } else {
      navigate('/live', { state: { caseId: case_.id } });
    }
  };

  const toggleAutomation = () => {
    if (automationActive) {
      spreadsheetAutomation.stopAutomation();
      setAutomationActive(false);
      toast({
        title: "Automação pausada",
        description: "O processamento automatizado foi pausado.",
      });
    } else {
      spreadsheetAutomation.startAutomation();
      setAutomationActive(true);
      toast({
        title: "Automação ativa",
        description: "Novas linhas serão processadas automaticamente.",
      });
    }
  };

  const simulateWebhookData = async () => {
    const webhookData = {
      claimNumber: `AUTO-${Date.now()}`,
      type: 'Auto',
      insuredName: `Cliente Webhook ${Math.floor(Math.random() * 1000)}`,
      amount: Math.floor(Math.random() * 50000) + 5000
    };

    const result = await (SpreadsheetAutomation as any).processWebhookData(webhookData);
    
    if (result.success) {
      toast({
        title: "Dados recebidos",
        description: `Novo caso ${webhookData.claimNumber} adicionado via webhook.`,
      });
      // Força refresh para mostrar novo caso
      setTimeout(() => {
        const savedCases = localStorage.getItem('olga_spreadsheet_cases');
        if (savedCases) {
          setCases(JSON.parse(savedCases));
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SpreadsheetHeader
        casesCount={filteredCases.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        onClearData={handleClearData}
      />

      <main className="container mx-auto px-6 py-6">
        {/* Painel de Controle da Automação */}
        <div className="mb-6 p-4 border border-border/40 rounded-lg bg-muted/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">Automação Inteligente</h3>
              <p className="text-xs text-muted-foreground">
                {automationActive 
                  ? "Processamento automático ativo - novas linhas serão analisadas pelo Concierge"
                  : "Automação pausada - ative para processamento automático"
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={simulateWebhookData}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <Zap className="h-3 w-3" />
                Simular Webhook
              </Button>
              
              <Button
                variant={automationActive ? "destructive" : "default"}
                size="sm"
                onClick={toggleAutomation}
                className="gap-1"
              >
                {automationActive ? (
                  <>
                    <Pause className="h-3 w-3" />
                    Pausar Automação
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    Ativar Automação
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {automationActive && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Sistema ativo - monitorando novas entradas
            </div>
          )}
        </div>
        <SpreadsheetFilters
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onSearchChange={setSearchTerm}
          onStatusChange={setFilterStatus}
        />

        <CasesTable 
          cases={filteredCases} 
          onCasesUpdate={handleCasesUpdate}
          onSelectionChange={handleCasesSelection}
        />

        {/* Painel de Fluxo de Trabalho */}
        <div className="mt-6">
          <WorkflowPanel
            selectedCases={selectedCases}
            onStartWorkflow={handleStartWorkflow}
            onViewCase={handleViewCase}
          />
        </div>

        <RealTimeInfo />
      </main>
    </div>
  );
};

export default SmartSpreadsheet;