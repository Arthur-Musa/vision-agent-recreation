import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Shield, 
  DollarSign,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  description: string;
}

interface ProcessingMetric {
  period: string;
  totalClaims: number;
  processed: number;
  avgTime: number;
  accuracy: number;
  fraudDetected: number;
  costSavings: number;
}

const ClaimsMetricsDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // V7Labs inspired metrics
  const keyMetrics: MetricCard[] = [
    {
      title: 'Processing Time Reduction',
      value: '67%',
      change: '+12% vs last month',
      trend: 'up',
      icon: <Clock className="h-5 w-5" />,
      description: 'Average time from FNOL to decision reduced from 23.1 days to 7.8 days'
    },
    {
      title: 'Cost Reduction',
      value: '43%',
      change: '+8% vs last month',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Total operational cost savings through automation'
    },
    {
      title: 'Accuracy Rate',
      value: '99.2%',
      change: '+0.3% vs last month',
      trend: 'up',
      icon: <Target className="h-5 w-5" />,
      description: 'Data extraction and processing accuracy across all document types'
    },
    {
      title: 'Fraud Detection Rate',
      value: '94.7%',
      change: '+5.2% vs last month',
      trend: 'up',
      icon: <Shield className="h-5 w-5" />,
      description: 'Successful identification of fraudulent claims before payout'
    },
    {
      title: 'Documents Processed',
      value: '12,847',
      change: '+2,340 vs last month',
      trend: 'up',
      icon: <FileText className="h-5 w-5" />,
      description: 'Total documents processed across all claim types'
    },
    {
      title: 'Straight-Through Processing',
      value: '78%',
      change: '+15% vs last month',
      trend: 'up',
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Claims processed end-to-end without human intervention'
    }
  ];

  const processingData: ProcessingMetric[] = [
    {
      period: 'Last 7 days',
      totalClaims: 1247,
      processed: 1186,
      avgTime: 4.2,
      accuracy: 99.1,
      fraudDetected: 23,
      costSavings: 87430
    },
    {
      period: 'Last 30 days',
      totalClaims: 5234,
      processed: 4987,
      avgTime: 4.8,
      accuracy: 98.9,
      fraudDetected: 97,
      costSavings: 342100
    },
    {
      period: 'Last 90 days',
      totalClaims: 15672,
      processed: 14893,
      avgTime: 5.1,
      accuracy: 98.7,
      fraudDetected: 287,
      costSavings: 1023400
    }
  ];

  const documentTypeMetrics = [
    { type: 'FNOL Forms', processed: 4230, accuracy: 99.4, avgTime: 1.2 },
    { type: 'Police Reports', processed: 2847, accuracy: 97.8, avgTime: 3.4 },
    { type: 'Medical Records', processed: 1923, accuracy: 98.9, avgTime: 2.8 },
    { type: 'Photos & Images', processed: 3456, accuracy: 96.2, avgTime: 1.8 },
    { type: 'Repair Estimates', processed: 1876, accuracy: 99.1, avgTime: 1.5 },
    { type: 'Legal Documents', processed: 543, accuracy: 95.7, avgTime: 4.2 }
  ];

  const agentPerformance = [
    { name: 'Document Classifier', uptime: 99.8, throughput: 1240, accuracy: 99.2 },
    { name: 'OCR Engine', uptime: 99.9, throughput: 980, accuracy: 99.4 },
    { name: 'Fraud Detective', uptime: 98.7, throughput: 450, accuracy: 94.7 },
    { name: 'Risk Analyzer', uptime: 99.5, throughput: 670, accuracy: 97.3 },
    { name: 'Context Analyzer', uptime: 99.1, throughput: 780, accuracy: 98.1 }
  ];

  const getCurrentMetric = () => {
    return processingData.find(d => d.period.includes(selectedPeriod.replace('d', ' days'))) || processingData[0];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  const currentMetric = getCurrentMetric();

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
                onClick={() => navigate('/claims')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Claims Processing Metrics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time performance dashboard • V7Labs Analytics Style
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyMetrics.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {metric.icon}
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <span className="text-sm text-green-600">{metric.change}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Period Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentMetric.period} Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{currentMetric.totalClaims.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Claims</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentMetric.processed.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentMetric.avgTime}h</div>
                <div className="text-sm text-muted-foreground">Avg. Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{currentMetric.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{currentMetric.fraudDetected}</div>
                <div className="text-sm text-muted-foreground">Fraud Detected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {(currentMetric.costSavings / 1000).toFixed(0)}k
                </div>
                <div className="text-sm text-muted-foreground">Cost Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Type Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Type Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentTypeMetrics.map((doc, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{doc.type}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span>{doc.processed.toLocaleString()} docs</span>
                        <Badge variant="outline">{doc.accuracy}%</Badge>
                        <span>{doc.avgTime}h avg</span>
                      </div>
                    </div>
                    <Progress value={doc.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                AI Agent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.map((agent, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{agent.name}</span>
                      <div className="flex items-center gap-2">
                        {agent.uptime >= 99 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {agent.uptime}% uptime
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>Throughput: {agent.throughput}/day</div>
                      <div>Accuracy: {agent.accuracy}%</div>
                    </div>
                    <Progress value={agent.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Speed Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Processing Speed Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600 mb-2">23.1 days</div>
                <div className="text-sm font-medium mb-1">Traditional Manual Process</div>
                <div className="text-xs text-muted-foreground">Industry average before automation</div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">12.5 days</div>
                <div className="text-sm font-medium mb-1">Basic OCR Systems</div>
                <div className="text-xs text-muted-foreground">Traditional OCR with manual validation</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">4.2 hours</div>
                <div className="text-sm font-medium mb-1">Olga AI Processing</div>
                <div className="text-xs text-muted-foreground">V7Labs-style automation with 99.2% accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Processing Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Processing Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'claim-2847', type: 'Auto Collision', status: 'OCR Processing', progress: 75, eta: '2m' },
                { id: 'claim-2848', type: 'Property Damage', status: 'Fraud Detection', progress: 45, eta: '4m' },
                { id: 'claim-2849', type: 'Medical Claim', status: 'Data Validation', progress: 90, eta: '1m' },
                { id: 'claim-2850', type: 'Liability Claim', status: 'Document Classification', progress: 30, eta: '6m' }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium text-sm">{item.id}</div>
                      <div className="text-xs text-muted-foreground">{item.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">{item.status}</div>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={item.progress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground">{item.eta}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClaimsMetricsDashboard;