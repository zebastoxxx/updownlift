import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, FileText, BarChart3, Calendar, Filter, TrendingUp, Clock } from "lucide-react";

// Datos simulados - En una app real vendrían de una API
const mockReports = [
  {
    id: "1",
    name: "Utilización de Flota - Enero 2024",
    type: "utilization",
    category: "fleet",
    dateGenerated: "2024-01-22",
    period: "monthly",
    format: "PDF",
    size: "2.3 MB",
    description: "Reporte mensual de utilización y eficiencia de toda la flota",
    status: "ready",
  },
  {
    id: "2",
    name: "Inspecciones por Cliente",
    type: "inspections",
    category: "quality",
    dateGenerated: "2024-01-20",
    period: "weekly",
    format: "Excel",
    size: "1.8 MB",
    description: "Resumen de inspecciones realizadas organizadas por cliente",
    status: "ready",
  },
  {
    id: "3",
    name: "Costos de Mantenimiento Q1",
    type: "maintenance",
    category: "financial",
    dateGenerated: "2024-01-18",
    period: "quarterly",
    format: "PDF",
    size: "3.1 MB",
    description: "Análisis de costos de mantenimiento primer trimestre",
    status: "ready",
  },
  {
    id: "4",
    name: "Eficiencia Operacional",
    type: "efficiency",
    category: "operations",
    dateGenerated: "2024-01-15",
    period: "monthly",
    format: "Excel",
    size: "2.7 MB",
    description: "Métricas de eficiencia y productividad por proyecto",
    status: "processing",
  },
];

const reportTemplates = [
  {
    id: "template-1",
    name: "Utilización de Flota",
    description: "Reporte de horas trabajadas, tiempo inactivo y eficiencia",
    category: "fleet",
    estimatedTime: "5 min",
  },
  {
    id: "template-2", 
    name: "Estado de Inspecciones",
    description: "Resumen de inspecciones completadas y pendientes",
    category: "quality",
    estimatedTime: "3 min",
  },
  {
    id: "template-3",
    name: "Análisis de Mantenimiento",
    description: "Costos, frecuencia y tipos de mantenimiento realizados",
    category: "maintenance",
    estimatedTime: "7 min",
  },
  {
    id: "template-4",
    name: "Rentabilidad por Cliente",
    description: "Análisis financiero de ingresos y costos por cliente",
    category: "financial",
    estimatedTime: "10 min",
  },
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
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
      ready: { label: "Listo", variant: "default" as const },
      processing: { label: "Procesando", variant: "secondary" as const },
      error: { label: "Error", variant: "destructive" as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.ready;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      fleet: BarChart3,
      quality: FileText,
      financial: TrendingUp,
      operations: Clock,
      maintenance: Search,
    };
    return iconMap[category as keyof typeof iconMap] || FileText;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">
            Genera y gestiona reportes de tu operación
          </p>
        </div>
      </div>

      {/* Plantillas de reportes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Generar Nuevo Reporte</CardTitle>
          <CardDescription>
            Selecciona una plantilla para generar un reporte personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {reportTemplates.map((template) => {
              const IconComponent = getCategoryIcon(template.category);
              return (
                <Card key={template.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {template.estimatedTime}
                          </Badge>
                          <Button size="sm">
                            Generar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Búsqueda y filtros */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Reportes Generados</CardTitle>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="fleet">Flota</SelectItem>
                  <SelectItem value="quality">Calidad</SelectItem>
                  <SelectItem value="financial">Financiero</SelectItem>
                  <SelectItem value="operations">Operaciones</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de reportes */}
      <div className="grid gap-4">
        {filteredReports.map((report) => {
          const statusBadge = getStatusBadge(report.status);
          const IconComponent = getCategoryIcon(report.category);

          return (
            <Card key={report.id} className="shadow-card hover:shadow-elevated transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{report.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Generado: {formatDate(report.dateGenerated)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{report.format} • {report.size}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {report.period === "monthly" ? "Mensual" : 
                           report.period === "weekly" ? "Semanal" : 
                           report.period === "quarterly" ? "Trimestral" : "Anual"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                    {report.status === "ready" && (
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron reportes</h3>
              <p>No hay reportes que coincidan con los filtros aplicados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}