import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium",
  {
    variants: {
      status: {
        operational: "bg-success/10 text-success border-success/20",
        maintenance: "bg-warning/10 text-warning border-warning/20",
        offline: "bg-destructive/10 text-destructive border-destructive/20",
        inspection: "bg-status-inspection/10 text-status-inspection border-status-inspection/20",
      },
    },
    defaultVariants: {
      status: "operational",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "operational" | "maintenance" | "offline" | "inspection";
}

const StatusIndicator = ({ status }: { status: string }) => {
  const colorClasses = {
    operational: "bg-success",
    maintenance: "bg-warning",
    offline: "bg-destructive",
    inspection: "bg-status-inspection",
  };

  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        colorClasses[status as keyof typeof colorClasses]
      )}
    />
  );
};

export function StatusBadge({ 
  className, 
  status, 
  children, 
  ...props 
}: StatusBadgeProps) {
  const statusLabels = {
    operational: "Operational",
    maintenance: "Maintenance",
    offline: "Offline",
    inspection: "Inspection Required",
  };

  return (
    <Badge
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      <StatusIndicator status={status} />
      {children || statusLabels[status]}
    </Badge>
  );
}