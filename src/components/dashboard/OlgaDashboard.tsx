import React from 'react';
import { 
  BarChart3, 
  FileText, 
  Clock, 
  CheckCircle, 
  Shield, 
  DollarSign,
  AlertTriangle,
  Download,
  Activity,
  Zap,
  Search,
  Settings
} from 'lucide-react';

interface DashboardData {
  totalClaims: number;
  claimsChange: number;
  processingTime: number;
  timeChange: number;
  fraudDetected: number;
  fraudChange: number;
}

interface OlgaDashboardProps {
  data: DashboardData;
}

const OlgaDashboard: React.FC<OlgaDashboardProps> = ({ data }) => {
  return (
    <div className="min-h-full bg-background">
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-lg">
              <FileText className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Painel do Analista de Sinistros</h1>
              <p className="text-muted-foreground text-sm">Controle e análise completa dos sinistros • Tempo real</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-accent rounded-lg border">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-accent-foreground text-xs font-semibold">LIVE</span>
            </div>
            <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs rounded-lg transition-colors flex items-center space-x-1">
              <Download className="w-3 h-3" strokeWidth={1.5} />
              <span>Relatório</span>
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-6 gap-4">
          <MetricCard
            icon={<FileText className="w-4 h-4" strokeWidth={1.5} />}
            title="Sinistros Hoje"
            value={data.totalClaims.toLocaleString()}
            change={data.claimsChange}
            description="523 pendentes análise"
            trend="positive"
          />
          
          <MetricCard
            icon={<Clock className="w-4 h-4" strokeWidth={1.5} />}
            title="Tempo Médio"
            value={`${data.processingTime}min`}
            change={data.timeChange}
            description="Meta: 5min"
            trend="positive"
          />
          
          <MetricCard
            icon={<CheckCircle className="w-4 h-4" strokeWidth={1.5} />}
            title="Aprovados Hoje"
            value="743"
            change={24}
            description="Taxa: 74.3%"
            trend="positive"
          />
          
          <MetricCard
            icon={<Shield className="w-4 h-4" strokeWidth={1.5} />}
            title="Suspeitas Fraude"
            value={data.fraudDetected.toString()}
            change={data.fraudChange}
            description="Em investigação: 8"
            trend="negative"
          />
          
          <MetricCard
            icon={<AlertTriangle className="w-4 h-4" strokeWidth={1.5} />}
            title="Alto Risco"
            value="87"
            change={12}
            description="Score > 70"
            trend="neutral"
          />
          
          <MetricCard
            icon={<DollarSign className="w-4 h-4" strokeWidth={1.5} />}
            title="Valor em Análise"
            value="R$ 1.8M"
            change={8.2}
            description="Ticket médio: R$ 1.8K"
            trend="positive"
          />
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriorityQueue />
          <ClaimsDistribution />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AutomatedAnalysis />
          <DailyPerformance />
        </div>

        <QuickActions />
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: number;
  description: string;
  trend: 'positive' | 'negative' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  title, 
  value, 
  change, 
  description, 
  trend 
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="bg-card border rounded-md p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
          {icon}
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded ${getTrendColor()}`}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      </div>
      <div className="mb-1">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm font-medium text-foreground">{title}</div>
      </div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
};

const PriorityQueue: React.FC = () => (
  <div className="bg-card border rounded-md">
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Fila de Prioridades</h2>
            <p className="text-xs text-muted-foreground">Por urgência</p>
          </div>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">Ver todos</button>
      </div>
    </div>
    <div className="p-4">
      <div className="space-y-3">
        <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">SIN-2025-001287</p>
                <p className="text-xs text-gray-600">Acidente de trabalho • R$ 25.000</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-gray-700 bg-red-50 border border-red-200 px-2 py-1 rounded">CRÍTICO</span>
              <p className="text-xs text-gray-500 mt-1">há 2h</p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">SIN-2025-001288</p>
                <p className="text-xs text-gray-600">Impedimento profissional • R$ 8.500</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-gray-700 bg-orange-50 border border-orange-200 px-2 py-1 rounded">ALTO</span>
              <p className="text-xs text-gray-500 mt-1">há 4h</p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">SIN-2025-001289</p>
                <p className="text-xs text-gray-600">Renda protegida • R$ 3.200</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-gray-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded">MÉDIO</span>
              <p className="text-xs text-gray-500 mt-1">há 6h</p>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">SIN-2025-001290</p>
                <p className="text-xs text-gray-600">Acidente doméstico • R$ 1.850</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded">BAIXO</span>
              <p className="text-xs text-gray-500 mt-1">há 1d</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>523 sinistros na fila</span>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <span className="font-medium">23 críticos</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ClaimsDistribution: React.FC = () => (
  <div className="bg-card border rounded-md">
    <div className="p-4 border-b">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Análise por Tipo</h2>
          <p className="text-xs text-muted-foreground">Distribuição de sinistros</p>
        </div>
      </div>
    </div>
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                <Shield className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-gray-900">Acidentes Pessoais</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">523</span>
              <div className="text-xs text-gray-500">52.3%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-600 h-2 rounded-full" style={{ width: '52.3%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                <Activity className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-gray-900">Impedimento ao Trabalho</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">312</span>
              <div className="text-xs text-gray-500">31.2%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-500 h-2 rounded-full" style={{ width: '31.2%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-gray-900">Renda Protegida</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">165</span>
              <div className="text-xs text-gray-500">16.5%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-400 h-2 rounded-full" style={{ width: '16.5%' }}></div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Ticket médio geral</span>
            <span className="text-gray-900 font-semibold">R$ 1.827</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AutomatedAnalysis: React.FC = () => (
  <div className="bg-card border rounded-md">
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
            <Shield className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Análise Automática</h2>
            <p className="text-xs text-gray-500">Processamento por IA</p>
          </div>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Nova análise</button>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="border border-gray-200 rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Auto-Aprovação</span>
          </div>
          <span className="text-xs font-medium text-gray-700 bg-green-50 border border-green-200 px-2 py-1 rounded">743 hoje</span>
        </div>
        <p className="text-xs text-gray-600">Risco &lt; 30 • Valor &lt; R$ 5K • Sem fraude</p>
      </div>
      
      <div className="border border-gray-200 rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Revisão Manual</span>
          </div>
          <span className="text-xs font-medium text-gray-700 bg-orange-50 border border-orange-200 px-2 py-1 rounded">87 hoje</span>
        </div>
        <p className="text-xs text-gray-600">Risco 30-70 • Valor R$ 5-20K</p>
      </div>
      
      <div className="border border-gray-200 rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Investigação</span>
          </div>
          <span className="text-xs font-medium text-gray-700 bg-red-50 border border-red-200 px-2 py-1 rounded">23 hoje</span>
        </div>
        <p className="text-xs text-gray-600">Risco &gt; 70 • Suspeita fraude</p>
      </div>
    </div>
  </div>
);

const DailyPerformance: React.FC = () => (
  <div className="bg-card border rounded-md">
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Performance do Dia</h2>
            <p className="text-xs text-gray-500">Métricas operacionais</p>
          </div>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver detalhes</button>
      </div>
    </div>
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">Sinistros Analisados</span>
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-900">1,000</span>
          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-1">+12% vs ontem</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">Tempo Médio</span>
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-900">2.3min</span>
          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-1">-18% vs média</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">Taxa de Aprovação</span>
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-900">74.3%</span>
          <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded mt-1">dentro da meta</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-700">Eficiência IA</span>
        <div className="text-right">
          <span className="text-sm font-semibold text-blue-600">94.5%</span>
          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-1">+0.3% vs ontem</div>
        </div>
      </div>
      
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">Performance excelente</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const QuickActions: React.FC = () => (
  <div className="bg-card border rounded-md">
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
          <Zap className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Ações Rápidas</h2>
          <p className="text-xs text-gray-500">Operações frequentes</p>
        </div>
      </div>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors group">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <FileText className="w-4 h-4 text-gray-600 group-hover:text-blue-600" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Novo Sinistro</p>
              <p className="text-xs text-gray-600">Cadastrar manualmente</p>
            </div>
          </div>
        </button>
        
        <button className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors group">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Search className="w-4 h-4 text-gray-600 group-hover:text-blue-600" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Busca Avançada</p>
              <p className="text-xs text-gray-600">Filtros complexos</p>
            </div>
          </div>
        </button>
        
        <button className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors group">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4 text-gray-600 group-hover:text-blue-600" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Relatório</p>
              <p className="text-xs text-gray-600">Exportar dados</p>
            </div>
          </div>
        </button>
        
        <button className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors group">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Settings className="w-4 h-4 text-gray-600 group-hover:text-blue-600" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Configurações</p>
              <p className="text-xs text-gray-600">Regras de negócio</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
);

export default OlgaDashboard;
