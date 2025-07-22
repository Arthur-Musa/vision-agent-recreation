
import { useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  console.log('Index: Rendering');
  
  const [userName] = useState('Ana');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Simplified welcome section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {getTimeGreeting()}, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo à plataforma Olga
          </p>
        </div>

        {/* Basic status card */}
        <div className="max-w-md mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Sistema Funcionando</h2>
            <p className="text-sm text-muted-foreground">
              A aplicação foi carregada com sucesso.
            </p>
          </div>
        </div>

        {/* Components with error boundaries */}
        <div className="mt-8 space-y-4">
          <ErrorBoundary fallback={
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Erro ao carregar componente AskGoBox
              </p>
            </div>
          }>
            <div className="bg-muted/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                AskGoBox será carregado quando disponível
              </p>
            </div>
          </ErrorBoundary>

          <ErrorBoundary fallback={
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Erro ao carregar AgentCards
              </p>
            </div>
          }>
            <div className="bg-muted/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                AgentCards será carregado quando disponível
              </p>
            </div>
          </ErrorBoundary>

          <ErrorBoundary fallback={
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Erro ao carregar RecentCasesSection
              </p>
            </div>
          }>
            <div className="bg-muted/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                RecentCasesSection será carregado quando disponível
              </p>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Index;
