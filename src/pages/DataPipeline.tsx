import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Upload,
  Settings,
  Users,
  Brain,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Workflow,
  BarChart3
} from "lucide-react";

interface DatasetItem {
  id: string;
  name: string;
  type: 'claim' | 'document' | 'image' | 'report';
  status: 'processing' | 'completed' | 'failed' | 'pending';
  progress: number;
  source: string;
  annotations: number;
  createdAt: string;
}

interface AnnotationClass {
  id: string;
  name: string;
  type: 'fraud' | 'damage' | 'coverage' | 'priority';
  color: string;
  confidence: number;
  count: number;
}

const DataPipeline = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [datasets, setDatasets] = useState<DatasetItem[]>([
    {
      id: '1',
      name: 'Sinistros Q1 2024',
      type: 'claim',
      status: 'completed',
      progress: 100,
      source: 'API Seguradora A',
      annotations: 1250,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Documentos Médicos',
      type: 'document',
      status: 'processing',
      progress: 65,
      source: 'Upload Manual',
      annotations: 340,
      createdAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'Fotos Veículos',
      type: 'image',
      status: 'pending',
      progress: 0,
      source: 'Mobile App',
      annotations: 0,
      createdAt: '2024-01-22'
    }
  ]);

  const [annotationClasses] = useState<AnnotationClass[]>([
    {
      id: '1',
      name: 'Fraude Suspeita',
      type: 'fraud',
      color: 'red',
      confidence: 87,
      count: 45
    },
    {
      id: '2',
      name: 'Dano Total',
      type: 'damage',
      color: 'orange',
      confidence: 92,
      count: 123
    },
    {
      id: '3',
      name: 'Cobertura Válida',
      type: 'coverage',
      color: 'green',
      confidence: 95,
      count: 890
    },
    {
      id: '4',
      name: 'Alta Prioridade',
      type: 'priority',
      color: 'purple',
      confidence: 78,
      count: 67
    }
  ]);

  const handleCreateDataset = () => {
    toast({
      title: "Dataset criado",
      description: "Novo dataset foi criado e está sendo processado.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Importação iniciada",
      description: "Dados estão sendo importados para o pipeline.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'claim':
        return <FileText className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Camera className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pipeline de Dados</h2>
          <p className="text-muted-foreground">
            Sistema de dataset organizado e fluxo de processamento para sinistros
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleImportData} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar Dados
          </Button>
          <Button onClick={handleCreateDataset}>
            <Database className="mr-2 h-4 w-4" />
            Criar Dataset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="datasets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="annotations">Classes de Anotação</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="workforce">Gestão de Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{datasets.length}</div>
                <p className="text-xs text-muted-foreground">+2 neste mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {datasets.filter(d => d.status === 'processing').length}
                </div>
                <p className="text-xs text-muted-foreground">65% progresso médio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anotações</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {datasets.reduce((acc, d) => acc + d.annotations, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total processadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% vs mês anterior</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {datasets.map((dataset) => (
              <Card key={dataset.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(dataset.type)}
                      <CardTitle className="text-lg">{dataset.name}</CardTitle>
                      <Badge className={getStatusColor(dataset.status)}>
                        {getStatusIcon(dataset.status)}
                        <span className="ml-1 capitalize">{dataset.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{dataset.source}</span>
                      <span>{dataset.annotations} anotações</span>
                      <span>{dataset.createdAt}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{dataset.progress}%</span>
                    </div>
                    <Progress value={dataset.progress} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="annotations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {annotationClasses.map((cls) => (
              <Card key={cls.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{cls.name}</CardTitle>
                  <div className={`h-3 w-3 rounded-full bg-${cls.color}-500`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cls.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {cls.confidence}% confiança
                  </p>
                  <div className="mt-2">
                    <Progress value={cls.confidence} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurar Classes de Anotação</CardTitle>
              <CardDescription>
                Defina tipos especializados para categorização automática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Target className="mr-2 h-4 w-4" />
                  Adicionar Nova Classe
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Regras de Detecção
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Configurável</CardTitle>
              <CardDescription>
                Fluxo personalizado por seguradora com etapas de revisão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Upload className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">1. Importação</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Múltiplas fontes de dados
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold">2. Processamento IA</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      APE+BAG e modelos externos
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">3. Revisão Humana</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Validação por analistas
                    </p>
                  </Card>
                </div>
                
                <Button className="w-full">
                  <Workflow className="mr-2 h-4 w-4" />
                  Configurar Workflow Personalizado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workforce" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Equipe</CardTitle>
              <CardDescription>
                Atribuição inteligente de casos e guidelines para analistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">Analistas Ativos</h4>
                    </div>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">8 disponíveis</p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">Produtividade</h4>
                    </div>
                    <div className="text-2xl font-bold">87%</div>
                    <p className="text-sm text-muted-foreground">Meta: 85%</p>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Target className="mr-2 h-4 w-4" />
                    Configurar Regras de Atribuição
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Definir Guidelines de Anotação
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Relatório de Performance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataPipeline;