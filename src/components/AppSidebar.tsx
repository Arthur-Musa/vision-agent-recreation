import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Bot,
  FileText,
  BookOpen,
  Users,
  Search,
  Clock,
  Settings,
  Plus,
  BarChart3,
  Shield,
  Briefcase
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
];

const toolsItems = [
  { title: "Smart Spreadsheet", url: "/spreadsheet", icon: BarChart3 },
];

const recentCases = [
  { title: "Fraud Detection Analysis", url: "/chat", icon: Shield, agentId: "fraud-detection" },
  { title: "APE + BAG Analysis", url: "/chat", icon: FileText, agentId: "claims-processor" },
  { title: "Underwriting Review", url: "/chat", icon: Briefcase, agentId: "aura" },
];

const agentItems = [
  { title: "Aura", url: "/chat", icon: Bot, color: "text-purple-600", agentId: "aura" },
  { title: "Fraud Detector", url: "/chat", icon: Shield, color: "text-blue-600", agentId: "fraud-detection" },
  { title: "Claims Processor", url: "/chat", icon: FileText, color: "text-green-600", agentId: "claims-processor" },
];

export function AppSidebar() {
  console.log('AppSidebar component loading...');
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `transition-colors duration-200 ${isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground hover:text-sidebar-accent-foreground"}`;

  return (
    <Sidebar className={`transition-all duration-300 ${collapsed ? "w-14" : "w-64"}`} collapsible="icon" variant="inset">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="ml-2 truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="ml-2 truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Cases */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Recent cases
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentCases.map((case_) => (
                <SidebarMenuItem key={case_.title}>
                  <SidebarMenuButton asChild>
                    {case_.agentId ? (
                      <div 
                        className={`${getNavCls({ isActive: isActive(case_.url) })} cursor-pointer`}
                        onClick={() => {
                          navigate(case_.url, { 
                            state: { 
                              selectedAgent: case_.agentId,
                              agentName: case_.title.split(' ')[0],
                              initialQuery: `Analisando ${case_.title}...`
                            } 
                          });
                        }}
                      >
                        <case_.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="ml-2 truncate text-sm">{case_.title}</span>}
                      </div>
                    ) : (
                      <NavLink to={case_.url} className={getNavCls}>
                        <case_.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="ml-2 truncate text-sm">{case_.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* All Agents */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            All agents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {agentItems.map((agent) => (
                <SidebarMenuItem key={agent.title}>
                  <SidebarMenuButton asChild>
                    <div 
                      className={`${getNavCls({ isActive: isActive(agent.url) })} cursor-pointer`}
                      onClick={() => {
                        navigate(agent.url, { 
                          state: { 
                            selectedAgent: agent.agentId,
                            agentName: agent.title,
                            initialQuery: `Conectando com ${agent.title}...`
                          } 
                        });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <agent.icon className={`h-4 w-4 flex-shrink-0 ${agent.color}`} />
                      </div>
                      {!collapsed && <span className="ml-2 truncate">{agent.title}</span>}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}