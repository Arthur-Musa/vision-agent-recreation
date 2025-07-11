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
    primaryColor: '220 90% 50%', // Blue
    secondaryColor: '220 30% 96%',
    accentColor: '45 93% 58%', // Orange
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
    primaryColor: '142 76% 36%', // Green
    secondaryColor: '142 30% 96%',
    accentColor: '271 91% 65%', // Purple
    fontFamily: 'Roboto',
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
    primaryColor: '262 90% 50%', // Purple
    secondaryColor: '262 30% 96%',
    accentColor: '178 100% 40%', // Teal
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

  // Identifica o tenant baseado no subdomínio
  const identifyTenant = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    // Para desenvolvimento local, usar parâmetro de query
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    
    const tenantKey = tenantParam || subdomain;
    return mockTenants[tenantKey] || mockTenants['default'];
  };

  // Aplica o tema do tenant
  const updateTheme = () => {
    if (!tenant) return;

    const root = document.documentElement;
    root.style.setProperty('--primary', tenant.primaryColor);
    root.style.setProperty('--secondary', tenant.secondaryColor);
    root.style.setProperty('--accent', tenant.accentColor);
    
    // Atualiza título e favicon
    document.title = `${tenant.branding.companyName} - Plataforma de Seguros`;
    
    // Atualiza fonte se necessário
    if (tenant.fontFamily && tenant.fontFamily !== 'Inter') {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${tenant.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      root.style.setProperty('--font-family', tenant.fontFamily);
    }
  };

  // Login específico do tenant
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulação de autenticação - em produção usar API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user para demonstração
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
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Falha na autenticação' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (tenant) {
      localStorage.removeItem(`tenant_${tenant.id}_user`);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  // Inicialização
  useEffect(() => {
    const currentTenant = identifyTenant();
    setTenant(currentTenant);
    
    // Verifica se há usuário logado para este tenant
    const savedUser = localStorage.getItem(`tenant_${currentTenant.id}_user`);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  // Aplica tema quando tenant muda
  useEffect(() => {
    if (tenant) {
      updateTheme();
    }
  }, [tenant]);

  const value: TenantContextType = {
    tenant: tenant!,
    user,
    isLoading,
    login,
    logout,
    updateTheme,
    hasPermission
  };

  if (isLoading || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};