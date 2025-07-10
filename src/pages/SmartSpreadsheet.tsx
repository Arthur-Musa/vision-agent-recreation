import { useState, useEffect } from 'react';
import { SpreadsheetHeader } from '@/components/spreadsheet/SpreadsheetHeader';
import { SpreadsheetFilters } from '@/components/spreadsheet/SpreadsheetFilters';
import { CasesTable } from '@/components/spreadsheet/CasesTable';
import { RealTimeInfo } from '@/components/spreadsheet/RealTimeInfo';

const SmartSpreadsheet = () => {
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
        <SpreadsheetFilters
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onSearchChange={setSearchTerm}
          onStatusChange={setFilterStatus}
        />

        <CasesTable cases={filteredCases} onCasesUpdate={handleCasesUpdate} />

        <RealTimeInfo />
      </main>
    </div>
  );
};

export default SmartSpreadsheet;