import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { localStorageService } from '@/services/localStorageService';

interface SpreadsheetHeaderProps {
  casesCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onExportCSV: () => void;
  onClearData: () => void;
}

export const SpreadsheetHeader = ({ 
  casesCount, 
  isRefreshing, 
  onRefresh, 
  onExportCSV, 
  onClearData 
}: SpreadsheetHeaderProps) => {
  const navigate = useNavigate();

  const handleClearData = () => {
    if (confirm('Limpar todos os dados?')) {
      localStorageService.clearAllData();
      onClearData();
    }
  };

  return (
    <header className="border-b border-border/40 bg-background sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            
            <div className="border-l border-border/40 pl-3">
              <h1 className="text-lg font-medium text-foreground">Todos os Casos</h1>
              <p className="text-xs text-muted-foreground">
                {casesCount} casos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportCSV}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <Download className="h-3 w-3" />
              CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearData}
              className="gap-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};