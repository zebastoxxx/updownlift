import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "destructive";
}

function StatCard({ title, value, description, trend, icon: Icon, variant = "default" }: StatCardProps) {
  const variantClasses = {
    default: "bg-card",
    success: "bg-success/5 border-success/20",
    warning: "bg-warning/5 border-warning/20",
    destructive: "bg-destructive/5 border-destructive/20",
  };

  const iconClasses = {
    default: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  const TrendIcon = trend?.direction === "up" ? TrendingUp : 
                   trend?.direction === "down" ? TrendingDown : Minus;
  
  const trendColorClasses = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className={`shadow-card ${variantClasses[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconClasses[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs mt-2 ${trendColorClasses[trend.direction]}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trend.value)}% vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: {
    totalMachines: number;
    operational: number;
    maintenance: number;
    alerts: number;
    utilizationRate: number;
    completedInspections: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total de Máquinas"
        value={stats.totalMachines}
        description="Flota activa"
        icon={Truck}
        trend={{ value: 8, direction: "up" }}
      />
      
      <StatCard
        title="Operativas"
        value={stats.operational}
        description={`${Math.round((stats.operational / stats.totalMachines) * 100)}% de la flota`}
        icon={CheckCircle}
        variant="success"
        trend={{ value: 2, direction: "up" }}
      />
      
      <StatCard
        title="Mantenimiento Pendiente"
        value={stats.maintenance}
        description="Requiere atención"
        icon={Wrench}
        variant={stats.maintenance > 0 ? "warning" : "default"}
        trend={{ value: 12, direction: "down" }}
      />
      
      <StatCard
        title="Alertas Activas"
        value={stats.alerts}
        description="Problemas críticos"
        icon={AlertTriangle}
        variant={stats.alerts > 0 ? "destructive" : "default"}
        trend={{ value: 5, direction: "down" }}
      />
    </div>
  );
}