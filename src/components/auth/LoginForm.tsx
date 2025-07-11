import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onToggleMode: () => void;
  isRegisterMode?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, isRegisterMode = false }) => {
  const { login, register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = isRegisterMode 
        ? await register(email, password, name)
        : await login(email, password);

      if (!result.success) {
        setError(result.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError('Erro interno. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isRegisterMode ? 'Criar Conta' : 'Entrar na Plataforma'}
          </CardTitle>
          <CardDescription>
            {isRegisterMode 
              ? 'Crie sua conta para acessar a plataforma Olga'
              : 'Acesse sua conta para continuar'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome (opcional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isRegisterMode ? 'Mínimo 8 caracteres' : 'Sua senha'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRegisterMode ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                isRegisterMode ? 'Criar Conta' : 'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isRegisterMode ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            </span>
            <Button 
              variant="link" 
              onClick={onToggleMode}
              className="ml-1 p-0 h-auto font-normal"
            >
              {isRegisterMode ? 'Entrar' : 'Criar conta'}
            </Button>
          </div>

          {!isRegisterMode && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Contas de demonstração:</p>
              <div className="space-y-1 text-xs">
                <p><strong>Admin:</strong> admin@olga.com / admin123</p>
                <p><strong>Agente:</strong> agent@olga.com / agent123</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};