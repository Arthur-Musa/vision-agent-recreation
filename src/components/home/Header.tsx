import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto spacing-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-foreground rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-background rounded-full"></div>
            </div>
            <h1 className="text-heading-2 olga-logo text-foreground">Olga</h1>
          </div>
          <div className="flex items-center gap-3">
            {hasRole('admin') && (
               <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
                className="gap-2 text-body-sm"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            )}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;