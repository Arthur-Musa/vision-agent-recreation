import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AgentDropdown } from '@/components/agents/AgentDropdown';
import { Mail, Send, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Case {
  id: string;
  claimNumber: string;
  type: string;
  status: string;
  agent: string;
  processedAt: string;
  insuredName: string;
  estimatedAmount: number;
}

interface AgentTaskAssignerProps {
  selectedCases: Case[];
  onAssignmentComplete: () => void;
}

export const AgentTaskAssigner = ({ selectedCases, onAssignmentComplete }: AgentTaskAssignerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  const handleAgentSelect = (agentId: string, agent: any) => {
    setSelectedAgent(agentId);
    
    // Pre-fill email content based on selected cases
    const caseNumbers = selectedCases.map(c => c.claimNumber).join(', ');
    const totalValue = selectedCases.reduce((sum, c) => sum + c.estimatedAmount, 0);
    
    setEmailSubject(`Casos atribuídos para análise: ${caseNumbers}`);
    setEmailBody(`Olá ${typeof agent.name === 'string' ? agent.name : agent.name['pt-BR']},

Você foi designado para analisar os seguintes casos:

${selectedCases.map(c => `
• Caso: ${c.claimNumber}
  - Tipo: ${c.type}
  - Segurado: ${c.insuredName}
  - Valor: R$ ${c.estimatedAmount.toLocaleString('pt-BR')}
  - Status: ${c.status}
`).join('')}

Total de casos: ${selectedCases.length}
Valor total estimado: R$ ${totalValue.toLocaleString('pt-BR')}

Por favor, proceda com a análise conforme os procedimentos padrão.

Atenciosamente,
Sistema OLGA - Gestão de Sinistros`);
  };

  const handleAssignment = async () => {
    if (!selectedAgent || !recipientEmail) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um agente e informe o email do destinatário.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);

    try {
      // Simulate email sending (in real app, this would call an email service)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update cases with the assigned agent
      const currentCases = JSON.parse(localStorage.getItem('olga_spreadsheet_cases') || '[]');
      const updatedCases = currentCases.map((case_: Case) => {
        if (selectedCases.some(sc => sc.id === case_.id)) {
          return {
            ...case_,
            agent: selectedAgent,
            status: 'processing',
            lastUpdate: new Date().toISOString()
          };
        }
        return case_;
      });

      localStorage.setItem('olga_spreadsheet_cases', JSON.stringify(updatedCases));

      // Log the email action
      console.log('Email enviado:', {
        to: recipientEmail,
        subject: emailSubject,
        body: emailBody,
        cases: selectedCases.map(c => c.claimNumber),
        agent: selectedAgent
      });

      toast({
        title: "Atribuição realizada com sucesso",
        description: `${selectedCases.length} caso(s) atribuído(s) para ${selectedAgent} e email enviado.`,
      });

      setIsOpen(false);
      onAssignmentComplete();
      
      // Reset form
      setSelectedAgent('');
      setEmailSubject('');
      setEmailBody('');
      setRecipientEmail('');

    } catch (error) {
      toast({
        title: "Erro na atribuição",
        description: "Erro ao atribuir casos e enviar email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          <UserCheck className="h-3 w-3 mr-1" />
          Atribuir e Notificar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Atribuir Casos e Enviar Email
          </DialogTitle>
          <DialogDescription>
            Selecione um agente e configure o email de notificação para {selectedCases.length} caso(s) selecionado(s).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cases Summary */}
          <div className="bg-muted/30 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">Casos Selecionados:</h4>
            <div className="space-y-1">
              {selectedCases.map(case_ => (
                <div key={case_.id} className="text-xs text-muted-foreground flex justify-between">
                  <span>{case_.claimNumber} - {case_.insuredName}</span>
                  <span>R$ {case_.estimatedAmount.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agent-select">Agente Responsável</Label>
            <AgentDropdown
              value={selectedAgent}
              onValueChange={handleAgentSelect}
              placeholder="Selecione o agente que será responsável..."
            />
          </div>

          {/* Email Configuration */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium">Configuração do Email</h4>
            
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Email do Destinatário *</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="agente@empresa.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject">Assunto</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">Mensagem</Label>
              <Textarea
                id="email-body"
                rows={8}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isAssigning}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAssignment}
              disabled={isAssigning || !selectedAgent || !recipientEmail}
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" />
                  Atribuir e Enviar Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};