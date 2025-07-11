import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'agent' | 'viewer';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      const savedToken = localStorage.getItem('auth_token');
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        
        // Validate token (in production, verify with server)
        if (isValidToken(savedToken)) {
          setUser(userData);
        } else {
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const isValidToken = (token: string): boolean => {
    try {
      // In production, this should verify with your backend
      // For now, check if token exists and is not expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_session');
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email e senha são obrigatórios' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Email inválido' };
      }

      // Mock authentication - replace with real API call
      const mockAuth = await mockAuthenticate(email, password);
      
      if (mockAuth.success && mockAuth.user) {
        const token = generateMockToken(mockAuth.user);
        
        localStorage.setItem('auth_user', JSON.stringify(mockAuth.user));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_session', Date.now().toString());
        
        setUser(mockAuth.user);
        return { success: true };
      }

      return { success: false, error: mockAuth.error || 'Credenciais inválidas' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email e senha são obrigatórios' };
      }

      if (!isValidEmail(email)) {
        return { success: false, error: 'Email inválido' };
      }

      if (password.length < 8) {
        return { success: false, error: 'Senha deve ter pelo menos 8 caracteres' };
      }

      // Mock registration - replace with real API call
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: email.toLowerCase().trim(),
        name: name?.trim(),
        role: 'viewer', // Default role
        created_at: new Date().toISOString()
      };

      const token = generateMockToken(newUser);
      
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_session', Date.now().toString());
      
      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    // Clear any sensitive data from memory
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    
    const roleHierarchy = {
      admin: ['admin', 'agent', 'viewer'],
      agent: ['agent', 'viewer'],
      viewer: ['viewer']
    };
    
    return roleHierarchy[user.role as keyof typeof roleHierarchy]?.includes(role) || false;
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Utility functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const mockAuthenticate = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock users for demo
  const mockUsers: Record<string, { password: string; user: User }> = {
    'admin@olga.com': {
      password: 'admin123',
      user: {
        id: 'admin_001',
        email: 'admin@olga.com',
        name: 'Administrador',
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z'
      }
    },
    'agent@olga.com': {
      password: 'agent123',
      user: {
        id: 'agent_001',
        email: 'agent@olga.com',
        name: 'Agente',
        role: 'agent',
        created_at: '2024-01-01T00:00:00Z'
      }
    }
  };

  const userAuth = mockUsers[email.toLowerCase()];
  
  if (userAuth && userAuth.password === password) {
    return { success: true, user: userAuth.user };
  }

  return { success: false, error: 'Email ou senha incorretos' };
};

const generateMockToken = (user: User): string => {
  // In production, use proper JWT with server-side signing
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }));
  const signature = btoa('mock_signature_' + user.id);
  
  return `${header}.${payload}.${signature}`;
};