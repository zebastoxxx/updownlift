import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, MapPin, Calendar, Users, Wrench, Clock, AlertTriangle } from "lucide-react";

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

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  contact_person?: string;
  status: string;
}

interface Machine {
  id: string;
  name: string;
  model?: string;
  brand?: string;
  current_hours?: number;
  status: string;
  serial_number?: string;
  location?: string;
}

interface ProjectDetailModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailModal({ project, open, onOpenChange }: ProjectDetailModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProjectDetails = async () => {
      if (project && open) {
        setIsLoading(true);
        try {
          // Load associated clients
          const { data: projectClients, error: clientsError } = await supabase
            .from('project_clients')
            .select(`
              clients (
                id,
                name,
                email,
                phone,
                city,
                contact_person,
                status
              )
            `)
            .eq('project_id', project.id);

          if (clientsError) throw clientsError;

          const clientsData = projectClients?.map(pc => pc.clients).filter(Boolean) as Client[] || [];
          setClients(clientsData);

          // Load associated machines
          const { data: projectMachines, error: machinesError } = await supabase
            .from('project_machines')
            .select(`
              machines (
                id,
                name,
                model,
                brand,
                current_hours,
                status,
                serial_number,
                location
              )
            `)
            .eq('project_id', project.id);

          if (machinesError) throw machinesError;

          const machinesData = projectMachines?.map(pm => pm.machines).filter(Boolean) as Machine[] || [];
          setMachines(machinesData);

        } catch (error) {
          console.error('Error loading project details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProjectDetails();
  }, [project, open]);

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

  const getMachineStatusBadge = (status: string) => {
    const statusMap = {
      'operativo': { label: 'Operativo', variant: 'default' as const },
      'mantenimiento': { label: 'Mantenimiento', variant: 'secondary' as const },
      'fuera_servicio': { label: 'Fuera de Servicio', variant: 'destructive' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {project.name}
          </DialogTitle>
          <DialogDescription>
            Información detallada del proyecto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información General</span>
                {getStatusBadge(project.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Ubicación:</span>
                    <span>{project.city || project.location || "-"}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Dirección:</span>
                    <p className="text-muted-foreground mt-1">{project.address || "-"}</p>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">País:</span>
                    <p className="text-muted-foreground mt-1">{project.country || "Colombia"}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fecha de Inicio:</span>
                    <span>{project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : "-"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fecha de Fin:</span>
                    <span>{project.end_date ? new Date(project.end_date).toLocaleDateString('es-ES') : "-"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fecha de Creación:</span>
                    <span>{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
              
              {project.description && (
                <>
                  <Separator />
                  <div>
                    <span className="font-medium text-sm">Descripción:</span>
                    <p className="text-muted-foreground mt-2">{project.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Clients Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes Asociados ({clients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : clients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clients.map((client) => (
                    <Card key={client.id} className="border border-border/50">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{client.name}</h4>
                            <Badge variant={client.status === 'activo' ? 'default' : 'secondary'} className="text-xs">
                              {client.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {client.contact_person && (
                              <p><span className="font-medium">Contacto:</span> {client.contact_person}</p>
                            )}
                            {client.email && (
                              <p><span className="font-medium">Email:</span> {client.email}</p>
                            )}
                            {client.phone && (
                              <p><span className="font-medium">Teléfono:</span> {client.phone}</p>
                            )}
                            {client.city && (
                              <p><span className="font-medium">Ciudad:</span> {client.city}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay clientes asociados a este proyecto</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Machines Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Máquinas Asignadas ({machines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : machines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {machines.map((machine) => (
                    <Card key={machine.id} className="border border-border/50">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{machine.name}</h4>
                            {getMachineStatusBadge(machine.status)}
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            {machine.brand && (
                              <p><span className="font-medium">Marca:</span> {machine.brand}</p>
                            )}
                            {machine.model && (
                              <p><span className="font-medium">Modelo:</span> {machine.model}</p>
                            )}
                            {machine.serial_number && (
                              <p><span className="font-medium">Serie:</span> {machine.serial_number}</p>
                            )}
                            {machine.current_hours !== null && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">Horas:</span> {machine.current_hours || 0}
                              </div>
                            )}
                            {machine.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="font-medium">Ubicación:</span> {machine.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay máquinas asignadas a este proyecto</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}