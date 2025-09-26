import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Truck, 
  MapPin, 
  Clock, 
  Fuel, 
  Wrench, 
  Calendar,
  User,
  MoreHorizontal
} from "lucide-react";

interface MachineCardProps {
  machine: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    status: "operational" | "maintenance" | "offline" | "inspection";
    location: string;
    project?: string;
    operator?: string;
    hourMeter: number;
    lastInspection: string;
    nextMaintenance: string;
    fuelLevel?: number;
  };
  onViewDetails: (id: string) => void;
  onStartInspection: (id: string) => void;
}

export function MachineCard({ machine, onViewDetails, onStartInspection }: MachineCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isMaintenanceDue = (nextDate: string) => {
    const next = new Date(nextDate);
    const today = new Date();
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 7;
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{machine.name}</h3>
              <p className="text-sm text-muted-foreground">{machine.model}</p>
              <p className="text-xs text-muted-foreground">SN: {machine.serialNumber}</p>
            </div>
          </div>
          <StatusBadge status={machine.status} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location & Project */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{machine.location}</span>
          </div>
           {machine.project && (
             <div className="flex items-center gap-2 text-sm">
               <Wrench className="h-4 w-4 text-muted-foreground" />
               <span>Proyecto: {machine.project}</span>
             </div>
           )}
           {machine.operator && (
             <div className="flex items-center gap-2 text-sm">
               <User className="h-4 w-4 text-muted-foreground" />
               <span>Operario: {machine.operator}</span>
             </div>
           )}
        </div>

         {/* Métricas */}
         <div className="grid grid-cols-2 gap-4">
           <div className="flex items-center gap-2">
             <Clock className="h-4 w-4 text-muted-foreground" />
             <div>
               <p className="text-sm font-medium">{machine.hourMeter.toLocaleString()}h</p>
               <p className="text-xs text-muted-foreground">Horómetro</p>
             </div>
           </div>
           {machine.fuelLevel && (
             <div className="flex items-center gap-2">
               <Fuel className="h-4 w-4 text-muted-foreground" />
               <div>
                 <p className="text-sm font-medium">{machine.fuelLevel}%</p>
                 <p className="text-xs text-muted-foreground">Nivel Combustible</p>
               </div>
             </div>
           )}
         </div>

         {/* Información de Mantenimiento */}
         <div className="space-y-2">
           <div className="flex items-center justify-between">
             <span className="text-sm text-muted-foreground">Última Inspección</span>
             <span className="text-sm">{formatDate(machine.lastInspection)}</span>
           </div>
           <div className="flex items-center justify-between">
             <span className="text-sm text-muted-foreground">Próximo Mantenimiento</span>
             <div className="flex items-center gap-2">
               <span className="text-sm">{formatDate(machine.nextMaintenance)}</span>
               {isMaintenanceDue(machine.nextMaintenance) && (
                 <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                   Próximo
                 </Badge>
               )}
             </div>
           </div>
         </div>

         {/* Botones de Acción */}
         <div className="flex flex-col sm:flex-row gap-2 pt-2">
           <Button 
             onClick={() => onViewDetails(machine.id)}
             variant="outline"
             className="flex-1"
           >
             Ver Detalles
           </Button>
           <Button 
             onClick={() => onStartInspection(machine.id)}
             className="flex-1"
           >
             Iniciar Inspección
           </Button>
         </div>
      </CardContent>
    </Card>
  );
}