import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Download, ClipboardCheck, Camera, AlertTriangle, CheckCircle } from "lucide-react";

// Datos simulados - En una app real vendrían de una API
const mockInspections = [
  {
    id: "1",
    machineId: "TH-001",
    machineName: "Telehandler TH-001",
    inspector: "Carlos Méndez",
    date: "2024-01-20",
    time: "09:30",
    status: "completed",
    result: "approved",
    issues: 0,
    photos: 8,
    location: "Obra Construcción A",
    notes: "Inspección completa sin observaciones",
  },
  {
    id: "2",
    machineId: "ML-002", 
    machineName: "Minicargador ML-002",
    inspector: "Ana Torres",
    date: "2024-01-18",
    time: "14:15",
    status: "completed",
    result: "conditional",
    issues: 2,
    photos: 12,
    location: "Bodega B",
    notes: "Requiere cambio de filtros y revisión de frenos",
  },
  {
    id: "3",
    machineId: "TH-003",
    machineName: "Telehandler TH-003",
    inspector: "Miguel Rodríguez",
    date: "2024-01-15",
    time: "11:00",
    status: "completed",
    result: "rejected",
    issues: 5,
    photos: 15,
    location: "Zona Industrial C",
    notes: "Fallas críticas en sistema hidráulico y motor",
  },
  {
    id: "4",
    machineId: "EX-004",
    machineName: "Excavadora EX-004",
    inspector: "Carlos Méndez",
    date: "2024-01-22",
    time: "08:00",
    status: "in_progress",
    result: "pending",
    issues: 0,
    photos: 3,
    location: "Depósito Central",
    notes: "Inspección en proceso...",
  },
];

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");

  const filteredInspections = mockInspections.filter(inspection => {
    const matchesSearch = inspection.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inspection.status === statusFilter;
    const matchesResult = resultFilter === "all" || inspection.result === resultFilter;
    
    return matchesSearch && matchesStatus && matchesResult;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { label: "Completada", variant: "secondary" as const },
      in_progress: { label: "En Progreso", variant: "default" as const },
      scheduled: { label: "Programada", variant: "outline" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.completed;
  };

  const getResultBadge = (result: string) => {
    const resultMap = {
      approved: { label: "Aprobada", variant: "default" as const, icon: CheckCircle },
      conditional: { label: "Condicional", variant: "secondary" as const, icon: AlertTriangle },
      rejected: { label: "Rechazada", variant: "destructive" as const, icon: AlertTriangle },
      pending: { label: "Pendiente", variant: "outline" as const, icon: ClipboardCheck },
    };
    return resultMap[result as keyof typeof resultMap] || resultMap.pending;
  };

  const statusCounts = {
    all: mockInspections.length,
    completed: mockInspections.filter(i => i.status === "completed").length,
    in_progress: mockInspections.filter(i => i.status === "in_progress").length,
    scheduled: mockInspections.filter(i => i.status === "scheduled").length,
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Inspecciones</h1>
          <p className="text-muted-foreground">
            Administra y monitorea todas las inspecciones de equipos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Inspección
        </Button>
      </div>

      {/* Búsqueda y filtros */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por máquina, inspector o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
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
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("completed")}
        >
          Completadas ({statusCounts.completed})
        </Button>
        <Button
          variant={statusFilter === "in_progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("in_progress")}
        >
          En Progreso ({statusCounts.in_progress})
        </Button>
      </div>

      {/* Lista de inspecciones */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {filteredInspections.map((inspection) => {
          const statusBadge = getStatusBadge(inspection.status);
          const resultBadge = getResultBadge(inspection.result);
          const ResultIcon = resultBadge.icon;

          return (
            <Card key={inspection.id} className="shadow-card hover:shadow-elevated transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ClipboardCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{inspection.machineName}</h3>
                      <p className="text-sm text-muted-foreground">Inspector: {inspection.inspector}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={statusBadge.variant} className="text-xs">
                      {statusBadge.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Información de la inspección */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="text-sm font-medium">{formatDate(inspection.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hora</p>
                    <p className="text-sm font-medium">{inspection.time}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="text-sm font-medium">{inspection.location}</p>
                </div>

                {/* Resultado */}
                <div className="flex items-center gap-2">
                  <ResultIcon className="h-4 w-4" />
                  <Badge variant={resultBadge.variant}>
                    {resultBadge.label}
                  </Badge>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inspection.issues}</p>
                      <p className="text-xs text-muted-foreground">Observaciones</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inspection.photos}</p>
                      <p className="text-xs text-muted-foreground">Fotografías</p>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                {inspection.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="text-sm">{inspection.notes}</p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    Ver Detalles
                  </Button>
                  {inspection.status === "in_progress" ? (
                    <Button className="flex-1">
                      Continuar
                    </Button>
                  ) : (
                    <Button variant="secondary" className="flex-1">
                      Descargar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInspections.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron inspecciones</h3>
              <p>No hay inspecciones que coincidan con los filtros aplicados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}