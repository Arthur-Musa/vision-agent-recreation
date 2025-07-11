import { ReactNode } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { TenantLoginForm } from './TenantLoginForm';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requirePermission?: string;
  requireRole?: string; // Manter compatibilidade
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requirePermission,
  requireRole, // Para compatibilidade com código existente
  fallback 
}) => {
  const { user, isLoading, hasPermission, tenant } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <TenantLoginForm />;
  }

  // Verifica permissão específica se necessário
  if (requirePermission && !hasPermission(requirePermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Usuário: {user.email} ({user.role})
          </p>
          <p className="text-sm text-muted-foreground">
            Tenant: {tenant.branding.companyName}
          </p>
          {requirePermission && (
            <p className="text-sm text-muted-foreground">
              Permissão necessária: {requirePermission}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};