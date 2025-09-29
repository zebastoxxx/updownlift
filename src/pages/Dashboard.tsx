import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardStats } from "@/components/DashboardStats";
import { MachineCard } from "@/components/MachineCard";
import { Search, Plus, Filter, Download } from "lucide-react";
import heroImage from "@/assets/hero-equipment.jpg";

// Datos simulados - En una app real, estos vendrían de una API
const mockStats = {
  totalMachines: 24,
  operational: 18,
  maintenance: 4,
  alerts: 2,
  utilizationRate: 78,
  completedInspections: 156
};
const mockMachines = [{
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
  fuelLevel: 75
}, {
  id: "2",
  name: "Minicargador ML-002",
  model: "Bobcat S650",
  serialNumber: "BOB2023002",
  status: "maintenance" as const,
  location: "Bodega B",
  hourMeter: 2890,
  lastInspection: "2024-01-10",
  nextMaintenance: "2024-01-28",
  fuelLevel: 45
}, {
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
  fuelLevel: 90
}];
export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredMachines = mockMachines.filter(machine => machine.name.toLowerCase().includes(searchTerm.toLowerCase()) || machine.model.toLowerCase().includes(searchTerm.toLowerCase()) || machine.location.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleViewDetails = (machineId: string) => {
    console.log("Ver detalles de máquina:", machineId);
    // Navegar a página de detalles de máquina
  };
  const handleStartInspection = (machineId: string) => {
    console.log("Iniciar inspección de máquina:", machineId);
    // Navegar a formulario de inspección
  };
  return <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-primary">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
        backgroundImage: `url(${heroImage})`
      }} />
        
      </div>

      {/* Stats Overview */}
      <DashboardStats stats={mockStats} />

      {/* Actividad Reciente y Acciones Rápidas */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Vista General de Máquinas */}
        <div className="xl:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Vista General de Flota</CardTitle>
                  <CardDescription>
                    Estado actual de tu flota de equipos
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </div>
              
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar máquinas, modelos o ubicaciones..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4">
                {filteredMachines.map(machine => <MachineCard key={machine.id} machine={machine} onViewDetails={handleViewDetails} onStartInspection={handleStartInspection} />)}
                
                {filteredMachines.length === 0 && <div className="text-center py-8 text-muted-foreground">
                    No se encontraron máquinas que coincidan con tu búsqueda.
                  </div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas y Alertas */}
        <div className="space-y-6">
          {/* Acciones Rápidas */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Nueva Máquina
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Buscar Registros
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </CardContent>
          </Card>

          {/* Alertas Recientes */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Alertas Recientes</CardTitle>
              <CardDescription>
                Notificaciones críticas que requieren atención
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                  <div>
                    <p className="text-sm font-medium">Alerta Motor - TH-003</p>
                    <p className="text-xs text-muted-foreground">Temperatura alta detectada</p>
                    <Badge variant="destructive" className="text-xs mt-1">Crítico</Badge>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="w-2 h-2 rounded-full bg-warning mt-2" />
                  <div>
                    <p className="text-sm font-medium">Mantenimiento Vencido - ML-002</p>
                    <p className="text-xs text-muted-foreground">Servicio de 300h requerido</p>
                    <Badge variant="secondary" className="text-xs mt-1">Próximo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}