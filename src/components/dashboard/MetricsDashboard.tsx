import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  FileText, CheckCircle, AlertTriangle, XCircle, TrendingUp, 
  Clock, Users, Brain, Activity, Database, Zap
} from 'lucide-react';

interface DashboardMetrics {
  usage: {
    totalDocuments: number;
    processedToday: number;
    successRate: number;
    averageProcessingTime: number;
  };
  quality: {
    accuracy: number;
    manualIntervention: number;
    userFeedback: number;
  };
  agents: {
    totalAgents: number;
    activeAgents: number;
    performance: Array<{
      agentId: string;
      name: string;
      processedDocs: number;
      accuracy: number;
      avgTime: number;
    }>;
  };
  trends: Array<{
    date: string;
    documents: number;
    success: number;
    errors: number;
  }>;
}

const mockMetrics: DashboardMetrics = {
  usage: {
    totalDocuments: 15420,
    processedToday: 127,
    successRate: 94.2,
    averageProcessingTime: 12.5
  },
  quality: {
    accuracy: 95.8,
    manualIntervention: 5.3,
    userFeedback: 4.7
  },
  agents: {
    totalAgents: 8,
    activeAgents: 6,
    performance: [
      { agentId: 'claims-processor', name: 'Processador de Sinistros', processedDocs: 4230, accuracy: 96.2, avgTime: 11.2 },
      { agentId: 'policy-analyzer', name: 'Analisador de Apólices', processedDocs: 3580, accuracy: 95.1, avgTime: 8.7 },
      { agentId: 'fraud-detector', name: 'Detector de Fraude', processedDocs: 2940, accuracy: 97.8, avgTime: 15.3 },
      { agentId: 'coverage-verification', name: 'Verificador de Cobertura', processedDocs: 2190, accuracy: 94.6, avgTime: 6.4 },
      { agentId: 'legal-analyst', name: 'Analista Legal', processedDocs: 1870, accuracy: 93.9, avgTime: 18.9 },
      { agentId: 'customer-service', name: 'Atendimento ao Cliente', processedDocs: 610, accuracy: 92.3, avgTime: 4.1 }
    ]
  },
  trends: [
    { date: '01/07', documents: 98, success: 92, errors: 6 },
    { date: '02/07', documents: 112, success: 106, errors: 6 },
    { date: '03/07', documents: 89, success: 84, errors: 5 },
    { date: '04/07', documents: 134, success: 127, errors: 7 },
    { date: '05/07', documents: 145, success: 138, errors: 7 },
    { date: '06/07', documents: 156, success: 149, errors: 7 },
    { date: '07/07', documents: 127, success: 120, errors: 7 }
  ]
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Simula carregamento de dados
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [refreshKey]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    format = 'number',
    color = 'primary' 
  }: {
    title: string;
    value: number;
    icon: any;
    trend?: number;
    format?: 'number' | 'percentage' | 'time';
    color?: 'primary' | 'success' | 'warning' | 'destructive';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'percentage':
          return `${val.toFixed(1)}%`;
        case 'time':
          return `${val.toFixed(1)}s`;
        default:
          return val.toLocaleString('pt-BR');
      }
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              {trend !== undefined && (
                <div className="flex items-center mt-1">
                  <TrendingUp className={`h-3 w-3 mr-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full bg-${color}/10`}>
              <Icon className={`h-6 w-6 text-${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AlertCard = ({ 
    type, 
    title, 
    message, 
    count 
  }: {
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    count: number;
  }) => {
    const icons = {
      warning: AlertTriangle,
      error: XCircle,
      info: Activity
    };
    
    const colors = {
      warning: 'text-yellow-500',
      error: 'text-red-500',
      info: 'text-blue-500'
    };

    const Icon = icons[type];

    return (
      <div className="flex items-start space-x-3 p-3 border rounded-lg">
        <Icon className={`h-5 w-5 mt-0.5 ${colors[type]}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{title}</h4>
            <Badge variant="secondary">{count}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard de Métricas</h2>
          <Button variant="outline" disabled>
            <Activity className="h-4 w-4 mr-2 animate-spin" />
            Carregando...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Métricas</h2>
          <p className="text-muted-foreground">Visão geral do desempenho da plataforma Olga</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documentos Processados"
          value={metrics.usage.totalDocuments}
          icon={FileText}
          trend={8.2}
        />
        <StatCard
          title="Taxa de Sucesso"
          value={metrics.usage.successRate}
          icon={CheckCircle}
          format="percentage"
          trend={2.1}
          color="success"
        />
        <StatCard
          title="Processados Hoje"
          value={metrics.usage.processedToday}
          icon={Activity}
          trend={-5.3}
        />
        <StatCard
          title="Tempo Médio"
          value={metrics.usage.averageProcessingTime}
          icon={Clock}
          format="time"
          trend={-12.7}
          color="warning"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendências */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendências (Últimos 7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="documents" stroke="#8884d8" name="Documentos" />
                    <Line type="monotone" dataKey="success" stroke="#82ca9d" name="Sucessos" />
                    <Line type="monotone" dataKey="errors" stroke="#ff7c7c" name="Erros" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Distribuição por Tipo de Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Sinistros', value: 45, color: '#8884d8' },
                        { name: 'Apólices', value: 30, color: '#82ca9d' },
                        { name: 'Endossos', value: 15, color: '#ffc658' },
                        { name: 'Laudos', value: 10, color: '#ff7c7c' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Performance dos Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.agents.performance.map((agent) => (
                  <div key={agent.agentId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{agent.name}</h4>
                      <Badge variant="outline">{agent.accuracy.toFixed(1)}% precisão</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Documentos:</span>
                        <p className="font-medium">{agent.processedDocs.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tempo médio:</span>
                        <p className="font-medium">{agent.avgTime.toFixed(1)}s</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-500">Ativo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Precisão Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Precisão</span>
                    <span>{metrics.quality.accuracy}%</span>
                  </div>
                  <Progress value={metrics.quality.accuracy} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intervenção Manual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Taxa</span>
                    <span>{metrics.quality.manualIntervention}%</span>
                  </div>
                  <Progress value={metrics.quality.manualIntervention} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback dos Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Avaliação</span>
                    <span>{metrics.quality.userFeedback}/5</span>
                  </div>
                  <Progress value={(metrics.quality.userFeedback / 5) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas e Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AlertCard
                  type="warning"
                  title="Documentos Pendentes de Revisão"
                  message="Há documentos aguardando revisão manual há mais de 24 horas"
                  count={7}
                />
                <AlertCard
                  type="error"
                  title="Falhas de Processamento"
                  message="Alguns agentes apresentaram falhas no processamento"
                  count={3}
                />
                <AlertCard
                  type="info"
                  title="Atualizações Disponíveis"
                  message="Novos modelos de IA estão disponíveis para alguns agentes"
                  count={2}
                />
                <AlertCard
                  type="warning"
                  title="Uso de Resources"
                  message="Uso de CPU acima de 80% nos últimos 30 minutos"
                  count={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};