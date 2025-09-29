import { 
  Truck, 
  Users, 
  FolderOpen, 
  ClipboardCheck, 
  Settings, 
  BarChart3
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, hasPermission } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent/10 text-sidebar-foreground";

  // Filter navigation items based on user role
  const getNavigationItems = () => {
    const items = [];
    
    // Preoperational - available for all authenticated users (now home page)
    items.push({ title: "Preoperacional", url: "/", icon: ClipboardCheck });
    
    // Machines, Clients, Projects - for supervisors and administrators
    if (hasPermission("supervisor")) {
      items.push(
        { title: "Máquinas", url: "/machines", icon: Truck },
        { title: "Clientes", url: "/clients", icon: Users },
        { title: "Proyectos", url: "/projects", icon: FolderOpen }
      );
    }
    
    return items;
  };

  const getQuickActions = () => {
    const items = [];
    
    // Settings - only for administrators
    if (hasPermission("administrador")) {
      items.push({ title: "Configuración", url: "/settings", icon: Settings });
    }
    
    return items;
  };

  const navigationItems = getNavigationItems();
  const quickActions = getQuickActions();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground font-medium">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClasses}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground font-medium">
              Configuración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickActions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}