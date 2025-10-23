import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Gauge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Machine {
  id: string;
  name: string;
  model: string;
  brand: string;
  current_hours: number;
  status: string;
}

interface MachineSelectorWarehouseProps {
  onMachineSelect: (machine: Machine) => void;
  selectedMachine: Machine | null;
  onBack: () => void;
}

export function MachineSelectorWarehouse({
  onMachineSelect,
  selectedMachine,
  onBack
}: MachineSelectorWarehouseProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = machines.filter(
        (machine) =>
          machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          machine.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          machine.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMachines(filtered);
    } else {
      setFilteredMachines(machines);
    }
  }, [searchTerm, machines]);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from("machines")
        .select("id, name, model, brand, current_hours, status")
        .order("name");

      if (error) throw error;
      setMachines(data || []);
      setFilteredMachines(data || []);
    } catch (error) {
      console.error("Error fetching machines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      operativo: { label: "Operativo", className: "bg-green-100 text-green-800" },
      mantenimiento: { label: "Mantenimiento", className: "bg-yellow-100 text-yellow-800" },
      reparacion: { label: "Reparación", className: "bg-red-100 text-red-800" },
      inactivo: { label: "Inactivo", className: "bg-gray-100 text-gray-800" }
    };

    const config = statusConfig[status] || statusConfig.operativo;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-xl font-semibold">Seleccionar Máquina</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar máquina por nombre, marca o modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-3 max-h-[500px] overflow-y-auto">
        {filteredMachines.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No se encontraron máquinas
            </CardContent>
          </Card>
        ) : (
          filteredMachines.map((machine) => (
            <Card
              key={machine.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedMachine?.id === machine.id && "border-primary border-2 bg-primary/5"
              )}
              onClick={() => onMachineSelect(machine)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{machine.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {machine.brand} - {machine.model}
                    </p>
                  </div>
                  {getStatusBadge(machine.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  <span>Horómetro: {machine.current_hours?.toLocaleString() || "0"} hrs</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedMachine && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:relative md:border-0 md:bg-transparent md:p-0">
          <Button className="w-full" size="lg">
            Continuar con {selectedMachine.name}
          </Button>
        </div>
      )}
    </div>
  );
}
