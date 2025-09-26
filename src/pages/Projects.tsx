import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Filter, Download, FolderOpen, Calendar, Truck, Building2 } from "lucide-react";

// Datos simulados - En una app real vendrían de una API
const mockProjects = [
  {
    id: "1",
    name: "Proyecto Edificio Oficinas",
    client: "Constructora Los Andes",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    location: "Bogotá, Colombia",
    progress: 65,
    machinesAssigned: 3,
    totalBudget: 45000000,
    description: "Construcción de edificio de oficinas de 15 pisos en zona financiera",
  },
  {
    id: "2",
    name: "Planta Manufacturera",
    client: "Grupo Inmobiliario del Norte",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-08-15",
    location: "Medellín, Colombia",
    progress: 35,
    machinesAssigned: 2,
    totalBudget: 28000000,
    description: "Construcción de planta manufacturera y oficinas administrativas",
  },
  {
    id: "3",
    name: "Centro Comercial Sur",
    client: "Infraestructura Moderna S.A.",
    status: "completed",
    startDate: "2023-08-20",
    endDate: "2023-12-15",
    location: "Cali, Colombia",
    progress: 100,
    machinesAssigned: 1,
    totalBudget: 15000000,
    description: "Centro comercial con 80 locales y 3 pisos",
  },
  {
    id: "4",
    name: "Residencial Los Pinos",
    client: "Constructora Los Andes",
    status: "planning",
    startDate: "2024-03-01",
    endDate: "2024-10-30",
    location: "Barranquilla, Colombia",
    progress: 10,
    machinesAssigned: 0,
    totalBudget: 35000000,
    description: "Conjunto residencial de 120 apartamentos en 4 torres",
  },
];

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Activo", variant: "default" as const },
      completed: { label: "Completado", variant: "secondary" as const },
      planning: { label: "Planificación", variant: "outline" as const },
      paused: { label: "Pausado", variant: "destructive" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.active;
  };

  const statusCounts = {
    all: mockProjects.length,
    active: mockProjects.filter(p => p.status === "active").length,
    completed: mockProjects.filter(p => p.status === "completed").length,
    planning: mockProjects.filter(p => p.status === "planning").length,
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Proyectos</h1>
          <p className="text-muted-foreground">
            Administra y monitorea todos los proyectos activos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
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
                  placeholder="Buscar por nombre, cliente o ubicación..."
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
          Todos ({statusCounts.all})
        </Button>
        <Button
          variant={statusFilter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("active")}
        >
          Activos ({statusCounts.active})
        </Button>
        <Button
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("completed")}
        >
          Completados ({statusCounts.completed})
        </Button>
        <Button
          variant={statusFilter === "planning" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("planning")}
        >
          En Planificación ({statusCounts.planning})
        </Button>
      </div>

      {/* Lista de proyectos */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {filteredProjects.map((project) => {
          const statusBadge = getStatusBadge(project.status);
          return (
            <Card key={project.id} className="shadow-card hover:shadow-elevated transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FolderOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                  </div>
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Información del proyecto */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                  </div>
                </div>

                {/* Progreso */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progreso</span>  
                    <span className="text-sm text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="w-full" />
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{project.machinesAssigned}</p>
                      <p className="text-xs text-muted-foreground">Máquinas Asignadas</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(project.totalBudget)}</p>
                    <p className="text-xs text-muted-foreground">Presupuesto Total</p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    Ver Detalles
                  </Button>
                  <Button className="flex-1">
                    Gestionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron proyectos</h3>
              <p>No hay proyectos que coincidan con los filtros aplicados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}