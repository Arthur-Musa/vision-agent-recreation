import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { secureApiService } from '@/services/secureApiService';

interface SecurityCheck {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string;
}

export const SecurityStatus: React.FC = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    runSecurityChecks();
  }, []);

  const runSecurityChecks = async () => {
    setIsLoading(true);
    
    try {
      const securityChecks: SecurityCheck[] = [
        await checkAuthentication(),
        await checkApiSecurity(),
        await checkLocalStorage(),
        await checkPermissions(),
        await checkConnectivity()
      ];

      setChecks(securityChecks);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Security check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthentication = async (): Promise<SecurityCheck> => {
    if (!user) {
      return {
        id: 'auth',
        name: 'Autenticação',
        status: 'fail',
        message: 'Usuário não autenticado'
      };
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {
        id: 'auth',
        name: 'Autenticação',
        status: 'warn',
        message: 'Token não encontrado',
        details: 'Sessão pode expirar inesperadamente'
      };
    }

    return {
      id: 'auth',
      name: 'Autenticação',
      status: 'pass',
      message: `Usuário autenticado: ${user.email} (${user.role})`
    };
  };

  const checkApiSecurity = async (): Promise<SecurityCheck> => {
    const openaiKey = localStorage.getItem('openai_api_key');
    const olgaKey = localStorage.getItem('olga_api_key');
    
    if (openaiKey || olgaKey) {
      return {
        id: 'api',
        name: 'Segurança da API',
        status: 'warn',
        message: 'API keys armazenadas no navegador',
        details: 'Recomendado usar backend proxy para maior segurança'
      };
    }

    return {
      id: 'api',
      name: 'Segurança da API',
      status: 'pass',
      message: 'Nenhuma API key exposta no cliente'
    };
  };

  const checkLocalStorage = async (): Promise<SecurityCheck> => {
    const sensitiveKeys = [
      'openai_api_key',
      'olga_api_key',
      'openai_assistants'
    ];

    const foundKeys = sensitiveKeys.filter(key => localStorage.getItem(key));
    
    if (foundKeys.length > 0) {
      return {
        id: 'storage',
        name: 'Armazenamento Local',
        status: 'warn',
        message: `${foundKeys.length} chaves sensíveis encontradas`,
        details: `Chaves: ${foundKeys.join(', ')}`
      };
    }

    return {
      id: 'storage',
      name: 'Armazenamento Local',
      status: 'pass',
      message: 'Nenhuma informação sensível no localStorage'
    };
  };

  const checkPermissions = async (): Promise<SecurityCheck> => {
    if (!user) {
      return {
        id: 'permissions',
        name: 'Permissões',
        status: 'fail',
        message: 'Não é possível verificar permissões sem usuário'
      };
    }

    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'admin'],
      agent: ['read', 'write'],
      viewer: ['read']
    };

    const userPerms = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    
    return {
      id: 'permissions',
      name: 'Permissões',
      status: 'pass',
      message: `Nível: ${user.role}`,
      details: `Permissões: ${userPerms.join(', ')}`
    };
  };

  const checkConnectivity = async (): Promise<SecurityCheck> => {
    try {
      const result = await secureApiService.testConnection();
      
      if (result.success) {
        return {
          id: 'connectivity',
          name: 'Conectividade',
          status: 'pass',
          message: 'API backend acessível'
        };
      } else {
        return {
          id: 'connectivity',
          name: 'Conectividade',
          status: 'warn',
          message: 'API backend indisponível',
          details: 'Usando modo fallback'
        };
      }
    } catch (error) {
      return {
        id: 'connectivity',
        name: 'Conectividade',
        status: 'warn',
        message: 'Não foi possível conectar ao backend',
        details: 'Funcionalidades limitadas'
      };
    }
  };

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200">OK</Badge>;
      case 'warn':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-700">Atenção</Badge>;
      case 'fail':
        return <Badge variant="destructive">Falha</Badge>;
    }
  };

  const getOverallStatus = () => {
    const failCount = checks.filter(c => c.status === 'fail').length;
    const warnCount = checks.filter(c => c.status === 'warn').length;
    
    if (failCount > 0) return 'fail';
    if (warnCount > 0) return 'warn';
    return 'pass';
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Status de Segurança</CardTitle>
            {getStatusBadge(getOverallStatus())}
          </div>
          <Button 
            onClick={runSecurityChecks}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Verificação automática das configurações de segurança da aplicação.
          {lastCheck && (
            <span className="block text-xs text-muted-foreground mt-1">
              Última verificação: {lastCheck.toLocaleString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.length === 0 && !isLoading ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Clique em "Verificar" para executar a análise de segurança.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{check.name}</span>
                      {getStatusBadge(check.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {check.message}
                    </p>
                    {check.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {getOverallStatus() === 'warn' && (
          <Alert className="border-yellow-300 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Algumas verificações indicam pontos de atenção. Revise as configurações para melhorar a segurança.
            </AlertDescription>
          </Alert>
        )}

        {getOverallStatus() === 'fail' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Problemas críticos de segurança detectados. Ação imediata recomendada.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};