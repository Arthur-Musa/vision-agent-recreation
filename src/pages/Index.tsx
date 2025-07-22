
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Sistema de Agentes IA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie seus agentes inteligentes
            </p>
            <a 
              href="/agent-system" 
              className="text-primary hover:underline text-sm font-medium"
            >
              Acessar →
            </a>
          </div>

          <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Upload de Documentos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Envie e processe documentos
            </p>
            <a 
              href="/upload" 
              className="text-primary hover:underline text-sm font-medium"
            >
              Enviar →
            </a>
          </div>

          <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Dashboard de Claims</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Monitore e gerencie sinistros
            </p>
            <a 
              href="/claims" 
              className="text-primary hover:underline text-sm font-medium"
            >
              Ver Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
