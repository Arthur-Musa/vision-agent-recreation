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
    <section className="mb-16" aria-label="Agents">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-2">Specialized Agents</h2>
          <p className="text-muted-foreground">AI-powered tools for document processing and analysis</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/spreadsheets')}
          className="hidden sm:flex"
        >
          View all
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <Card 
            key={agent.id}
            className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
            onClick={() => navigate(agent.route)}
          >
            <CardContent className="p-6">
              {/* Header with icon and badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${agent.color} shadow-sm`}>
                  {agent.icon}
                </div>
                {agent.badge && (
                  <Badge variant="secondary" className="text-xs font-medium px-2 py-1">
                    {agent.badge}
                  </Badge>
                )}
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {agent.description}
                </p>
              </div>
              
              {/* Subtle arrow indicator */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Mobile view all button */}
      <div className="flex justify-center mt-8 sm:hidden">
        <Button 
          variant="outline" 
          onClick={() => navigate('/spreadsheets')}
          className="w-full max-w-xs"
        >
          View all agents
        </Button>
      </div>
    </section>
  );
};

export default AgentsSection;