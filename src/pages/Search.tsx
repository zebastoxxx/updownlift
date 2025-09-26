import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter, Truck, Building2, FolderOpen, ClipboardCheck, Wrench, Calendar } from "lucide-react";

// Datos simulados - En una app real vendrían de una API
const mockSearchResults = [
  {
    id: "1",
    type: "machine",
    title: "Telehandler TH-001",
    subtitle: "JCB 535-95 • SN: JCB2023001",
    description: "Máquina operativa en Obra Construcción A",
    status: "operational",
    location: "Obra Construcción A",
    lastUpdated: "2024-01-20",
    url: "/machines/TH-001",
  },
  {
    id: "2",
    type: "client",
    title: "Constructora Los Andes",
    subtitle: "Carlos Mendoza • carlos@losandes.com",
    description: "Cliente activo con 3 proyectos en curso",
    status: "active",
    location: "Carrera 15 #85-23, Bogotá",
    lastUpdated: "2024-01-18",
    url: "/clients/1",
  },
  {
    id: "3",
    type: "project",
    title: "Proyecto Edificio Oficinas",
    subtitle: "Constructora Los Andes",
    description: "Construcción de edificio de 15 pisos - 65% completado",
    status: "active",
    location: "Bogotá, Colombia",
    lastUpdated: "2024-01-22",
    url: "/projects/1",
  },
  {
    id: "4",
    type: "inspection",
    title: "Inspección TH-001",
    subtitle: "Carlos Méndez • 20/01/2024",
    description: "Inspección completa sin observaciones",
    status: "approved",
    location: "Obra Construcción A",
    lastUpdated: "2024-01-20",
    url: "/inspections/1",
  },
  {
    id: "5",
    type: "work_order",
    title: "OT-001 - Mantenimiento Preventivo",
    subtitle: "Telehandler TH-001",
    description: "Mantenimiento 300h programado para Carlos Méndez",
    status: "open",
    location: "Obra Construcción A",
    lastUpdated: "2024-01-20",
    url: "/work-orders/OT-001",
  },
];

const recentSearches = [
  "Telehandler TH-001",
  "Constructora Los Andes",
  "Mantenimiento preventivo",
  "Inspecciones enero",
  "Carlos Méndez",
];

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);

  const filteredResults = mockSearchResults.filter(result => {
    if (!searchTerm) return false;
    
    const matchesSearch = result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || result.type === typeFilter;
    const matchesStatus = statusFilter === "all" || result.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    // Simular búsqueda
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    handleSearch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      machine: { label: "Máquina", icon: Truck, color: "bg-blue-100 text-blue-800" },
      client: { label: "Cliente", icon: Building2, color: "bg-green-100 text-green-800" },
      project: { label: "Proyecto", icon: FolderOpen, color: "bg-purple-100 text-purple-800" },
      inspection: { label: "Inspección", icon: ClipboardCheck, color: "bg-orange-100 text-orange-800" },
      work_order: { label: "Orden Trabajo", icon: Wrench, color: "bg-red-100 text-red-800" },
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.machine;
  };

  const getStatusBadge = (status: string, type: string) => {
    if (type === "machine") {
      const statusMap = {
        operational: { label: "Operativa", variant: "default" as const },
        maintenance: { label: "Mantenimiento", variant: "secondary" as const },
        offline: { label: "Fuera Línea", variant: "destructive" as const },
      };
      return statusMap[status as keyof typeof statusMap];
    }
    
    if (type === "client") {
      return status === "active" 
        ? { label: "Activo", variant: "default" as const }
        : { label: "Inactivo", variant: "secondary" as const };
    }

    if (type === "inspection") {
      const statusMap = {
        approved: { label: "Aprobada", variant: "default" as const },
        conditional: { label: "Condicional", variant: "secondary" as const },
        rejected: { label: "Rechazada", variant: "destructive" as const },
      };
      return statusMap[status as keyof typeof statusMap];
    }

    return { label: status, variant: "outline" as const };
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Búsqueda Global</h1>
        <p className="text-muted-foreground">
          Encuentra máquinas, clientes, proyectos, inspecciones y más
        </p>
      </div>

      {/* Búsqueda principal */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar en toda la aplicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 text-lg h-12"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-6">
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="machine">Máquinas</SelectItem>
                  <SelectItem value="client">Clientes</SelectItem>
                  <SelectItem value="project">Proyectos</SelectItem>
                  <SelectItem value="inspection">Inspecciones</SelectItem>
                  <SelectItem value="work_order">Órdenes Trabajo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="operational">Operativo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Más Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Búsquedas recientes */}
      {!searchTerm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Búsquedas Recientes</CardTitle>
            <CardDescription>
              Accede rápidamente a tus búsquedas anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(search)}
                  className="text-sm"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {searchTerm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>
              Resultados de Búsqueda
              {filteredResults.length > 0 && (
                <span className="text-muted-foreground font-normal"> 
                  ({filteredResults.length} encontrados)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result) => {
                  const typeInfo = getTypeInfo(result.type);
                  const statusBadge = getStatusBadge(result.status, result.type);
                  const IconComponent = typeInfo.icon;

                  return (
                    <Card key={result.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-lg">{result.title}</h4>
                                <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.color}`}>
                                  {typeInfo.label}
                                </span>
                                {statusBadge && (
                                  <Badge variant={statusBadge.variant} className="text-xs">
                                    {statusBadge.label}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm mb-2">{result.description}</p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{result.location}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Actualizado: {formatDate(result.lastUpdated)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
                <p className="text-muted-foreground">
                  Intenta con otros términos de búsqueda o ajusta los filtros
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}