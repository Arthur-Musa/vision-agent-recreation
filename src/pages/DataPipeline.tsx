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
  type: 'Claims' | 'ACORD Forms' | 'Fraud Detection' | 'Renewals';
  status: 'processing' | 'ready' | 'training' | 'failed';
  progress: number;
  source: 'Webhook' | 'Direct Upload' | 'Bulk Import CLI' | 'API';
  annotations: number;
  createdAt: string;
}

interface AnnotationClass {
  id: string;
  name: string;
  type: 'FieldExtraction' | 'FraudIndicators' | 'RenewalDiff';
  subclass: string;
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
      name: 'ClaimsDocuments',
      type: 'Claims',
      status: 'ready',
      progress: 100,
      source: 'Webhook',
      annotations: 1250,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'PolicyForms',
      type: 'ACORD Forms',
      status: 'processing',
      progress: 65,
      source: 'Direct Upload',
      annotations: 340,
      createdAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'FraudCases',
      type: 'Fraud Detection',
      status: 'training',
      progress: 45,
      source: 'Bulk Import CLI',
      annotations: 156,
      createdAt: '2024-01-22'
    },
    {
      id: '4',
      name: 'RenewalForms',
      type: 'Renewals',
      status: 'failed',
      progress: 0,
      source: 'API',
      annotations: 0,
      createdAt: '2024-01-25'
    }
  ]);

  const [annotationClasses] = useState<AnnotationClass[]>([
    {
      id: '1',
      name: 'Policy Number',
      type: 'FieldExtraction',
      subclass: 'policy_number',
      color: 'blue',
      confidence: 95,
      count: 1250
    },
    {
      id: '2',
      name: 'Duplicate Claim',
      type: 'FraudIndicators',
      subclass: 'duplicate_claim',
      color: 'red',
      confidence: 87,
      count: 45
    },
    {
      id: '3',
      name: 'Coverage Increase',
      type: 'RenewalDiff',
      subclass: 'coverage_increase',
      color: 'green',
      confidence: 92,
      count: 234
    },
    {
      id: '4',
      name: 'Estimated Amount',
      type: 'FieldExtraction',
      subclass: 'estimated_amount',
      color: 'purple',
      confidence: 89,
      count: 890
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
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
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
                  <div className={`h-3 w-3 rounded-full ${
                    cls.color === 'red' ? 'bg-red-500' :
                    cls.color === 'orange' ? 'bg-orange-500' :
                    cls.color === 'green' ? 'bg-emerald-500' :
                    cls.color === 'purple' ? 'bg-purple-500' : 'bg-primary'
                  }`} />
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
              <CardTitle>Workflow V7 Labs - Insurance Annotation Pipeline</CardTitle>
              <CardDescription>
                7 estágios sequenciais: Annotate → Review → Model → Webhook → Logic → Archive → Sampling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">1. Annotate</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Analista Jr.</p>
                    <p className="text-sm text-muted-foreground">
                      Label de campos obrigatórios (policy_number, date, amount)
                    </p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-green-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold">2. Review</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Analista Sr.</p>
                    <p className="text-sm text-muted-foreground">
                      Verificação de qualidade e correção de rótulos
                    </p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-purple-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold">3. Model</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Data Scientist</p>
                    <p className="text-sm text-muted-foreground">
                      Treinamento OCR+NER pipeline
                    </p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-orange-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Workflow className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold">4. Webhook</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Infra/DevOps</p>
                    <p className="text-sm text-muted-foreground">
                      POST em /v1/trainings/new
                    </p>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4 border-l-4 border-l-red-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold">5. Logic</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Eng. de Dados</p>
                    <p className="text-sm text-muted-foreground">
                      Validar regras: estimated_amount ≤ LMI, incident_date ≥ policy_start
                    </p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-gray-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="h-5 w-5 text-gray-600" />
                      <h4 className="font-semibold">6. Archive</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Sistema</p>
                    <p className="text-sm text-muted-foreground">
                      Armazenar datasets para auditoria
                    </p>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-l-cyan-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-cyan-600" />
                      <h4 className="font-semibold">7. Sampling</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">QA</p>
                    <p className="text-sm text-muted-foreground">
                      5-10% checagem manual periódica
                    </p>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full">
                    <Workflow className="mr-2 h-4 w-4" />
                    Configurar Pipeline V7 Completo
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Definir Annotation Guidelines
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Brain className="mr-2 h-4 w-4" />
                    Train a Model (Split 70/15/15)
                  </Button>
                </div>
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
                      <Users className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">Analistas Ativos</h4>
                    </div>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">8 disponíveis</p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
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