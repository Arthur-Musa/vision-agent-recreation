import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  MessageSquare, 
  Upload, 
  Brain, 
  FileText, 
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Database
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
  isNew?: boolean;
  category: 'primary' | 'analysis' | 'management' | 'advanced';
}

const navigationItems: NavigationItem[] = [
  // Primary Actions
  {
    id: 'home',
    title: 'Início',
    description: 'Descobrir agentes e recursos',
    icon: <Home className="h-5 w-5" />,
    route: '/',
    category: 'primary'
  },
  {
    id: 'live-workflow',
    title: 'Workflow ao Vivo',
    description: 'Análise em tempo real',
    icon: <Brain className="h-5 w-5" />,
    route: '/live-workflow',
    badge: 'V7 Style',
    isNew: true,
    category: 'primary'
  },
  {
    id: 'chat',
    title: 'Chat Inteligente',
    description: 'Conversa com Concierge',
    icon: <MessageSquare className="h-5 w-5" />,
    route: '/chat',
    category: 'primary'
  },
  {
    id: 'upload',
    title: 'Upload Documentos',
    description: 'Carregar para análise',
    icon: <Upload className="h-5 w-5" />,
    route: '/upload',
    category: 'primary'
  },
  
  // Analysis Tools
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Métricas e visão geral',
    icon: <BarChart3 className="h-5 w-5" />,
    route: '/dashboard',
    category: 'analysis'
  },
  {
    id: 'cases',
    title: 'Casos',
    description: 'Gerenciar processamentos',
    icon: <FileText className="h-5 w-5" />,
    route: '/cases',
    category: 'analysis'
  },
  {
    id: 'coverage',
    title: 'Análise de Cobertura',
    description: 'Verificar adequação',
    icon: <Settings className="h-5 w-5" />,
    route: '/coverage-analysis',
    category: 'analysis'
  },
  {
    id: 'data-pipeline',
    title: 'Pipeline de Dados',
    description: 'Dataset e workflow V7 Labs',
    icon: <Database className="h-5 w-5" />,
    route: '/data-pipeline',
    badge: 'V7 Style',
    isNew: true,
    category: 'analysis'
  },
  
  // Advanced
  {
    id: 'ai-agents',
    title: 'Agentes de IA',
    description: 'Configurar e testar',
    icon: <Users className="h-5 w-5" />,
    route: '/ai-agents',
    badge: 'OpenAI',
    category: 'advanced'
  }
];

interface ImprovedNavigationProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
  showMobile?: boolean;
}

export const ImprovedNavigation: React.FC<ImprovedNavigationProps> = ({
  currentRoute,
  onNavigate,
  showMobile = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const current = currentRoute || location.pathname;
  
  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(route);
    }
    setMobileMenuOpen(false);
  };

  const isActive = (route: string) => {
    return current === route || (route !== '/' && current.startsWith(route));
  };

  const getItemsByCategory = (category: string) => {
    return navigationItems.filter(item => item.category === category);
  };

  const renderNavigationSection = (title: string, items: NavigationItem[], compact = false) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {items.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isActive(item.route)
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleNavigate(item.route)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isActive(item.route) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {item.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.isNew && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Novo
                      </Badge>
                    )}
                    {item.badge && !item.isNew && (
                      <Badge variant="outline" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Desktop Navigation
  const DesktopNavigation = () => (
    <div className="space-y-8">
      {renderNavigationSection('Ações Principais', getItemsByCategory('primary'))}
      {renderNavigationSection('Análise & Relatórios', getItemsByCategory('analysis'))}
      {renderNavigationSection('Configurações Avançadas', getItemsByCategory('advanced'))}
    </div>
  );

  // Mobile Navigation
  const MobileNavigation = () => (
    <div className="space-y-6">
      {renderNavigationSection('Principal', getItemsByCategory('primary'), true)}
      {renderNavigationSection('Análise', getItemsByCategory('analysis'), true)}
      {renderNavigationSection('Avançado', getItemsByCategory('advanced'), true)}
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <DesktopNavigation />
      </div>

      {/* Mobile Navigation */}
      {showMobile && (
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-96">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-background rounded-full"></div>
                  </div>
                  Navegação Olga
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <MobileNavigation />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  );
};