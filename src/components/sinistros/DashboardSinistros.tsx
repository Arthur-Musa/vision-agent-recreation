import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Eye,
  TrendingUp,
  Activity,
  DollarSign,
  Users
} from 'lucide-react';
import { n8nWorkflowService } from '@/services/n8nWorkflowService';

interface Sinistro {
  numero_sinistro: string;
  tipo_sinistro: string;
  status: 'iniciado' | 'processando' | 'aprovado' | 'negado' | 'pendente_analise';
  data_criacao: string;
  valor_estimado: number;
  valor_aprovado?: number;
  cpf_segurado: string;
  apolice: string;
  score_fraude?: number;
  tempo_processamento?: number;
}

interface Metricas {
  total_sinistros: number;
  total_aprovados: number;
  total_negados: number;
  valor_total_pago: number;
  tempo_medio_processamento: number;
  taxa_automacao: number;
}

export const DashboardSinistros: React.FC = () => {
  const { toast } = useToast();
  const [sinistros, setSinistros] = useState<Sinistro[]>([]);
  const [metricas, setMetricas] = useState<Metricas>({
    total_sinistros: 0,
    total_aprovados: 0,
    total_negados: 0,
    valor_total_pago: 0,
    tempo_medio_processamento: 0,
    taxa_automacao: 0
  });
  const [searchCpf, setSearchCpf] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simular dados iniciais (em produção viria da API)
  useEffect(() => {
    const mockSinistros: Sinistro[] = [
      {
        numero_sinistro: 'SIN2025001',
        tipo_sinistro: 'acidentes_pessoais',
        status: 'aprovado',
        data_criacao: '2025-07-19T10:30:00Z',
        valor_estimado: 5000,
        valor_aprovado: 4500,
        cpf_segurado: '123.456.789-01',
        apolice: '88I2025001234',
        score_fraude: 0.15,
        tempo_processamento: 120 // minutos
      },
      {
        numero_sinistro: 'SIN2025002',
        tipo_sinistro: 'bagagem_mercadoria',
        status: 'processando',
        data_criacao: '2025-07-19T14:15:00Z',
        valor_estimado: 3200,
        cpf_segurado: '987.654.321-00',
        apolice: '88I2025001235',
        score_fraude: 0.3,
        tempo_processamento: 45
      },
      {
        numero_sinistro: 'SIN2025003',
        tipo_sinistro: 'acidentes_pessoais',
        status: 'negado',
        data_criacao: '2025-07-18T16:45:00Z',
        valor_estimado: 8000,
        cpf_segurado: '456.789.123-45',
        apolice: '88I2025001236',
        score_fraude: 0.85,
        tempo_processamento: 180
      }
    ];

    setSinistros(mockSinistros);
    
    // Calcular métricas
    const aprovados = mockSinistros.filter(s => s.status === 'aprovado');
    const negados = mockSinistros.filter(s => s.status === 'negado');
    const valorPago = aprovados.reduce((sum, s) => sum + (s.valor_aprovado || 0), 0);
    const tempoMedio = mockSinistros.reduce((sum, s) => sum + (s.tempo_processamento || 0), 0) / mockSinistros.length;
    
    setMetricas({
      total_sinistros: mockSinistros.length,
      total_aprovados: aprovados.length,
      total_negados: negados.length,
      valor_total_pago: valorPago,
      tempo_medio_processamento: tempoMedio,
      taxa_automacao: 75 // Percentual simulado
    });
  }, []);

  const buscarSinistros = async () => {
    if (!searchCpf.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite um CPF para buscar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const resultados = await n8nWorkflowService.listarSinistrosPorCpf(searchCpf);
      setSinistros(resultados);
      
      toast({
        title: "Busca realizada",
        description: `${resultados.length} sinistro(s) encontrado(s)`,
      });
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar os sinistros",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      iniciado: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      processando: { color: 'bg-yellow-100 text-yellow-800', icon: Activity },
      aprovado: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      negado: { color: 'bg-red-100 text-red-800', icon: XCircle },
      pendente_analise: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;

    return (
      <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard de Sinistros - 88i</h1>
        <div className="text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sinistros</p>
                <p className="text-2xl font-bold">{metricas.total_sinistros}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{metricas.total_aprovados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metricas.valor_total_pago)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Automação</p>
                <p className="text-2xl font-bold text-blue-600">{metricas.taxa_automacao}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista">Lista de Sinistros</TabsTrigger>
          <TabsTrigger value="busca">Buscar por CPF</TabsTrigger>
          <TabsTrigger value="analise">Análise em Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sinistros Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sinistros.map((sinistro) => (
                  <div key={sinistro.numero_sinistro} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{sinistro.numero_sinistro}</h3>
                        <p className="text-sm text-muted-foreground">
                          Apólice: {sinistro.apolice} | CPF: {sinistro.cpf_segurado}
                        </p>
                      </div>
                      {getStatusBadge(sinistro.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Tipo</p>
                        <p className="text-muted-foreground">
                          {sinistro.tipo_sinistro.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Valor Estimado</p>
                        <p className="text-muted-foreground">
                          {formatCurrency(sinistro.valor_estimado)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Data</p>
                        <p className="text-muted-foreground">
                          {formatDate(sinistro.data_criacao)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Score Fraude</p>
                        <p className={`font-medium ${
                          (sinistro.score_fraude || 0) > 0.7 ? 'text-red-600' : 
                          (sinistro.score_fraude || 0) > 0.4 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {((sinistro.score_fraude || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Visualizar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="busca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Sinistros por CPF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="search-cpf">CPF do Segurado</Label>
                  <Input
                    id="search-cpf"
                    placeholder="000.000.000-00"
                    value={searchCpf}
                    onChange={(e) => setSearchCpf(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={buscarSinistros}
                  disabled={isLoading}
                  className="self-end"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analise" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Triagem Inicial</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Acidentes Pessoais</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Bagagem/Mercadoria</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Detecção de Fraudes</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Processamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(metricas.tempo_medio_processamento)} min
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Meta: 240 min (4 horas)
                  </p>
                  <div className="mt-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block">
                    ✓ Meta atingida
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};