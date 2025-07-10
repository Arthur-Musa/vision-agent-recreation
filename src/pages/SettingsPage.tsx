import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Key, Users, Bell, Palette, Database } from 'lucide-react';
import { OpenAISettings } from '@/components/settings/OpenAISettings';
import { AssistantSettings } from '@/components/settings/AssistantSettings';
import { OlgaApiSettings } from '@/components/settings/OlgaApiSettings';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    slack: false,
    webhook: true
  });
  
  const [thresholds, setThresholds] = useState({
    errorRate: 5,
    latency: 300,
    fraudScore: 80
  });

  const handleNotificationToggle = (type: string) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleThresholdChange = (type: string, value: string) => {
    setThresholds(prev => ({ ...prev, [type]: parseInt(value) || 0 }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configurar APIs, alertas e preferências
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="apis" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="apis">APIs</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            {/* API Settings */}
            <TabsContent value="apis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Configurações de API
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Olga API</h3>
                    <OlgaApiSettings />
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">OpenAI</h3>
                    <OpenAISettings />
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Assistants OpenAI</h3>
                    <AssistantSettings />
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Anthropic Claude</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="anthropic-key">API Key</Label>
                        <Input 
                          id="anthropic-key"
                          type="password"
                          placeholder="sk-ant-..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="anthropic-model">Modelo Padrão</Label>
                        <select 
                          id="anthropic-model"
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                          <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                          <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                        </select>
                      </div>
                      <Button variant="outline" size="sm">
                        Testar Conexão
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gerenciamento de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Ana Silva</p>
                        <p className="text-sm text-muted-foreground">ana.silva@empresa.com</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Admin</Badge>
                        <Button variant="outline" size="sm">Editar</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Bruno Castro</p>
                        <p className="text-sm text-muted-foreground">bruno.castro@empresa.com</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Analyst</Badge>
                        <Button variant="outline" size="sm">Editar</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Carla Mendes</p>
                        <p className="text-sm text-muted-foreground">carla.mendes@empresa.com</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Viewer</Badge>
                        <Button variant="outline" size="sm">Editar</Button>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      Adicionar Usuário
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alerts */}
            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Configurações de Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notificações</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificações por Email</p>
                          <p className="text-sm text-muted-foreground">Receber alertas por email</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={() => handleNotificationToggle('email')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Integração Slack</p>
                          <p className="text-sm text-muted-foreground">Enviar alertas para Slack</p>
                        </div>
                        <Switch
                          checked={notifications.slack}
                          onCheckedChange={() => handleNotificationToggle('slack')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Webhook</p>
                          <p className="text-sm text-muted-foreground">Enviar para endpoint personalizado</p>
                        </div>
                        <Switch
                          checked={notifications.webhook}
                          onCheckedChange={() => handleNotificationToggle('webhook')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Limites de Alerta</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="error-rate">Taxa de Erro (%)</Label>
                        <Input
                          id="error-rate"
                          type="number"
                          value={thresholds.errorRate}
                          onChange={(e) => handleThresholdChange('errorRate', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="latency">Latência (ms)</Label>
                        <Input
                          id="latency"
                          type="number"
                          value={thresholds.latency}
                          onChange={(e) => handleThresholdChange('latency', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="fraud-score">Score de Fraude</Label>
                        <Input
                          id="fraud-score"
                          type="number"
                          value={thresholds.fraudScore}
                          onChange={(e) => handleThresholdChange('fraudScore', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Aparência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Tema</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <div className="w-full h-20 bg-white border rounded mb-2"></div>
                        <p className="text-sm font-medium">Claro</p>
                      </div>
                      <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <div className="w-full h-20 bg-gray-900 border rounded mb-2"></div>
                        <p className="text-sm font-medium">Escuro</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Branding</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="company-name">Nome da Empresa</Label>
                        <Input id="company-name" placeholder="Sua Empresa" />
                      </div>
                      <div>
                        <Label htmlFor="logo-url">URL do Logo</Label>
                        <Input id="logo-url" placeholder="https://..." />
                      </div>
                      <div>
                        <Label htmlFor="primary-color">Cor Primária</Label>
                        <Input id="primary-color" type="color" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Configurações Avançadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="batch-size">Tamanho do Lote</Label>
                        <Input id="batch-size" type="number" placeholder="10" />
                      </div>
                      <div>
                        <Label htmlFor="timeout">Timeout (segundos)</Label>
                        <Input id="timeout" type="number" placeholder="30" />
                      </div>
                      <div>
                        <Label htmlFor="retry-attempts">Tentativas de Retry</Label>
                        <Input id="retry-attempts" type="number" placeholder="3" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Dados</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="retention-days">Retenção de Dados (dias)</Label>
                        <Input id="retention-days" type="number" placeholder="2555" />
                        <p className="text-sm text-muted-foreground mt-1">
                          Conforme LGPD/GDPR (7 anos = 2555 dias)
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Mascarar PII</p>
                          <p className="text-sm text-muted-foreground">Mascarar dados pessoais nos logs</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Backup</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Backup Automático</p>
                          <p className="text-sm text-muted-foreground">Backup diário dos dados</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button variant="outline">
                        Executar Backup Agora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;