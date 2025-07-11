export const getStatusColor = (status: string) => {
  switch (status) {
    case 'processing': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'completed': return 'bg-green-50 text-green-600 border-green-200';
    case 'flagged': return 'bg-red-50 text-red-600 border-red-200';
    case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'processing': return 'Processando';
    case 'completed': return 'Concluído';
    case 'flagged': return 'Sinalizado';
    case 'pending': return 'Pendente';
    default: return status;
  }
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'APE': return '🩺';
    case 'BAG': return '🧳';
    case 'Auto': return '🚗';
    case 'Residencial': return '🏠';
    case 'Vida': return '❤️';
    default: return '📄';
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const availableAgents = ['Claims Processor', 'Aura', 'Fraud Detector'];

export const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'processing', label: 'Processando' },
  { value: 'completed', label: 'Concluído' },
  { value: 'flagged', label: 'Sinalizado' }
];