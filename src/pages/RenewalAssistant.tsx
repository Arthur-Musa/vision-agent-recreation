import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, ArrowRight } from 'lucide-react';

const RenewalAssistant = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<{ old?: File; new?: File }>({});

  const handleFileUpload = (type: 'old' | 'new', file: File) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleCompare = () => {
    if (files.old && files.new) {
      navigate('/renewal/preview', { state: { files } });
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
                <h1 className="text-xl font-semibold">Policy Renewal Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  Comparação e renovação de apólices
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-4">Renovação de Apólices</h2>
            <p className="text-muted-foreground">
              Faça upload das apólices antiga e nova para comparação automática
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Apólice Antiga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload da apólice atual
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('old', e.target.files[0])}
                    className="hidden"
                    id="old-file"
                  />
                  <label htmlFor="old-file">
                    <Button variant="outline" className="cursor-pointer">
                      Selecionar Arquivo
                    </Button>
                  </label>
                  {files.old && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {files.old.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Apólice Nova
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça upload da nova proposta
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('new', e.target.files[0])}
                    className="hidden"
                    id="new-file"
                  />
                  <label htmlFor="new-file">
                    <Button variant="outline" className="cursor-pointer">
                      Selecionar Arquivo
                    </Button>
                  </label>
                  {files.new && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {files.new.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleCompare}
              disabled={!files.old || !files.new}
              className="gap-2"
            >
              Comparar Apólices
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RenewalAssistant;