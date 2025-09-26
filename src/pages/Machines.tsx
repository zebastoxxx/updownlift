import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MachineCard } from "@/components/MachineCard";
import { Search, Plus, Filter, Download, Grid, List, Truck } from "lucide-react";

// Datos simulados - En una app real vendrían de una API
const mockMachines = [
  {
    id: "1",
    name: "Telehandler TH-001",
    model: "JCB 535-95",
    serialNumber: "JCB2023001",
    status: "operational" as const,
    location: "Obra Construcción A",
    project: "Proyecto Edificio Oficinas",
    operator: "Juan Pérez",
    hourMeter: 1245,
    lastInspection: "2024-01-15",
    nextMaintenance: "2024-02-15",
    fuelLevel: 75,
  },
  {
    id: "2", 
    name: "Minicargador ML-002",
    model: "Bobcat S650",
    serialNumber: "BOB2023002",
    status: "maintenance" as const,
    location: "Bodega B",
    hourMeter: 2890,
    lastInspection: "2024-01-10",
    nextMaintenance: "2024-01-28",
    fuelLevel: 45,
  },
  {
    id: "3",
    name: "Telehandler TH-003",
    model: "Caterpillar TH3510D",
    serialNumber: "CAT2023003",
    status: "inspection" as const,
    location: "Zona Industrial C",
    project: "Planta Manufacturera",
    operator: "María González",
    hourMeter: 1567,
    lastInspection: "2023-12-20",
    nextMaintenance: "2024-02-01",
    fuelLevel: 90,
  },
  {
    id: "4",
    name: "Excavadora EX-004",
    model: "Komatsu PC200",
    serialNumber: "KOM2023004",
    status: "offline" as const,
    location: "Depósito Central",
    hourMeter: 3245,
    lastInspection: "2024-01-05",
    nextMaintenance: "2024-02-05",
    fuelLevel: 20,
  }
];

export default function Machines() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMachines = mockMachines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || machine.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (machineId: string) => {
    console.log("Ver detalles de máquina:", machineId);
  };

  const handleStartInspection = (machineId: string) => {
    console.log("Iniciar inspección de máquina:", machineId);
  };

  const statusCounts = {
    all: mockMachines.length,
    operational: mockMachines.filter(m => m.status === "operational").length,
    maintenance: mockMachines.filter(m => m.status === "maintenance").length,
    inspection: mockMachines.filter(m => m.status === "inspection").length,
    offline: mockMachines.filter(m => m.status === "offline").length,
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Máquinas</h1>
          <p className="text-muted-foreground">
            Administra y monitorea toda tu flota de equipos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Máquina
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, modelo o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Controles */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Todas ({statusCounts.all})
        </Button>
        <Button
          variant={statusFilter === "operational" ? "default" : "outline"}
          size="sm"  
          onClick={() => setStatusFilter("operational")}
        >
          Operativas ({statusCounts.operational})
        </Button>
        <Button
          variant={statusFilter === "maintenance" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("maintenance")}
        >
          Mantenimiento ({statusCounts.maintenance})
        </Button>
        <Button
          variant={statusFilter === "inspection" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("inspection")}
        >
          Inspección ({statusCounts.inspection})
        </Button>
        <Button
          variant={statusFilter === "offline" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("offline")}
        >
          Fuera de Línea ({statusCounts.offline})
        </Button>
      </div>

      {/* Lista de máquinas */}
      <div className={viewMode === "grid" 
        ? "grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" 
        : "space-y-4"
      }>
        {filteredMachines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onViewDetails={handleViewDetails}
            onStartInspection={handleStartInspection}
          />
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron máquinas</h3>
              <p>No hay máquinas que coincidan con los filtros aplicados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}