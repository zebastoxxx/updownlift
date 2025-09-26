import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Download, Wrench, Calendar, Clock, User } from "lucide-react";

// Datos simulados - En una app real vendrían de una API
const mockWorkOrders = [
  {
    id: "OT-001",
    machineId: "TH-001",
    machineName: "Telehandler TH-001",
    title: "Mantenimiento Preventivo 300h",
    description: "Cambio de aceite, filtros y revisión general del sistema hidráulico",
    priority: "medium",
    status: "open",
    assignedTo: "Carlos Méndez",
    createdBy: "Sistema Automático",
    createdDate: "2024-01-20",
    dueDate: "2024-01-25",
    estimatedHours: 4,
    location: "Obra Construcción A",
    category: "preventive",
  },
  {
    id: "OT-002",
    machineId: "ML-002",
    machineName: "Minicargador ML-002",
    title: "Reparación Sistema de Frenos",
    description: "Revisión y reparación del sistema de frenos por desgaste excesivo detectado en inspección",
    priority: "high",
    status: "in_progress",
    assignedTo: "Ana Torres",
    createdBy: "Miguel Rodríguez",
    createdDate: "2024-01-18",
    dueDate: "2024-01-22",
    estimatedHours: 6,
    location: "Bodega B",
    category: "corrective",
  },
  {
    id: "OT-003",
    machineId: "TH-003",
    machineName: "Telehandler TH-003",
    title: "Falla Crítica Motor",
    description: "Motor presenta alta temperatura y ruidos anómalos. Requiere diagnóstico urgente",
    priority: "critical",
    status: "open",
    assignedTo: "Luis García",
    createdBy: "Carlos Pérez",
    createdDate: "2024-01-22",
    dueDate: "2024-01-23",
    estimatedHours: 8,
    location: "Zona Industrial C",
    category: "emergency",
  },
  {
    id: "OT-004",
    machineId: "EX-004",
    machineName: "Excavadora EX-004",
    title: "Mantenimiento Completado",
    description: "Servicio de mantenimiento 500h completado exitosamente",
    priority: "medium",
    status: "completed",
    assignedTo: "Ana Torres",
    createdBy: "Sistema Automático",
    createdDate: "2024-01-15",
    dueDate: "2024-01-20",
    estimatedHours: 5,
    location: "Depósito Central",
    category: "preventive",
  },
];

export default function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filteredOrders = mockWorkOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
      open: { label: "Abierta", variant: "outline" as const },
      in_progress: { label: "En Progreso", variant: "default" as const },
      completed: { label: "Completada", variant: "secondary" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.open;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: "Baja", variant: "secondary" as const },
      medium: { label: "Media", variant: "outline" as const },
      high: { label: "Alta", variant: "default" as const },
      critical: { label: "Crítica", variant: "destructive" as const },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      preventive: { label: "Preventivo", color: "bg-blue-100 text-blue-800" },
      corrective: { label: "Correctivo", color: "bg-yellow-100 text-yellow-800" },
      emergency: { label: "Emergencia", color: "bg-red-100 text-red-800" },
    };
    return categoryMap[category as keyof typeof categoryMap] || categoryMap.preventive;
  };

  const statusCounts = {
    all: mockWorkOrders.length,
    open: mockWorkOrders.filter(o => o.status === "open").length,
    in_progress: mockWorkOrders.filter(o => o.status === "in_progress").length,
    completed: mockWorkOrders.filter(o => o.status === "completed").length,
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Órdenes de Trabajo</h1>
          <p className="text-muted-foreground">
            Gestiona mantenimientos y reparaciones de equipos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
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
                  placeholder="Buscar por título, máquina o técnico..."
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
          variant={statusFilter === "open" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("open")}
        >
          Abiertas ({statusCounts.open})
        </Button>
        <Button
          variant={statusFilter === "in_progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("in_progress")}
        >
          En Progreso ({statusCounts.in_progress})
        </Button>
        <Button
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("completed")}
        >
          Completadas ({statusCounts.completed})
        </Button>
      </div>

      {/* Lista de órdenes de trabajo */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {filteredOrders.map((order) => {
          const statusBadge = getStatusBadge(order.status);
          const priorityBadge = getPriorityBadge(order.priority);
          const categoryBadge = getCategoryBadge(order.category);

          return (
            <Card key={order.id} className="shadow-card hover:shadow-elevated transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">{order.machineName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={statusBadge.variant} className="text-xs">
                      {statusBadge.label}
                    </Badge>
                    <Badge variant={priorityBadge.variant} className="text-xs">
                      {priorityBadge.label}
                    </Badge>
                  </div>
                </div>
                <h4 className="font-medium">{order.title}</h4>
                <p className="text-sm text-muted-foreground">{order.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Información de asignación */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Asignado a: {order.assignedTo}</span>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Creada</p>
                      <p className="font-medium">{formatDate(order.createdDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vencimiento</p>
                      <p className="font-medium">{formatDate(order.dueDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Categoría y tiempo estimado */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className={`px-2 py-1 rounded-full text-xs ${categoryBadge.color}`}>
                    {categoryBadge.label}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{order.estimatedHours}h estimadas</span>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="text-sm">
                  <p className="text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{order.location}</p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    Ver Detalles
                  </Button>
                  {order.status === "open" && (
                    <Button className="flex-1">
                      Iniciar
                    </Button>
                  )}
                  {order.status === "in_progress" && (
                    <Button className="flex-1">
                      Completar
                    </Button>
                  )}
                  {order.status === "completed" && (
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

      {filteredOrders.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron órdenes de trabajo</h3>
              <p>No hay órdenes que coincidan con los filtros aplicados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}