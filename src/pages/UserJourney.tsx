import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserFlowDiagram } from '@/components/navigation/UserFlowDiagram';
import { ImprovedNavigation } from '@/components/navigation/ImprovedNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  UserCircle, 
  Brain, 
  Info,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

const UserJourney = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUserType, setSelectedUserType] = useState<'newUser' | 'powerUser' | 'analyst'>('newUser');

  const userProfiles = {
    newUser: {
      title: 'Novo Usuário',
      description: 'Primeira vez usando a plataforma Olga',
      icon: <UserCircle className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      recommendations: [
        'Comece com o Chat Concierge para entender suas necessidades',
        'Faça upload de um documento de exemplo',
        'Explore os agentes disponíveis',
        'Acompanhe uma análise ao vivo'
      ]
    },
    powerUser: {
      title: 'Usuário Avançado',
      description: 'Já conhece a plataforma e busca eficiência',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      recommendations: [
        'Use o Dashboard para visão geral',
        'Workflow ao Vivo para análises complexas',
        'Gerencie casos em lote',
        'Configure agentes personalizados'
      ]
    },
    analyst: {
      title: 'Analista/Especialista',
      description: 'Foco em configuração e análise avançada',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      recommendations: [
        'Revise casos pendentes e sinistros em aberto',
        'Analise coberturas e validação de apólices',
        'Monitore métricas e performance do sistema', 
        'Configure agentes apenas quando necessário'
      ]
    }
  };

  const currentIssues = [
    {
      type: 'warning',
      title: 'Navegação Fragmentada',
      description: 'Usuários se perdem entre múltiplas páginas sem direcionamento claro',
      solution: 'Implementar navegação contextual e breadcrumbs'
    },
    {
      type: 'error',
      title: 'Falta de Onboarding',
      description: 'Novos usuários não sabem por onde começar',
      solution: 'Criar jornada guiada e tutorial interativo'
    },
    {
      type: 'info',
      title: 'Redundância de Funcionalidades',
      description: 'Chat e Upload fazem coisas similares mas separadamente',
      solution: 'Integrar em workflow único com Live Analysis'
    }
  ];

  const proposedImprovements = [
    {
      title: 'Homepage Inteligente',
      description: 'Detectar tipo de usuário e mostrar jornada personalizada',
      impact: 'Alto',
      effort: 'Médio'
    },
    {
      title: 'Workflow Unificado',
      description: 'Live Workflow como centro da experiência',
      impact: 'Alto', 
      effort: 'Alto'
    },
    {
      title: 'Navegação Contextual',
      description: 'Menu inteligente baseado no contexto atual',
      impact: 'Médio',
      effort: 'Baixo'
    },
    {
      title: 'Onboarding Interativo',
      description: 'Tutorial guiado para novos usuários',
      impact: 'Alto',
      effort: 'Médio'
    }
  ];

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
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
              <h1 className="text-xl font-semibold">Experiência do Usuário & Jornadas</h1>
              <p className="text-sm text-muted-foreground">
                Análise e otimização dos fluxos da plataforma Olga
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Análise Atual</TabsTrigger>
            <TabsTrigger value="journeys">Jornadas</TabsTrigger>
            <TabsTrigger value="navigation">Navegação</TabsTrigger>
            <TabsTrigger value="improvements">Melhorias</TabsTrigger>
          </TabsList>

          {/* Análise Atual */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Problemas Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentIssues.map((issue, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              Solução: {issue.solution}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jornadas */}
          <TabsContent value="journeys" className="space-y-6">
            {/* User Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Perfil de Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(userProfiles).map(([key, profile]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedUserType === key
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedUserType(key as any)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${profile.color}`}>
                            {profile.icon}
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">{profile.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {profile.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Recomendações para {userProfiles[selectedUserType].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userProfiles[selectedUserType].recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Flow Diagram */}
            <UserFlowDiagram
              currentRoute={location.pathname}
              userType={selectedUserType}
              onNavigate={(route) => navigate(route)}
            />
          </TabsContent>

          {/* Navegação */}
          <TabsContent value="navigation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Navegação Aprimorado</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Navegação contextual e inteligente baseada no perfil do usuário
                </p>
              </CardHeader>
              <CardContent>
                <ImprovedNavigation
                  currentRoute={location.pathname}
                  onNavigate={(route) => navigate(route)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Melhorias */}
          <TabsContent value="improvements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proposedImprovements.map((improvement, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{improvement.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getImpactColor(improvement.impact)}>
                          {improvement.impact}
                        </Badge>
                        <Badge variant="outline">
                          {improvement.effort}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {improvement.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos Recomendados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <span>Implementar Live Workflow como experiência principal</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <span>Criar onboarding interativo para novos usuários</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <span>Adicionar navegação contextual e breadcrumbs</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                    <span>Personalizar homepage baseada no perfil do usuário</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserJourney;