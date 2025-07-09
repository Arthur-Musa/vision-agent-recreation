import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, AlertTriangle, Shield, Eye, FileText, Clock } from 'lucide-react';

const FraudDashboard = () => {
  const navigate = useNavigate();
  
  const suspiciousCases = [
    {
      id: '1',
      policyNumber: 'AUTO-789012',
      insuredName: 'Carlos Silva',
      suspicionLevel: 85,
      reasons: ['Múltiplos sinistros em período curto', 'Valor estimado acima da média'],
      status: 'under_review',
      createdAt: '2024-01-15T08:30:00Z'
    },
    {
      id: '2',
      policyNumber: 'RES-456789',
      insuredName: 'Ana Costa',
      suspicionLevel: 92,
      reasons: ['Documentos inconsistentes', 'Padrão de histórico suspeito'],
      status: 'flagged',
      createdAt: '2024-01-14T16:20:00Z'
    },
    {
      id: '3',
      policyNumber: 'VIDA-123789',
      insuredName: 'Pedro Santos',
      suspicionLevel: 78,
      reasons: ['Valor de sinistro muito alto', 'Beneficiário recente'],
      status: 'investigating',
      createdAt: '2024-01-13T11:45:00Z'
    }
  ];

  const fraudStats = {
    totalCases: 127,
    flaggedCases: 23,
    underReview: 12,
    falsePositives: 8,
    detectionRate: 89.3
  };

  const getSuspicionColor = (level: number) => {
    if (level < 50) return 'bg-green-100 text-green-800';
    if (level < 70) return 'bg-yellow-100 text-yellow-800';
    if (level < 85) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSuspicionLevel = (level: number) => {
    if (level < 50) return 'Baixo';
    if (level < 70) return 'Médio';
    if (level < 85) return 'Alto';
    return 'Crítico';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'cleared': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'flagged': return 'Sinalizado';
      case 'under_review': return 'Em Análise';
      case 'investigating': return 'Investigando';
      case 'cleared': return 'Liberado';
      default: return status;
    }
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
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Fraud Detection Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Detecção de fraudes e anomalias • Beta
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Beta
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Casos</p>
                  <p className="text-2xl font-bold">{fraudStats.totalCases}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sinalizados</p>
                  <p className="text-2xl font-bold text-red-600">{fraudStats.flaggedCases}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Análise</p>
                  <p className="text-2xl font-bold text-yellow-600">{fraudStats.underReview}</p>
                </div>
                <Eye className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Falsos Positivos</p>
                  <p className="text-2xl font-bold text-green-600">{fraudStats.falsePositives}</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Detecção</p>
                  <p className="text-2xl font-bold text-blue-600">{fraudStats.detectionRate}%</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suspicious Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Casos Suspeitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suspiciousCases.map((case_) => (
                <div key={case_.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{case_.policyNumber}</h3>
                      <p className="text-sm text-muted-foreground">{case_.insuredName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(case_.status)}>
                        {getStatusText(case_.status)}
                      </Badge>
                      <Badge className={getSuspicionColor(case_.suspicionLevel)}>
                        {getSuspicionLevel(case_.suspicionLevel)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Nível de Suspeição</span>
                      <span className="font-medium">{case_.suspicionLevel}%</span>
                    </div>
                    <Progress value={case_.suspicionLevel} className="h-2" />
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">Razões para Suspeita:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {case_.reasons.map((reason, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(case_.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Revisar
                      </Button>
                      <Button size="sm">
                        Investigar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Recurso em Beta</h4>
                <p className="text-sm text-blue-800">
                  O sistema de detecção de fraudes está em fase beta. Os resultados devem ser 
                  sempre validados por um especialista antes de tomar decisões finais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FraudDashboard;