import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { DocumentUpload } from '@/types/agents';

interface AnalysisInputSectionProps {
  inputText: string;
  setInputText: (value: string) => void;
  isProcessing: boolean;
  uploadedFiles: DocumentUpload[];
  onAnalysis: () => void;
}

export const AnalysisInputSection = ({ 
  inputText, 
  setInputText, 
  isProcessing, 
  uploadedFiles, 
  onAnalysis 
}: AnalysisInputSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Descrição do Sinistro
        </CardTitle>
        <CardDescription>
          Descreva o sinistro APE (Acidentes Pessoais) ou BAG (Bagagem) para análise especializada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Descreva o sinistro: local, data, circunstâncias, danos, valores, documentos disponíveis..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          className="resize-none"
        />
        
        <Button 
          onClick={onAnalysis} 
          disabled={isProcessing || (!inputText.trim() && uploadedFiles.length === 0)}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analisando em tempo real...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4 mr-2" />
              Analisar Sinistro APE + BAG
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};