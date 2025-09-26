import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Settings,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Truck,
  Building
} from "lucide-react";
import { ProjectForm } from "@/components/projects/ProjectForm";

interface Project {
  id: string;
  name: string;
  client_name?: string;
  status: string;
  location?: string;
  city?: string;
  country?: string;
  address?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_at: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;
    
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_clients (
            clients (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include client names
      const transformedProjects = data?.map(project => ({
        ...project,
        client_name: project.project_clients?.[0]?.clients?.name || null
      })) || [];
      
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleProjectCreated = () => {
    fetchProjects(); // Refresh the projects list
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Proyectos</h1>
          <p className="text-muted-foreground">
            Administra y monitorea todos los proyectos de construcción
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Todos ({projects.length})
        </Button>
        <Button
          variant={statusFilter === "activo" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("activo")}
        >
          Activos ({statusCounts.activo || 0})
        </Button>
        <Button
          variant={statusFilter === "completado" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("completado")}
        >
          Completados ({statusCounts.completado || 0})
        </Button>
        <Button
          variant={statusFilter === "planificacion" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("planificacion")}
        >
          En Planificación ({statusCounts.planificacion || 0})
        </Button>
        <Button
          variant={statusFilter === "pausado" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("pausado")}
        >
          Pausados ({statusCounts.pausado || 0})
        </Button>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron proyectos</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Intenta ajustar los filtros de búsqueda" 
                : "Comienza creando tu primer proyecto"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setIsFormOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Proyecto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Project Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold">{project.name}</h3>
                      <Badge variant={project.status === 'activo' ? 'default' : project.status === 'completado' ? 'secondary' : project.status === 'pausado' ? 'destructive' : 'outline'}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    {project.client_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Cliente: {project.client_name}</span>
                      </div>
                    )}
                    
                    {project.description && (
                      <p className="text-muted-foreground">{project.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {(project.city || project.location) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{project.city || project.location}</span>
                        </div>
                      )}
                      
                      {project.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Inicio: {new Date(project.start_date).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      
                      {project.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Fin: {new Date(project.end_date).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                    </div>
                    
                    {project.address && (
                      <p className="text-sm text-muted-foreground">
                        📍 {project.address}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Gestionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}