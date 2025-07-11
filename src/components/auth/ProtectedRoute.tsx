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
  // Temporariamente desabilitado - permitir acesso sem autenticação
  return <>{children}</>;
};