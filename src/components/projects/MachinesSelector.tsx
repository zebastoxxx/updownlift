import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Settings, Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  name: string;
}

interface Machine {
  id: string;
  name: string;
  model: string;
  brand: string;
  current_hours: number;
  status: string;
  serial_number?: string;
  location?: string;
}

interface MachinesSelectorProps {
  client: Client;
  selectedMachines: Machine[];
  onMachinesChange: (machines: Machine[]) => void;
}

export function MachinesSelector({ client, selectedMachines, onMachinesChange }: MachinesSelectorProps) {
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClientMachines();
  }, [client.id]);

  useEffect(() => {
    const filtered = availableMachines.filter(machine =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMachines(filtered);
  }, [availableMachines, searchTerm]);

  const fetchClientMachines = async () => {
    try {
      // Fetch ALL machines from the database, not just client-specific ones
      const { data, error } = await supabase
        .from('machines')
        .select(`
          id,
          name,
          model,
          brand,
          current_hours,
          status,
          serial_number,
          location
        `)
        .order('name');

      if (error) throw error;
      
      setAvailableMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMachineToggle = (machine: Machine, isSelected: boolean) => {
    if (isSelected) {
      onMachinesChange([...selectedMachines, machine]);
    } else {
      onMachinesChange(selectedMachines.filter(m => m.id !== machine.id));
    }
  };

  const isMachineSelected = (machineId: string) => {
    return selectedMachines.some(m => m.id === machineId);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      operativo: "default",
      mantenimiento: "secondary",
      reparacion: "destructive",
      fuera_servicio: "outline"
    } as const;
    
    const colors = {
      operativo: "bg-green-100 text-green-800",
      mantenimiento: "bg-yellow-100 text-yellow-800",
      reparacion: "bg-red-100 text-red-800",
      fuera_servicio: "bg-gray-100 text-gray-800"
    } as const;
    
    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "outline"}
        className={colors[status as keyof typeof colors] || ""}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatHours = (hours: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(hours);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Máquinas disponibles para {client.name}
          {selectedMachines.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {selectedMachines.length} seleccionada{selectedMachines.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Machines list */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {availableMachines.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No hay máquinas disponibles en la base de datos
            </div>
          ) : (
            availableMachines.map((machine) => (
              <Card 
                key={machine.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  isMachineSelected(machine.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isMachineSelected(machine.id)}
                      onCheckedChange={(checked) => handleMachineToggle(machine, checked as boolean)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium truncate">{machine.name}</h4>
                        {getStatusBadge(machine.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>{machine.brand} {machine.model}</p>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatHours(machine.current_hours || 0)}h</span>
                          </div>
                          
                          {machine.status !== 'operativo' && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">Requiere atención</span>
                            </div>
                          )}
                        </div>
                        
                        {machine.location && (
                          <p className="text-xs mt-1">Ubicación: {machine.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </CardContent>
    </Card>
  );
}