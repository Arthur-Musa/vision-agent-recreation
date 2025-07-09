import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Link, Settings, Webhook, Mail, MessageSquare, Cloud, Plus } from 'lucide-react';

const ConnectorsConfig = () => {
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState([
    {
      id: 'email',
      name: 'Email Integration',
      type: 'email',
      description: 'Processar sinistros recebidos via email',
      enabled: true,
      configured: true,
      icon: <Mail className="h-5 w-5" />
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      type: 'messaging',
      description: 'Receber documentos via WhatsApp',
      enabled: true,
      configured: true,
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      type: 'storage',
      description: 'Monitor pasta do Dropbox para novos arquivos',
      enabled: false,
      configured: false,
      icon: <Cloud className="h-5 w-5" />
    },
    {
      id: 'zapier',
      name: 'Zapier',
      type: 'automation',
      description: 'Integração com automações Zapier',
      enabled: false,
      configured: false,
      icon: <Link className="h-5 w-5" />
    },
    {
      id: 'webhook',
      name: 'Webhook Personalizado',
      type: 'webhook',
      description: 'Endpoint personalizado para integrações',
      enabled: true,
      configured: true,
      icon: <Webhook className="h-5 w-5" />
    }
  ]);

  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);

  const toggleConnector = (id: string) => {
    setConnectors(prev => 
      prev.map(connector => 
        connector.id === id 
          ? { ...connector, enabled: !connector.enabled }
          : connector
      )
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'messaging': return 'bg-green-100 text-green-800';
      case 'storage': return 'bg-purple-100 text-purple-800';
      case 'automation': return 'bg-orange-100 text-orange-800';
      case 'webhook': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'messaging': return 'Mensagem';
      case 'storage': return 'Armazenamento';
      case 'automation': return 'Automação';
      case 'webhook': return 'Webhook';
      default: return type;
    }
  };

  const renderConnectorConfig = (connector: any) => {
    switch (connector.id) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-server">Servidor IMAP</Label>
              <Input id="email-server" placeholder="imap.gmail.com" />
            </div>
            <div>
              <Label htmlFor="email-port">Porta</Label>
              <Input id="email-port" placeholder="993" />
            </div>
            <div>
              <Label htmlFor="email-username">Usuário</Label>
              <Input id="email-username" placeholder="sinistros@empresa.com" />
            </div>
            <div>
              <Label htmlFor="email-password">Senha</Label>
              <Input id="email-password" type="password" placeholder="••••••••" />
            </div>
          </div>
        );
      
      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-token">Token da API</Label>
              <Input id="whatsapp-token" placeholder="EAAYourTokenHere" />
            </div>
            <div>
              <Label htmlFor="whatsapp-phone">Número do Telefone</Label>
              <Input id="whatsapp-phone" placeholder="+55 11 99999-9999" />
            </div>
            <div>
              <Label htmlFor="whatsapp-webhook">Webhook URL</Label>
              <Input id="whatsapp-webhook" placeholder="https://api.olga.com/whatsapp/webhook" />
            </div>
          </div>
        );
      
      case 'dropbox':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dropbox-token">Access Token</Label>
              <Input id="dropbox-token" placeholder="sl.BYourTokenHere" />
            </div>
            <div>
              <Label htmlFor="dropbox-folder">Pasta Monitorada</Label>
              <Input id="dropbox-folder" placeholder="/Sinistros" />
            </div>
          </div>
        );
      
      case 'zapier':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="zapier-webhook">Webhook URL do Zapier</Label>
              <Input id="zapier-webhook" placeholder="https://hooks.zapier.com/hooks/catch/..." />
            </div>
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">URL do Endpoint</Label>
              <Input id="webhook-url" value="https://api.olga.com/v1/intake" readOnly />
            </div>
            <div>
              <Label htmlFor="webhook-secret">Secret Key</Label>
              <Input id="webhook-secret" placeholder="••••••••••••••••••••" />
            </div>
            <div>
              <Label>Métodos Suportados</Label>
              <p className="text-sm text-muted-foreground">POST, PUT</p>
            </div>
          </div>
        );
      
      default:
        return <p className="text-muted-foreground">Configuração não disponível</p>;
    }
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
                <h1 className="text-xl font-semibold">Connectors & Automação</h1>
                <p className="text-sm text-muted-foreground">
                  Configurar triggers e integrações externas
                </p>
              </div>
            </div>
            
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Connector
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connectors List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Connectors Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectors.map((connector) => (
                    <div 
                      key={connector.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedConnector === connector.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedConnector(connector.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {connector.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{connector.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {connector.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={connector.enabled}
                          onCheckedChange={() => toggleConnector(connector.id)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(connector.type)}>
                          {getTypeText(connector.type)}
                        </Badge>
                        <Badge variant={connector.configured ? 'default' : 'outline'}>
                          {connector.configured ? 'Configurado' : 'Não configurado'}
                        </Badge>
                        {connector.enabled && (
                          <Badge className="bg-green-100 text-green-800">
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedConnector ? (
                  <div className="space-y-4">
                    <div className="pb-4 border-b">
                      {(() => {
                        const connector = connectors.find(c => c.id === selectedConnector);
                        return connector ? (
                          <div>
                            <h3 className="font-medium mb-1">{connector.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {connector.description}
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    
                    {(() => {
                      const connector = connectors.find(c => c.id === selectedConnector);
                      return connector ? renderConnectorConfig(connector) : null;
                    })()}
                    
                    <div className="flex gap-2 pt-4">
                      <Button size="sm" className="flex-1">
                        Salvar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Testar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione um connector para configurar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Info */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Como usar</h4>
                    <p className="text-sm text-blue-800">
                      Configure os connectors para automatizar a ingestão de documentos. 
                      Cada connector habilitado irá monitorar sua fonte e criar novos jobs automaticamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConnectorsConfig;