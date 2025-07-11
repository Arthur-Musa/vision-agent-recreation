import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Eye, FileText, Loader2 } from "lucide-react";

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  details?: string;
  confidence?: number;
}

interface ProcessingProgressProps {
  fileName: string;
  steps: ProcessingStep[];
  currentStep: string;
  overallProgress: number;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  fileName,
  steps,
  currentStep,
  overallProgress
}) => {
  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded-full" />;
    }
  };

  const getStepBadge = (step: ProcessingStep) => {
    switch (step.id) {
      case 'ocr':
        return <FileText className="h-3 w-3" />;
      case 'vision':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Processando: {fileName}
        </CardTitle>
        <Progress value={overallProgress} className="w-full" />
        <span className="text-xs text-muted-foreground">
          {Math.round(overallProgress)}% concluído
        </span>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3 p-2 rounded-md border border-gray-100">
            <div className="flex items-center gap-2">
              {getStepIcon(step)}
              {getStepBadge(step)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{step.name}</span>
                <Badge className={getStatusColor(step.status)} variant="secondary">
                  {step.status === 'processing' ? 'Em andamento' : 
                   step.status === 'completed' ? 'Concluído' :
                   step.status === 'failed' ? 'Falhou' : 'Pendente'}
                </Badge>
              </div>
              
              {step.details && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.details}
                </p>
              )}
              
              {step.confidence && step.status === 'completed' && (
                <div className="mt-1">
                  <Progress value={step.confidence} className="h-1" />
                  <span className="text-xs text-muted-foreground">
                    Confiança: {Math.round(step.confidence)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};