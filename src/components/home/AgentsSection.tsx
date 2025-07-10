import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Scale,
  Building2,
  Receipt,
  ShieldCheck,
  FileSearch,
  Briefcase,
  Search,
  Target
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  route: string;
  badge?: string;
  color: string;
}

const AgentsSection = () => {
  const navigate = useNavigate();

  const agents: Agent[] = [
    {
      id: '10q-reports',
      name: '10Q Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Analyze 10Q reports in detail',
      route: '/spreadsheets',
      badge: 'Q1-Q4',
      color: 'gradient-claims'
    },
    {
      id: 'artificial-lawyer',
      name: 'Artificial Lawyer',
      icon: <Scale className="h-5 w-5" />,
      description: 'Lease Analysis & Legal Review',
      route: '/ape-bag-analyst',
      badge: 'Legal',
      color: 'gradient-legal'
    },
    {
      id: 'due-diligence',
      name: 'Due Diligence',
      icon: <Search className="h-5 w-5" />,
      description: 'Comprehensive due diligence reports',
      route: '/ape-bag-analyst',
      badge: 'DD',
      color: 'gradient-underwriting'
    },
    {
      id: 'receipt-analyzer',
      name: 'Receipt Analyzer',
      icon: <Receipt className="h-5 w-5" />,
      description: 'Extract and categorize receipt data',
      route: '/ape-bag-analyst',
      badge: 'OCR',
      color: 'gradient-customer'
    },
    {
      id: 'nda-analyzer',
      name: 'NDA Analyzer',
      icon: <ShieldCheck className="h-5 w-5" />,
      description: 'Review and score NDAs automatically',
      route: '/ape-bag-analyst',
      badge: 'Score',
      color: 'gradient-legal'
    },
    {
      id: 'claims-processing',
      name: 'Claims Processing',
      icon: <FileText className="h-5 w-5" />,
      description: 'Automated APE + BAG claims analysis',
      route: '/claims-processing',
      badge: 'AI+OCR',
      color: 'gradient-claims'
    },
    {
      id: 'document-intel',
      name: 'Document Intelligence',
      icon: <FileSearch className="h-5 w-5" />,
      description: 'Extract insights from any document',
      route: '/ape-bag-analyst',
      badge: 'Multi',
      color: 'gradient-underwriting'
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: 'Detect anomalies and fraud patterns',
      route: '/fraud',
      badge: 'Beta',
      color: 'gradient-customer'
    }
  ];

  return (
    <section className="mb-12" aria-label="Agents">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Agents Especializados</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/spreadsheets')}
        >
          Ver todos
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {agents.map((agent) => (
          <Card 
            key={agent.id}
            className="agent-card cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => navigate(agent.route)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-lg ${agent.color} text-foreground/80`}>
                  {agent.icon}
                </div>
                {agent.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {agent.badge}
                  </Badge>
                )}
              </div>
              <h3 className="font-medium mb-1 text-foreground">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AgentsSection;