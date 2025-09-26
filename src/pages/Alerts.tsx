import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Bell, AlertTriangle, Clock, CheckCircle, X } from "lucide-react";

// Datos simulados - En una app real vendrían de una API
const mockAlerts = [
  {
    id: "1",
    type: "critical",
    title: "Falla Crítica Motor - TH-003",
    message: "Motor presenta alta temperatura y ruidos anómalos en Telehandler TH-003",
    machine: "Telehandler TH-003",
    location: "Zona Industrial C",
    timestamp: "2024-01-22T14:30:00",
    status: "active",
    priority: "critical",
    category: "maintenance",
    assignedTo: "Luis García",
  },
  {
    id: "2",
    type: "warning",
    title: "Mantenimiento Vencido - ML-002",
    message: "Minicargador ML-002 requiere servicio de 300h. Vencimiento hace 3 días",
    machine: "Minicargador ML-002",
    location: "Bodega B",
    timestamp: "2024-01-21T09:15:00",
    status: "active",
    priority: "high",
    category: "maintenance",
    assignedTo: "Ana Torres",
  },
  {
    id: "3",
    type: "info",
    title: "Inspección Completada",
    message: "Inspección de TH-001 completada exitosamente sin observaciones",
    machine: "Telehandler TH-001",
    location: "Obra Construcción A",
    timestamp: "2024-01-20T16:45:00",
    status: "resolved",
    priority: "low",
    category: "inspection",
    assignedTo: "Carlos Méndez",
  },
  {
    id: "4",
    type: "warning",
    title: "Combustible Bajo - EX-004",
    message: "Excavadora EX-004 tiene nivel de combustible por debajo del 25%",
    machine: "Excavadora EX-004",
    location: "Depósito Central",
    timestamp: "2024-01-22T11:20:00",
    status: "active",
    priority: "medium",
    category: "operational",
    assignedTo: "Miguel Rodríguez",
  },
  {
    id: "5",
    type: "success",
    title: "Orden de Trabajo Completada",
    message: "OT-004 completada: Mantenimiento 500h de Excavadora EX-004",
    machine: "Excavadora EX-004",
    location: "Depósito Central",
    timestamp: "2024-01-20T14:30:00",
    status: "resolved",
    priority: "low",
    category: "maintenance",
    assignedTo: "Ana Torres",
  },
];

export default function Alerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.machine.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || alert.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || alert.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days} días`;
  };

  const getAlertIcon = (type: string) => {
    const iconMap = {
      critical: AlertTriangle,
      warning: AlertTriangle,
      info: Bell,
      success: CheckCircle,
    };
    return iconMap[type as keyof typeof iconMap] || Bell;
  };

  const getAlertColor = (type: string, priority: string) => {
    if (type === "critical" || priority === "critical") {
      return "border-destructive bg-destructive/5";
    }
    if (type === "warning" || priority === "high") {
      return "border-warning bg-warning/5";
    }
    if (type === "success") {
      return "border-success bg-success/5";
    }
    return "border-border bg-card";
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      critical: { label: "Crítica", variant: "destructive" as const },
      high: { label: "Alta", variant: "default" as const },
      medium: { label: "Media", variant: "secondary" as const },
      low: { label: "Baja", variant: "outline" as const },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Activa", variant: "default" as const },
      resolved: { label: "Resuelta", variant: "secondary" as const },
      dismissed: { label: "Descartada", variant: "outline" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.active;
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      maintenance: { label: "Mantenimiento", color: "bg-blue-100 text-blue-800" },
      operational: { label: "Operacional", color: "bg-green-100 text-green-800" },
      inspection: { label: "Inspección", color: "bg-purple-100 text-purple-800" },
      safety: { label: "Seguridad", color: "bg-red-100 text-red-800" },
    };
    return categoryMap[category as keyof typeof categoryMap] || categoryMap.operational;
  };

  const alertCounts = {
    all: mockAlerts.length,
    active: mockAlerts.filter(a => a.status === "active").length,
    resolved: mockAlerts.filter(a => a.status === "resolved").length,
    critical: mockAlerts.filter(a => a.priority === "critical").length,
  };

  const handleResolveAlert = (alertId: string) => {
    console.log("Resolver alerta:", alertId);
    // Implementar lógica para resolver alerta
  };

  const handleDismissAlert = (alertId: string) => {
    console.log("Descartar alerta:", alertId);
    // Implementar lógica para descartar alerta
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Centro de Alertas</h1>
          <p className="text-muted-foreground">
            Monitorea y gestiona todas las notificaciones del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar Todo Leído
          </Button>
        </div>
      </div>

      {/* Resumen de alertas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alertCounts.all}</p>
                <p className="text-sm text-muted-foreground">Total Alertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alertCounts.active}</p>
                <p className="text-sm text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alertCounts.critical}</p>
                <p className="text-sm text-muted-foreground">Críticas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alertCounts.resolved}</p>
                <p className="text-sm text-muted-foreground">Resueltas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar alertas..."
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
          Todas ({alertCounts.all})
        </Button>
        <Button
          variant={statusFilter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("active")}
        >
          Activas ({alertCounts.active})
        </Button>
        <Button
          variant={statusFilter === "resolved" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("resolved")}
        >
          Resueltas ({alertCounts.resolved})
        </Button>
        <Button
          variant={priorityFilter === "critical" ? "destructive" : "outline"}
          size="sm"
          onClick={() => setPriorityFilter(priorityFilter === "critical" ? "all" : "critical")}
        >
          Críticas ({alertCounts.critical})
        </Button>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const AlertIcon = getAlertIcon(alert.type);
          const alertColor = getAlertColor(alert.type, alert.priority);
          const priorityBadge = getPriorityBadge(alert.priority);
          const statusBadge = getStatusBadge(alert.status);
          const categoryBadge = getCategoryBadge(alert.category);

          return (
            <Card key={alert.id} className={`shadow-card hover:shadow-elevated transition-shadow duration-200 ${alertColor}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <AlertIcon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground">{alert.machine} • {alert.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={priorityBadge.variant} className="text-xs">
                          {priorityBadge.label}
                        </Badge>
                        <Badge variant={statusBadge.variant} className="text-xs">
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{alert.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTimestamp(alert.timestamp)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${categoryBadge.color}`}>
                          {categoryBadge.label}
                        </span>
                        {alert.assignedTo && (
                          <span>Asignado a: {alert.assignedTo}</span>
                        )}
                      </div>
                      
                      {alert.status === "active" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleDismissAlert(alert.id)}>
                            <X className="h-4 w-4 mr-1" />
                            Descartar
                          </Button>
                          <Button size="sm" onClick={() => handleResolveAlert(alert.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolver
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron alertas</h3>
              <p>No hay alertas que coincidan con los filtros aplicados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}