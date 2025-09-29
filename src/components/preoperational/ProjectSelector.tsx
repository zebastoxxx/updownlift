import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  client_name: string;
  status: string;
  location: string;
  description?: string;
}

interface ProjectSelectorProps {
  onProjectSelect: (project: Project) => void;
  selectedProject: Project | null;
}

export function ProjectSelector({ onProjectSelect, selectedProject }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('status', ['activo', 'planificacion'])
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onProjectSelect(project);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      activo: "default",
      completado: "secondary",
      planificacion: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Seleccionar Proyecto
          </CardTitle>
          <CardDescription>
            Elija el proyecto donde se realizará el preoperacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProject?.id || ""} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-full bg-background border-input hover:bg-accent/50 z-50">
              <SelectValue placeholder="Seleccione un proyecto..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-lg z-50 max-h-[300px]">
              {projects.map((project) => (
                <SelectItem 
                  key={project.id} 
                  value={project.id}
                  className="cursor-pointer hover:bg-accent focus:bg-accent"
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{project.name}</span>
                      {getStatusBadge(project.status)}
                    </div>
                    {project.client_name && (
                      <span className="text-sm text-muted-foreground">
                        Cliente: {project.client_name}
                      </span>
                    )}
                    {project.location && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Selected Project Preview */}
      {selectedProject && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{selectedProject.name}</h3>
              {getStatusBadge(selectedProject.status)}
            </div>
            
            {selectedProject.client_name && (
              <p className="text-sm text-muted-foreground mb-2">
                Cliente: {selectedProject.client_name}
              </p>
            )}
            
            {selectedProject.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                {selectedProject.location}
              </div>
            )}
            
            {selectedProject.description && (
              <p className="text-sm text-muted-foreground">
                {selectedProject.description}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {selectedProject && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto">
          <Card className="border-primary shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Proyecto seleccionado:</p>
                  <p className="text-sm text-muted-foreground">{selectedProject.name}</p>
                </div>
                <Button
                  onClick={() => onProjectSelect(selectedProject)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}