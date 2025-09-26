import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Download, Building2, Phone, Mail, MapPin } from "lucide-react";

// Datos simulados - En una app real vendrían de una API
const mockClients = [
  {
    id: "1",
    name: "Constructora Los Andes",
    contactPerson: "Carlos Mendoza",
    email: "carlos@losandes.com",
    phone: "+57 300 123 4567",
    address: "Carrera 15 #85-23, Bogotá",
    status: "active",
    projectsCount: 3,
    totalRevenue: 45000000,
    lastProject: "2024-01-15",
  },
  {
    id: "2",
    name: "Grupo Inmobiliario del Norte",
    contactPerson: "Ana Rodríguez",
    email: "ana@grupoinmobiliario.com",
    phone: "+57 310 987 6543",
    address: "Avenida 68 #45-12, Medellín",
    status: "active",
    projectsCount: 2,
    totalRevenue: 28000000,
    lastProject: "2024-01-10",
  },
  {
    id: "3",
    name: "Infraestructura Moderna S.A.",
    contactPerson: "Miguel Torres",
    email: "miguel@inframoderna.com",
    phone: "+57 320 456 7890",
    address: "Calle 26 #13-19, Cali",
    status: "inactive",
    projectsCount: 1,
    totalRevenue: 15000000,
    lastProject: "2023-11-20",
  },
];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    
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

  const statusCounts = {
    all: mockClients.length,
    active: mockClients.filter(c => c.status === "active").length,
    inactive: mockClients.filter(c => c.status === "inactive").length,
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Administra tu cartera de clientes y proyectos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
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
                  placeholder="Buscar por nombre, contacto o email..."
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
          variant={statusFilter === "inactive" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("inactive")}
        >
          Inactivos ({statusCounts.inactive})
        </Button>
      </div>

      {/* Lista de clientes */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="shadow-card hover:shadow-elevated transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
                  </div>
                </div>
                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                  {client.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Información de contacto */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{client.address}</span>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm font-medium">{client.projectsCount}</p>
                  <p className="text-xs text-muted-foreground">Proyectos</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{formatCurrency(client.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Facturación Total</p>
                </div>
              </div>

              {/* Último proyecto */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Último Proyecto</span>
                  <span className="text-sm">{formatDate(client.lastProject)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">
                  Ver Detalles
                </Button>
                <Button className="flex-1">
                  Nuevo Proyecto
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron clientes</h3>
              <p>No hay clientes que coincidan con los filtros aplicados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}