
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Tenant, TenantUser, TenantConfig } from '@/types/tenant';

interface TenantContextType extends TenantConfig {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateTheme: () => void;
  hasPermission: (permission: string) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

// Mock data para demonstração - em produção virá da API
const mockTenants: Record<string, Tenant> = {
  'seguradora1': {
    id: 'tenant-1',
    name: 'Seguradora Alpha',
    domain: 'seguradora1',
    logo: '/logos/seguradora1.png',
    primaryColor: '220 90% 50%',
    secondaryColor: '220 30% 96%',
    accentColor: '45 93% 58%',
    fontFamily: 'Inter',
    settings: {
      allowRegistration: true,
      requireApproval: false,
      enableMfa: true,
      sessionTimeout: 8
    },
    branding: {
      companyName: 'Seguradora Alpha',
      supportEmail: 'suporte@seguradoraalpha.com.br',
      supportPhone: '(11) 3000-0000'
    }
  },
  'seguradora2': {
    id: 'tenant-2', 
    name: 'Seguradora Beta',
    domain: 'seguradora2',
    logo: '/logos/seguradora2.png',
    primaryColor: '142 76% 36%',
    secondaryColor: '142 30% 96%',
    accentColor: '271 91% 65%',
    fontFamily: 'Inter',
    settings: {
      allowRegistration: false,
      requireApproval: true,
      enableMfa: true,
      sessionTimeout: 4
    },
    branding: {
      companyName: 'Seguradora Beta',
      supportEmail: 'contato@seguradorabeta.com.br',
      supportPhone: '(21) 4000-0000'
    }
  },
  'default': {
    id: 'default',
    name: 'Olga Insurance Platform',
    domain: 'default',
    logo: '/logos/olga.png',
    primaryColor: '262 90% 50%',
    secondaryColor: '262 30% 96%',
    accentColor: '178 100% 40%',
    fontFamily: 'Inter',
    settings: {
      allowRegistration: true,
      requireApproval: false,
      enableMfa: false,
      sessionTimeout: 12
    },
    branding: {
      companyName: 'Olga',
      supportEmail: 'suporte@olga.com.br',
      supportPhone: '(11) 9999-9999'
    }
  }
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<TenantUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('TenantProvider: Initializing', { tenant: tenant?.name, user: user?.email });

  // Identifica o tenant baseado no subdomínio
  const identifyTenant = (): Tenant => {
    console.log('TenantProvider: Identifying tenant');
    
    try {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      // Para desenvolvimento local, usar parâmetro de query
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      
      const tenantKey = tenantParam || subdomain;
      const foundTenant = mockTenants[tenantKey] || mockTenants['default'];
      
      console.log('TenantProvider: Tenant identified', { 
        hostname, 
        subdomain, 
        tenantParam, 
        tenantKey, 
        foundTenant: foundTenant.name 
      });
      
      return foundTenant;
    } catch (err) {
      console.error('TenantProvider: Error identifying tenant', err);
      return mockTenants['default'];
    }
  };

  // Aplica o tema do tenant
  const updateTheme = () => {
    if (!tenant) {
      console.warn('TenantProvider: Cannot update theme, no tenant');
      return;
    }

    console.log('TenantProvider: Updating theme for', tenant.name);

    try {
      const root = document.documentElement;
      root.style.setProperty('--primary', tenant.primaryColor);
      root.style.setProperty('--secondary', tenant.secondaryColor);
      root.style.setProperty('--accent', tenant.accentColor);
      
      // Atualiza título
      document.title = `${tenant.branding.companyName} - Plataforma de Seguros`;
      
      console.log('TenantProvider: Theme updated successfully');
    } catch (err) {
      console.error('TenantProvider: Error updating theme', err);
    }
  };

  // Login específico do tenant
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('TenantProvider: Login attempt', { email, tenantId: tenant?.id });
    setIsLoading(true);
    
    try {
      // Simulação de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: TenantUser = {
        id: 'user-1',
        email,
        name: email.split('@')[0],
        role: 'admin',
        tenantId: tenant!.id,
        permissions: ['read', 'write', 'admin'],
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      setUser(mockUser);
      localStorage.setItem(`tenant_${tenant!.id}_user`, JSON.stringify(mockUser));
      
      console.log('TenantProvider: Login successful', { userId: mockUser.id });
      return { success: true };
    } catch (error) {
      console.error('TenantProvider: Login failed', error);
      return { success: false, error: 'Falha na autenticação' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('TenantProvider: Logout', { userId: user?.id });
    setUser(null);
    if (tenant) {
      localStorage.removeItem(`tenant_${tenant.id}_user`);
    }
  };

  const hasPermission = (permission: string): boolean => {
    const hasAccess = user?.permissions.includes(permission) || false;
    console.log('TenantProvider: Permission check', { permission, hasAccess, userPermissions: user?.permissions });
    return hasAccess;
  };

  // Inicialização
  useEffect(() => {
    console.log('TenantProvider: Starting initialization');
    
    try {
      const currentTenant = identifyTenant();
      setTenant(currentTenant);
      
      // Verifica se há usuário logado para este tenant
      const savedUser = localStorage.getItem(`tenant_${currentTenant.id}_user`);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('TenantProvider: Restored user from localStorage', { userId: parsedUser.id });
      }
      
      setIsLoading(false);
      console.log('TenantProvider: Initialization complete');
    } catch (err) {
      console.error('TenantProvider: Initialization failed', err);
      setError('Erro na inicialização do sistema');
      setIsLoading(false);
    }
  }, []);

  // Aplica tema quando tenant muda
  useEffect(() => {
    if (tenant) {
      updateTheme();
    }
  }, [tenant]);

  // Loading state
  if (isLoading || !tenant) {
    console.log('TenantProvider: Rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log('TenantProvider: Rendering error state', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const value: TenantContextType = {
    tenant,
    user,
    isLoading,
    login,
    logout,
    updateTheme,
    hasPermission
  };

  console.log('TenantProvider: Rendering children with context', { 
    tenantName: tenant.name, 
    userName: user?.name 
  });

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
