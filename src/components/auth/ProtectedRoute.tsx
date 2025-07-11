import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole,
  fallback 
}) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

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

  if (!isAuthenticated) {
    return (
      <LoginForm 
        isRegisterMode={isRegisterMode}
        onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
      />
    );
  }

  // Check role permission if required
  if (requireRole && !hasRole(requireRole)) {
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
            Usuário: {user?.email} ({user?.role})
          </p>
          <p className="text-sm text-muted-foreground">
            Permissão necessária: {requireRole}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};