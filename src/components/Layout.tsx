import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PWAInstallBanner } from "@/components/ui/pwa-install-banner";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
interface LayoutProps {
  children: React.ReactNode;
}
export default function Layout({
  children
}: LayoutProps) {
  const {
    signOut,
    user
  } = useAuth();
  const isMobile = useIsMobile();
  const handleLogout = async () => {
    await signOut();
  };
  return <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className={cn("h-16 border-b bg-gradient-header flex items-center justify-between px-4 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", isMobile && "h-14")}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-3">
                <img src={logo} alt="Up & Down Lift" className="h-8 w-8 object-contain" />
                <div className="hidden sm:flex flex-col">
                  <h1 className="text-lg font-semibold">Up & Down Lift</h1>
                  <p className="text-xs text-muted-foreground">Sistema de Gestión de Maquinas</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:flex">
                {user?.full_name || user?.username || 'Usuario'}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </header>

          {/* PWA Install Banner */}
          <PWAInstallBanner />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>;
}