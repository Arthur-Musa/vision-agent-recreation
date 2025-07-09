import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calculator, TrendingUp, FileText } from 'lucide-react';

const UnderwritingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    applicantName: '',
    age: '',
    vehicleType: '',
    vehicleValue: '',
    previousClaims: '',
    location: ''
  });
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateRiskScore = async () => {
    setIsCalculating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock risk calculation
    const baseScore = 50;
    const ageAdjustment = parseInt(formData.age) > 25 ? -10 : +15;
    const vehicleAdjustment = formData.vehicleType === 'luxury' ? +20 : -5;
    const claimsAdjustment = parseInt(formData.previousClaims) * 10;
    
    const calculatedScore = Math.max(0, Math.min(100, baseScore + ageAdjustment + vehicleAdjustment + claimsAdjustment));
    setRiskScore(calculatedScore);
    
    // Generate quote
    const baseQuote = 1200;
    const riskMultiplier = calculatedScore / 50;
    const finalQuote = baseQuote * riskMultiplier;
    
    setQuote({
      monthly: finalQuote / 12,
      annual: finalQuote,
      factors: [
        { name: 'Idade do condutor', impact: ageAdjustment },
        { name: 'Tipo de veículo', impact: vehicleAdjustment },
        { name: 'Histórico de sinistros', impact: claimsAdjustment }
      ]
    });
    
    setIsCalculating(false);
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Baixo', color: 'bg-green-100 text-green-800' };
    if (score < 70) return { level: 'Médio', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Alto', color: 'bg-red-100 text-red-800' };
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

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
                <h1 className="text-xl font-semibold">Underwriting & Risk Assessment</h1>
                <p className="text-sm text-muted-foreground">
                  Risk scoring e cotação instantânea
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dados do Segurado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="applicantName">Nome do Proponente</Label>
                  <Input
                    id="applicantName"
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Idade do condutor principal"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                  <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="luxury">Luxo</SelectItem>
                      <SelectItem value="sport">Esportivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="vehicleValue">Valor do Veículo</Label>
                  <Input
                    id="vehicleValue"
                    value={formData.vehicleValue}
                    onChange={(e) => handleInputChange('vehicleValue', e.target.value)}
                    placeholder="R$ 0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="previousClaims">Sinistros Anteriores</Label>
                  <Input
                    id="previousClaims"
                    type="number"
                    value={formData.previousClaims}
                    onChange={(e) => handleInputChange('previousClaims', e.target.value)}
                    placeholder="Número de sinistros nos últimos 3 anos"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sao-paulo">São Paulo</SelectItem>
                      <SelectItem value="rio-janeiro">Rio de Janeiro</SelectItem>
                      <SelectItem value="belo-horizonte">Belo Horizonte</SelectItem>
                      <SelectItem value="brasilia">Brasília</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={calculateRiskScore}
                  disabled={!isFormValid || isCalculating}
                  className="w-full gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  {isCalculating ? 'Calculando...' : 'Calcular Score de Risco'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {/* Risk Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Score de Risco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {riskScore !== null ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{riskScore}/100</div>
                        <Badge className={getRiskLevel(riskScore).color}>
                          Risco {getRiskLevel(riskScore).level}
                        </Badge>
                      </div>
                      
                      <Progress value={riskScore} className="h-3" />
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Fatores de Risco:</p>
                        {quote?.factors.map((factor: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{factor.name}</span>
                            <span className={factor.impact > 0 ? 'text-red-600' : 'text-green-600'}>
                              {factor.impact > 0 ? '+' : ''}{factor.impact}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Preencha o formulário para calcular o score de risco</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quote */}
              {quote && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cotação Gerada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Valor Mensal</p>
                          <p className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(quote.monthly)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Valor Anual</p>
                        <p className="text-lg font-semibold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(quote.annual)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          Ajustar Cotação
                        </Button>
                        <Button className="flex-1">
                          Emitir Apólice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnderwritingForm;