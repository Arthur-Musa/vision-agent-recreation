import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Save, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssistantConfig {
  id: string;
  name: string;
  assistantId: string;
  description: string;
  enabled: boolean;
}

export const AssistantSettings = () => {
  const [assistants, setAssistants] = useState<AssistantConfig[]>([]);
  const [newAssistant, setNewAssistant] = useState({
    name: '',
    assistantId: '',
    description: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Carrega assistants salvos
    const savedAssistants = localStorage.getItem('openai_assistants');
    if (savedAssistants) {
      setAssistants(JSON.parse(savedAssistants));
    }
  }, []);

  const saveAssistants = (updatedAssistants: AssistantConfig[]) => {
    localStorage.setItem('openai_assistants', JSON.stringify(updatedAssistants));
    setAssistants(updatedAssistants);
  };

  const addAssistant = () => {
    if (!newAssistant.name || !newAssistant.assistantId) {
      toast({
        title: 'Erro',
        description: 'Nome e Assistant ID são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    const assistant: AssistantConfig = {
      id: Date.now().toString(),
      name: newAssistant.name,
      assistantId: newAssistant.assistantId,
      description: newAssistant.description,
      enabled: true
    };

    const updatedAssistants = [...assistants, assistant];
    saveAssistants(updatedAssistants);
    
    setNewAssistant({ name: '', assistantId: '', description: '' });
    
    toast({
      title: 'Assistant adicionado',
      description: `${assistant.name} foi configurado com sucesso.`,
    });
  };

  const removeAssistant = (id: string) => {
    const updatedAssistants = assistants.filter(a => a.id !== id);
    saveAssistants(updatedAssistants);
    
    toast({
      title: 'Assistant removido',
      description: 'Configuração removida com sucesso.',
    });
  };

  const toggleAssistant = (id: string) => {
    const updatedAssistants = assistants.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    saveAssistants(updatedAssistants);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <CardTitle>Assistants OpenAI</CardTitle>
        </div>
        <CardDescription>
          Configure os assistants criados na OpenAI Platform para usar nos agentes de IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            <strong>Como obter Assistant IDs:</strong>
            <ol className="mt-2 text-sm list-decimal list-inside space-y-1">
              <li>Acesse <a href="https://platform.openai.com/assistants" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com/assistants</a></li>
              <li>Clique no assistant desejado</li>
              <li>Copie o ID que aparece no formato "asst_xxxxxx"</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Adicionar novo assistant */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Adicionar Novo Assistant</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assistant-name">Nome do Agent</Label>
              <Input
                id="assistant-name"
                placeholder="Ex: Processador de Sinistros"
                value={newAssistant.name}
                onChange={(e) => setNewAssistant(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assistant-id">Assistant ID</Label>
              <Input
                id="assistant-id"
                placeholder="asst_xxxxxx"
                value={newAssistant.assistantId}
                onChange={(e) => setNewAssistant(prev => ({ ...prev, assistantId: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assistant-description">Descrição (Opcional)</Label>
            <Input
              id="assistant-description"
              placeholder="Descrição do que este assistant faz"
              value={newAssistant.description}
              onChange={(e) => setNewAssistant(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <Button onClick={addAssistant} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Assistant
          </Button>
        </div>

        {/* Lista de assistants configurados */}
        {assistants.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Assistants Configurados</h3>
            
            {assistants.map((assistant) => (
              <div key={assistant.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{assistant.name}</h4>
                    <Badge variant={assistant.enabled ? "default" : "secondary"}>
                      {assistant.enabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAssistant(assistant.id)}
                    >
                      {assistant.enabled ? "Desativar" : "Ativar"}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeAssistant(assistant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Assistant ID:</strong> {assistant.assistantId}</p>
                  {assistant.description && (
                    <p><strong>Descrição:</strong> {assistant.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {assistants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum assistant configurado ainda.</p>
            <p className="text-sm">Adicione um assistant acima para começar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};