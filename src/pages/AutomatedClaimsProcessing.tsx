import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Upload, 
  Brain, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Eye,
  Clock,
  Target,
  TrendingUp,
  Zap,
  PlayCircle,
  PauseCircle,
  SkipForward,
  RotateCcw
} from 'lucide-react';

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  timestamp?: string;
  agent: string;
  confidence?: number;
  extractedData?: Record<string, any>;
  validationResults?: Array<{
    field: string;
    status: 'valid' | 'warning' | 'error';
    message: string;
  }>;
}

interface ClaimDocument {
  id: string;
  name: string;
  type: 'fnol' | 'police_report' | 'medical' | 'photos' | 'estimate' | 'legal';
  size: number;
  confidence: number;
  extractedFields: number;
  processingTime: number;
  status: 'completed' | 'processing' | 'error';
}

const AutomatedClaimsProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<ClaimDocument[]>([]);
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [processingSpeed, setProcessingSpeed] = useState(1);

  // V7Labs style processing pipeline
  const initializePipeline = () => {
    const processingSteps: ProcessingStep[] = [
      {
        id: 'document-intake',
        name: 'Document Intake & Classification',
        description: 'AI-powered document ingestion with multi-format support (PDF, images, emails)',
        status: 'pending',
        progress: 0,
        agent: 'Document Classifier'
      },
      {
        id: 'ocr-extraction',
        name: 'OCR & Data Extraction',
        description: 'Advanced OCR with 99.9% accuracy including handwritten notes and complex layouts',
        status: 'pending',
        progress: 0,
        agent: 'OCR Engine'
      },
      {
        id: 'context-analysis',
        name: 'Contextual Analysis',
        description: 'LLM-powered understanding of document relationships and context',
        status: 'pending',
        progress: 0,
        agent: 'Context Analyzer'
      },
      {
        id: 'data-validation',
        name: 'Data Validation & Enrichment',
        description: 'Cross-reference extracted data against policies and external databases',
        status: 'pending',
        progress: 0,
        agent: 'Validation Engine'
      },
      {
        id: 'fraud-detection',
        name: 'Fraud Pattern Detection',
        description: 'ML-based fraud detection analyzing patterns, timing, and inconsistencies',
        status: 'pending',
        progress: 0,
        agent: 'Fraud Detective'
      },
      {
        id: 'risk-assessment',
        name: 'Risk Assessment & Scoring',
        description: 'Generate comprehensive risk scores and recommendations',
        status: 'pending',
        progress: 0,
        agent: 'Risk Analyzer'
      },
      {
        id: 'decision-routing',
        name: 'Decision & Routing',
        description: 'Automated decision making with human-in-the-loop for complex cases',
        status: 'pending',
        progress: 0,
        agent: 'Decision Engine'
      }
    ];
    
    setSteps(processingSteps);
  };

  // Handle initial query from navigation
  useEffect(() => {
    const state = location.state as { documents?: File[], autoStart?: boolean };
    if (state?.documents) {
      const claimDocs: ClaimDocument[] = state.documents.map((file, index) => ({
        id: `doc-${index}`,
        name: file.name,
        type: detectDocumentType(file.name),
        size: file.size,
        confidence: 0,
        extractedFields: 0,
        processingTime: 0,
        status: 'processing'
      }));
      setDocuments(claimDocs);
      
      if (state.autoStart) {
        initializePipeline();
        startProcessing();
      }
    } else {
      initializePipeline();
    }
  }, [location.state]);

  const detectDocumentType = (filename: string): ClaimDocument['type'] => {
    const name = filename.toLowerCase();
    if (name.includes('fnol') || name.includes('notice')) return 'fnol';
    if (name.includes('police') || name.includes('incident')) return 'police_report';
    if (name.includes('medical') || name.includes('hospital')) return 'medical';
    if (name.includes('photo') || name.includes('image')) return 'photos';
    if (name.includes('estimate') || name.includes('repair')) return 'estimate';
    if (name.includes('legal') || name.includes('court')) return 'legal';
    return 'fnol';
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setIsPaused(false);
    
    for (let i = currentStep; i < steps.length; i++) {
      if (isPaused) break;
      
      setCurrentStep(i);
      await processStep(i);
      
      // Update overall progress
      setOverallProgress(((i + 1) / steps.length) * 100);
    }
    
    setIsProcessing(false);
    toast({
      title: "✅ Processing Complete",
      description: "All documents processed successfully with high confidence scores."
    });
  };

  const processStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    
    // Mark as processing
    setSteps(prev => prev.map((s, idx) => 
      idx === stepIndex ? { ...s, status: 'processing', timestamp: new Date().toISOString() } : s
    ));

    // Simulate V7Labs processing speeds based on step type
    const baseTime = 1000 + Math.random() * 2000; // 1-3 seconds base
    const adjustedTime = baseTime / processingSpeed;
    
    // Progress animation
    for (let progress = 0; progress <= 100; progress += 5) {
      if (isPaused) return;
      
      setSteps(prev => prev.map((s, idx) => 
        idx === stepIndex ? { ...s, progress } : s
      ));
      
      await new Promise(resolve => setTimeout(resolve, adjustedTime / 20));
    }
    
    // Complete the step with realistic results
    const completedStep = {
      ...step,
      status: 'completed' as const,
      progress: 100,
      confidence: 0.85 + Math.random() * 0.14, // 85-99% confidence
      extractedData: generateMockExtractedData(step.id),
      validationResults: generateMockValidation(step.id)
    };
    
    setSteps(prev => prev.map((s, idx) => 
      idx === stepIndex ? completedStep : s
    ));

    // Update documents processing status
    if (stepIndex === 1) { // OCR step
      setDocuments(prev => prev.map(doc => ({
        ...doc,
        status: 'completed',
        confidence: 0.85 + Math.random() * 0.14,
        extractedFields: Math.floor(Math.random() * 20) + 10,
        processingTime: Math.floor(Math.random() * 3000) + 1000
      })));
    }
  };

  const generateMockExtractedData = (stepId: string) => {
    const dataTemplates = {
      'document-intake': {
        documentTypes: ['FNOL Form', 'Police Report', 'Medical Records'],
        totalPages: 12,
        classification_confidence: 0.97
      },
      'ocr-extraction': {
        extractedFields: 47,
        handwrittenFields: 8,
        accuracy: 0.994,
        policyNumber: 'AUTO-789456',
        claimAmount: 'R$ 23,750.00'
      },
      'fraud-detection': {
        riskScore: 'LOW',
        suspiciousPatterns: 0,
        historicalClaims: 2,
        timelineConsistency: 'VALID'
      }
    };
    
    return dataTemplates[stepId as keyof typeof dataTemplates] || {};
  };

  const generateMockValidation = (stepId: string) => {
    const validationTemplates = {
      'data-validation': [
        { field: 'Policy Number', status: 'valid' as const, message: 'Valid and active policy' },
        { field: 'Incident Date', status: 'valid' as const, message: 'Within coverage period' },
        { field: 'Claim Amount', status: 'warning' as const, message: 'Exceeds typical range for this claim type' }
      ]
    };
    
    return validationTemplates[stepId as keyof typeof validationTemplates] || [];
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (!isPaused && isProcessing) {
      startProcessing();
    }
  };

  const handleSkipStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleRetryStep = () => {
    if (currentStep >= 0) {
      processStep(currentStep);
    }
  };

  const getStepIcon = (stepId: string, status: string) => {
    const icons = {
      'document-intake': Upload,
      'ocr-extraction': FileText,
      'context-analysis': Brain,
      'data-validation': CheckCircle,
      'fraud-detection': Shield,
      'risk-assessment': Target,
      'decision-routing': TrendingUp
    };
    
    const IconComponent = icons[stepId as keyof typeof icons] || FileText;
    
    const statusColors = {
      pending: 'text-muted-foreground',
      processing: 'text-blue-500',
      completed: 'text-green-500',
      error: 'text-red-500'
    };
    
    return <IconComponent className={`h-5 w-5 ${statusColors[status as keyof typeof statusColors]}`} />;
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons = {
      fnol: '📋',
      police_report: '🚔',
      medical: '🏥',
      photos: '📸',
      estimate: '💰',
      legal: '⚖️'
    };
    return icons[type as keyof typeof icons] || '📄';
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
                onClick={() => navigate('/claims')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Olga Automated Claims Processing
                </h1>
                <p className="text-sm text-muted-foreground">
                  V7Labs-style AI-powered claims automation with 99.9% accuracy
                </p>
              </div>
            </div>
            
            {/* Processing Controls */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetryStep}
                disabled={!isProcessing}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSkipStep}
                disabled={!isProcessing}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePauseResume}
                disabled={!isProcessing}
              >
                {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
              </Button>
              
              {!isProcessing && currentStep === 0 && (
                <Button onClick={startProcessing} className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Start Processing
                </Button>
              )}
            </div>
          </div>
          
          {/* Overall Progress */}
          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}% Complete</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Documents */}
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Uploaded Documents</h2>
            <p className="text-sm text-muted-foreground">
              {documents.length} documents ready for processing
            </p>
          </div>
          
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/upload')}
                >
                  Upload Documents
                </Button>
              </div>
            ) : (
              documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDocumentTypeIcon(doc.type)}</span>
                        <div>
                          <h3 className="font-medium text-sm">{doc.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {doc.type.replace('_', ' ')} • {(doc.size / 1024).toFixed(1)}KB
                          </p>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={doc.status === 'completed' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    
                    {doc.status === 'completed' && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Confidence:</span>
                          <span className="font-medium">{(doc.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Fields extracted:</span>
                          <span className="font-medium">{doc.extractedFields}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Processing time:</span>
                          <span className="font-medium">{(doc.processingTime / 1000).toFixed(1)}s</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Processing Pipeline */}
        <div className="flex-1">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">AI Processing Pipeline</h2>
            <p className="text-sm text-muted-foreground">
              Advanced multi-stage processing with human-in-the-loop validation
            </p>
          </div>
          
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
            {steps.map((step, index) => (
              <Card 
                key={step.id} 
                className={`transition-all duration-300 ${
                  index === currentStep && isProcessing ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStepIcon(step.id, step.status)}
                      <div>
                        <CardTitle className="text-base">{step.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {step.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {(step.confidence * 100).toFixed(1)}%
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          step.status === 'completed' ? 'secondary' :
                          step.status === 'processing' ? 'default' :
                          step.status === 'error' ? 'destructive' : 'outline'
                        }
                      >
                        {step.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Progress Bar */}
                  {(step.status === 'processing' || step.progress > 0) && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{step.progress}%</span>
                      </div>
                      <Progress value={step.progress} className="h-2" />
                    </div>
                  )}
                  
                  {/* Agent Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Brain className="h-3 w-3" />
                    <span>Agent: {step.agent}</span>
                    {step.timestamp && (
                      <>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(step.timestamp).toLocaleTimeString('pt-BR')}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Extracted Data */}
                  {step.extractedData && Object.keys(step.extractedData).length > 0 && (
                    <div className="bg-muted/50 rounded p-3 mb-2">
                      <h4 className="text-sm font-medium mb-2">Extracted Data:</h4>
                      {Object.entries(step.extractedData).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs mb-1">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Validation Results */}
                  {step.validationResults && step.validationResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Validation Results:</h4>
                      {step.validationResults.map((result, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {result.status === 'valid' && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {result.status === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                          {result.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          <span className="font-medium">{result.field}:</span>
                          <span>{result.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedClaimsProcessing;