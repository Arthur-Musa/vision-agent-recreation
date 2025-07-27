import React from 'react';
import { 
  Send, 
  Paperclip, 
  MoreHorizontal, 
  Bell,
  Bot,
  User,
  Mic,
  MicOff,
  Shield,
  Cpu,
  Target,
  Smartphone,
  Brain,
  Menu,
  X,
  BarChart3,
  FileText,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useOlgaInterface } from '@/hooks/useOlgaInterface';
import OlgaDashboard from '@/components/dashboard/OlgaDashboard';

const OlgaInterface: React.FC = () => {
  const {
    message,
    setMessage,
    selectedAgent,
    setSelectedAgent,
    showAgentDropdown,
    setShowAgentDropdown,
    sidebarOpen,
    setSidebarOpen,
    currentPage,
    setCurrentPage,
    isRecording,
    setIsRecording,
    messages,
    activeAgents,
    dashboardData,
    messagesEndRef,
    sendMessage,
    formatTime,
    getStatusColor,
    getRiskColor
  } = useOlgaInterface();

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'sinistro': return <Shield className="w-4 h-4" strokeWidth={1.5} />;
      case 'documentos': return <Cpu className="w-4 h-4" strokeWidth={1.5} />;
      case 'riscos': return <Target className="w-4 h-4" strokeWidth={1.5} />;
      case 'fraude': return <Shield className="w-4 h-4" strokeWidth={1.5} />;
      case 'comunicacao': return <Smartphone className="w-4 h-4" strokeWidth={1.5} />;
      default: return <Brain className="w-4 h-4" strokeWidth={1.5} />;
    }
  };

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'claims', label: 'Sinistros', icon: FileText },
    { id: 'chat', label: 'Agentes IA', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <OlgaDashboard data={dashboardData} />;
      case 'claims':
        return <ClaimsPage />;
      case 'chat':
        return <ChatPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatPage />;
    }
  };

  const ChatPage = () => (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-primary-foreground rounded-full"></div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Olga AI Platform</h1>
                <p className="text-sm text-muted-foreground">Sistema Inteligente de Sinistros</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-accent rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-xs text-destructive-foreground font-bold">3</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            getAgentIcon={getAgentIcon}
            formatTime={formatTime}
            getRiskColor={getRiskColor}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur p-4">
        <AgentSelector 
          agents={activeAgents}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          showDropdown={showAgentDropdown}
          setShowDropdown={setShowAgentDropdown}
          getAgentIcon={getAgentIcon}
          getStatusColor={getStatusColor}
        />
        
        <div className="flex items-center space-x-3 mt-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={selectedAgent ? `Mensagem para ${selectedAgent.name}...` : "Selecione um agente para começar..."}
              className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              disabled={!selectedAgent}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors">
              <Paperclip className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>
          
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-destructive text-destructive-foreground' 
                : 'bg-accent hover:bg-accent/80 text-accent-foreground'
            }`}
          >
            {isRecording ? 
              <MicOff className="w-5 h-5" strokeWidth={1.5} /> : 
              <Mic className="w-5 h-5" strokeWidth={1.5} />
            }
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!message.trim() || !selectedAgent}
            className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg transition-colors font-medium"
          >
            <Send className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );

  // Placeholder components
  const ClaimsPage = () => <div className="p-8 text-center text-muted-foreground">Claims Page - Em desenvolvimento</div>;
  const AnalyticsPage = () => <div className="p-8 text-center text-muted-foreground">Analytics Page - Em desenvolvimento</div>;
  const SettingsPage = () => <div className="p-8 text-center text-muted-foreground">Settings Page - Em desenvolvimento</div>;

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        navigationItems={navigationItems}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {renderPage()}
      </div>
    </div>
  );
};

// Component pieces as separate functions for better organization
const MessageBubble: React.FC<any> = ({ message, getAgentIcon, formatTime, getRiskColor }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
      {message.sender === 'agent' && (
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-6 h-6 ${message.agentType ? 'bg-primary' : 'bg-muted'} rounded-md flex items-center justify-center`}>
            {getAgentIcon(message.agentType)}
          </div>
          <span className="text-sm font-medium text-foreground">{message.agentName}</span>
          <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
        </div>
      )}
      
      <div className={`p-4 rounded-lg ${
        message.sender === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card border'
      }`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        
        {/* Risk Data Display */}
        {message.riskData && (
          <div className={`mt-3 p-3 rounded-md text-xs ${getRiskColor(message.riskData.level)}`}>
            <div className="font-medium">Score de Risco: {message.riskData.score}/100</div>
            <div className="text-muted-foreground mt-1">Nível: {message.riskData.level}</div>
          </div>
        )}
        
        {/* Other message data displays */}
        {message.attachments && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>{attachment.name}</span>
                {attachment.confidence && (
                  <span className="text-muted-foreground">({attachment.confidence}%)</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const AgentSelector: React.FC<any> = ({ 
  agents, 
  selectedAgent, 
  setSelectedAgent, 
  showDropdown, 
  setShowDropdown,
  getAgentIcon,
  getStatusColor 
}) => (
  <div className="relative">
    <button
      onClick={() => setShowDropdown(!showDropdown)}
      className="w-full p-3 bg-card border rounded-lg text-left hover:bg-accent transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {selectedAgent ? (
            <>
              <div className={`w-8 h-8 ${selectedAgent.color} rounded-md flex items-center justify-center`}>
                {getAgentIcon(selectedAgent.type)}
              </div>
              <div>
                <div className="font-medium text-foreground">{selectedAgent.name}</div>
                <div className="text-xs text-muted-foreground">{selectedAgent.capability}</div>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">Selecione um agente...</span>
          )}
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
      </div>
    </button>

    {showDropdown && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
        {agents.map((agent: any) => (
          <button
            key={agent.id}
            onClick={() => {
              setSelectedAgent(agent);
              setShowDropdown(false);
            }}
            className="w-full p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${agent.color} rounded-md flex items-center justify-center relative`}>
                  {getAgentIcon(agent.type)}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border-2 border-card`}></div>
                </div>
                <div>
                  <div className="font-medium text-foreground">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">{agent.tasksToday} tarefas hoje</div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

const Sidebar: React.FC<any> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentPage, 
  setCurrentPage, 
  navigationItems 
}) => (
  <div className={`${
    sidebarOpen ? 'w-64' : 'w-16'
  } bg-card border-r transition-all duration-300 flex flex-col`}>
    {/* Sidebar Header */}
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
            </div>
            <span className="font-bold text-foreground">88i Seguradora</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          {sidebarOpen ? 
            <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> : 
            <Menu className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          }
        </button>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-2">
      <div className="space-y-1">
        {navigationItems.map((item: any) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentPage === item.id 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent text-muted-foreground hover:text-accent-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  </div>
);

export default OlgaInterface;
