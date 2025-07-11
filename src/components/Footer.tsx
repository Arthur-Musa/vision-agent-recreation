import { Heart } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto spacing-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Company info */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-foreground rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-background rounded-full"></div>
              </div>
              <span className="olga-logo text-heading-3">Olga</span>
            </div>
            <div className="text-caption text-center md:text-left">
              <p>Plataforma de Seguros Inteligente</p>
              <p>© {currentYear} Olga. Todos os direitos reservados.</p>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-6 text-body-sm">
            <a 
              href="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidade
            </a>
            <a 
              href="/terms" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Termos de Uso
            </a>
            <a 
              href="/support" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Suporte
            </a>
          </div>

          {/* Right side - Made with love */}
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <span>Feito com</span>
            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            <span>pela equipe Olga</span>
          </div>
        </div>
      </div>
    </footer>
  );
};