import { useState } from "react";
import { Search, Plus, BookOpen, FileText, Video, ExternalLink, Filter, Calendar, User, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: "document" | "video" | "article" | "procedure";
  category: string;
  tags: string[];
  author: string;
  lastUpdated: string;
  views: number;
  rating: number;
  url?: string;
}

const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: "1",
    title: "Manual de Processamento de Sinistros",
    content: "Guia completo para análise e processamento de sinistros de seguros, incluindo documentação necessária e fluxos de aprovação.",
    type: "document",
    category: "Claims Processing",
    tags: ["sinistros", "processamento", "documentação"],
    author: "Ana Silva",
    lastUpdated: "2024-01-15",
    views: 245,
    rating: 4.8
  },
  {
    id: "2",
    title: "Como Detectar Fraudes em Sinistros",
    content: "Video tutorial sobre identificação de padrões fraudulentos em sinistros de seguros.",
    type: "video",
    category: "Fraud Detection",
    tags: ["fraude", "detecção", "análise"],
    author: "João Santos",
    lastUpdated: "2024-01-10",
    views: 189,
    rating: 4.6
  },
  {
    id: "3",
    title: "Procedimento de Análise APE + BAG",
    content: "Procedimento detalhado para análise de documentos APE e BAG em sinistros corporativos.",
    type: "procedure",
    category: "Document Analysis",
    tags: ["APE", "BAG", "análise", "corporativo"],
    author: "Maria Costa",
    lastUpdated: "2024-01-08",
    views: 156,
    rating: 4.9
  },
  {
    id: "4",
    title: "Renovação de Apólices - Melhores Práticas",
    content: "Artigo sobre estratégias eficazes para renovação de apólices e retenção de clientes.",
    type: "article",
    category: "Policy Management",
    tags: ["renovação", "apólices", "retenção"],
    author: "Carlos Oliveira",
    lastUpdated: "2024-01-05",
    views: 203,
    rating: 4.7
  },
  {
    id: "5",
    title: "Integração com APIs Externas",
    content: "Documentação técnica sobre integração com APIs de terceiros para enriquecimento de dados.",
    type: "document",
    category: "Technical",
    tags: ["API", "integração", "técnico"],
    author: "Pedro Lima",
    lastUpdated: "2024-01-03",
    views: 89,
    rating: 4.5
  }
];

const categories = ["All", "Claims Processing", "Fraud Detection", "Document Analysis", "Policy Management", "Technical"];
const contentTypes = ["All", "document", "video", "article", "procedure"];

export default function KnowledgeHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [activeTab, setActiveTab] = useState("browse");

  const filteredItems = mockKnowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesType = selectedType === "All" || item.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "article": return <BookOpen className="h-4 w-4" />;
      case "procedure": return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "video": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "article": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "procedure": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Hub</h1>
            <p className="text-muted-foreground">Central de conhecimento e documentação da Olga Platform</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Conteúdo
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar no knowledge hub..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === "All" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="browse">Navegar</TabsTrigger>
          <TabsTrigger value="popular">Mais Populares</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground">{item.content}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {item.author.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(item.lastUpdated).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{item.views} visualizações</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⭐ {item.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-4">
            {filteredItems
              .sort((a, b) => b.views - a.views)
              .slice(0, 5)
              .map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.views} visualizações</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {filteredItems
              .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
              .slice(0, 5)
              .map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Atualizado em {new Date(item.lastUpdated).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.filter(cat => cat !== "All").map(category => {
              const categoryItems = mockKnowledgeItems.filter(item => item.category === category);
              return (
                <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'itens'}
                    </p>
                    <div className="space-y-2">
                      {categoryItems.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          {getTypeIcon(item.type)}
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                      {categoryItems.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{categoryItems.length - 3} mais
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}