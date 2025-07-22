
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Footer } from "@/components/Footer";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { useTenant } from "@/contexts/TenantContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  console.log('Layout: Rendering');
  
  try {
    const { tenant } = useTenant();
    console.log('Layout: Got tenant', tenant?.name);
    
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full">
          <ErrorBoundary fallback={
            <div className="w-64 bg-muted/50 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Erro na sidebar</p>
            </div>
          }>
            <AppSidebar />
          </ErrorBoundary>
          
          <div className="flex-1 flex flex-col">
            {/* Tenant Header */}
            <ErrorBoundary fallback={
              <div className="h-16 bg-muted/50 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Erro no cabeçalho</p>
              </div>
            }>
              <TenantHeader />
            </ErrorBoundary>

            {/* Main Content */}
            <main className="flex-1">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>

            {/* Footer */}
            <ErrorBoundary fallback={
              <div className="h-12 bg-muted/50 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">© 2024 Olga</p>
              </div>
            }>
              <Footer />
            </ErrorBoundary>
          </div>
        </div>
      </SidebarProvider>
    );
  } catch (error) {
    console.error('Layout: Critical error', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Erro no Layout</h1>
          <p className="text-muted-foreground mb-4">Falha ao carregar a interface</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
