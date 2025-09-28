import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, createSortableHeader } from "@/components/ui/data-table";
import { Search, Plus, Filter, Download, Building, Grid, List, MapPin, Calendar, Users, ChevronDown, ArrowUpDown } from "lucide-react";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

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
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDelete = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== project.id));
      toast({
        title: "Éxito",
        description: "Proyecto eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async (selectedProjects: Project[]) => {
    try {
      const ids = selectedProjects.map(p => p.id);
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', ids);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => !ids.includes(p.id)));
      toast({
        title: "Éxito",
        description: `${selectedProjects.length} proyectos eliminados correctamente`
      });
    } catch (error) {
      console.error('Error bulk deleting projects:', error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar los proyectos seleccionados",
        variant: "destructive"
      });
    }
  };

  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof Project] || "";
    const bValue = b[sortBy as keyof Project] || "";
    
    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleProjectCreated = () => {
    fetchProjects();
    setIsFormOpen(false);
    setSelectedProject(null);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'activo': { label: 'Activo', variant: 'default' as const },
      'completado': { label: 'Completado', variant: 'secondary' as const },
      'planificacion': { label: 'Planificación', variant: 'outline' as const },
      'pausado': { label: 'Pausado', variant: 'destructive' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm truncate">{project.name}</h3>
          </div>
          {getStatusBadge(project.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {project.client_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span className="truncate">{project.client_name}</span>
          </div>
        )}
        {(project.city || project.location) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{project.city || project.location}</span>
          </div>
        )}
        {project.start_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(project.start_date).toLocaleDateString('es-ES')}</span>
          </div>
        )}
        <div className="flex gap-1 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs h-7"
            onClick={() => handleEdit(project)}
          >
            Editar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs h-7"
            onClick={() => handleDelete(project)}
          >
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("Nombre"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "client_name",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("client_name") || "-"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "city",
      header: "Ciudad",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("city") || row.original.location || "-"}</div>
      ),
    },
    {
      accessorKey: "start_date",
      header: createSortableHeader("Fecha Inicio"),
      cell: ({ row }) => {
        const date = row.getValue("start_date") as string;
        return (
          <div className="text-sm">
            {date ? new Date(date).toLocaleDateString('es-ES') : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "end_date",
      header: createSortableHeader("Fecha Fin"),
      cell: ({ row }) => {
        const date = row.getValue("end_date") as string;
        return (
          <div className="text-sm">
            {date ? new Date(date).toLocaleDateString('es-ES') : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: createSortableHeader("Fecha Registro"),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <div className="text-sm">
            {new Date(date).toLocaleDateString('es-ES')}
          </div>
        );
      },
    },
  ];

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
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Search and Controls */}
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Ordenar
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="created_at">Fecha creación</SelectItem>
                        <SelectItem value="start_date">Fecha inicio</SelectItem>
                        <SelectItem value="status">Estado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascendente</SelectItem>
                        <SelectItem value="desc">Descendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex rounded-md overflow-hidden border">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
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

      {/* Data Display */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">Cargando proyectos...</div>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={filteredProjects}
              searchKey="name"
              searchPlaceholder="Buscar proyectos..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBulkDelete={handleBulkDelete}
              enableMultiSelect={true}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No se encontraron proyectos
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectForm 
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedProject(null);
        }}
        onProjectCreated={handleProjectCreated}
        project={selectedProject}
      />
    </div>
  );
}