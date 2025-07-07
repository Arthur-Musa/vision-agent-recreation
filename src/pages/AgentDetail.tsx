import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { insuranceAgents } from "@/data/insuranceAgents";
import { ArrowLeft, Clock, Upload, CheckCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const agent = insuranceAgents.find(a => a.id === id);

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">
            {t({ 'pt-BR': 'Agent não encontrado', 'pt': 'Agent não encontrado', 'en': 'Agent not found' })}
          </h1>
          <Button onClick={() => navigate('/')}>
            {t({ 'pt-BR': 'Voltar ao início', 'pt': 'Voltar ao início', 'en': 'Back to home' })}
          </Button>
        </div>
      </div>
    );
  }

  const complexityColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  const complexityLabels = {
    low: { 'pt-BR': 'Simples', 'pt': 'Simples', 'en': 'Simple' },
    medium: { 'pt-BR': 'Médio', 'pt': 'Médio', 'en': 'Medium' },
    high: { 'pt-BR': 'Complexo', 'pt': 'Complexo', 'en': 'Complex' }
  };

  const texts = {
    back: { 'pt-BR': 'Voltar', 'pt': 'Voltar', 'en': 'Back' },
    useAgent: { 'pt-BR': 'Usar este Agent', 'pt': 'Usar este Agent', 'en': 'Use this Agent' },
    overview: { 'pt-BR': 'Visão Geral', 'pt': 'Visão Geral', 'en': 'Overview' },
    features: { 'pt-BR': 'Funcionalidades', 'pt': 'Funcionalidades', 'en': 'Features' },
    capabilities: { 'pt-BR': 'Capacidades', 'pt': 'Capacidades', 'en': 'Capabilities' },
    supportedFormats: { 'pt-BR': 'Formatos Suportados', 'pt': 'Formatos Suportados', 'en': 'Supported Formats' },
    useCase: { 'pt-BR': 'Caso de Uso', 'pt': 'Caso de Uso', 'en': 'Use Case' },
    estimatedTime: { 'pt-BR': 'Tempo Estimado', 'pt': 'Tempo Estimado', 'en': 'Estimated Time' },
    complexity: { 'pt-BR': 'Complexidade', 'pt': 'Complexidade', 'en': 'Complexity' }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t(texts.back)}
              </Button>
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  `gradient-${agent.category}`
                )}>
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-medium">{t(agent.name)}</h1>
                  <p className="text-sm text-muted-foreground">{agent.category}</p>
                </div>
              </div>
            </div>
            
            <Button onClick={() => navigate('/upload')} className="gap-2">
              <Upload className="h-4 w-4" />
              {t(texts.useAgent)}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t(texts.overview)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t(agent.description)}
                </p>
              </CardContent>
            </Card>

            {/* Use Case */}
            <Card>
              <CardHeader>
                <CardTitle>{t(texts.useCase)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t(agent.useCase)}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>{t(texts.features)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {agent.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{t(feature)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t(texts.estimatedTime)}</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{agent.estimatedTime}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">{t(texts.complexity)}</h3>
                  <Badge className={cn("text-xs", complexityColors[agent.complexityLevel])}>
                    {t(complexityLabels[agent.complexityLevel])}
                  </Badge>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => navigate('/upload')}
                  >
                    <Upload className="h-4 w-4" />
                    {t(texts.useAgent)}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t(texts.supportedFormats)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.documentTypes.map((type, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t(texts.capabilities)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {agent.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm capitalize">
                        {capability.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentDetail;