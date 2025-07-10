import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


const RecentCasesSection = () => {
  const navigate = useNavigate();


  return (
    <section aria-label="Recent Cases">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Casos Recentes</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/spreadsheets')}
        >
          Ver todos
        </Button>
      </div>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Visualize todos os casos processados no Smart Spreadsheet
        </p>
        <Button 
          onClick={() => navigate('/spreadsheets')}
          className="gap-2"
        >
          Acessar Spreadsheet
        </Button>
      </div>
    </section>
  );
};

export default RecentCasesSection;