import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClientSelector } from "./ClientSelector";
import { MachinesSelector } from "./MachinesSelector";

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
  model: string;
  brand: string;
  current_hours: number;
  status: string;
}

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
  project?: any; // For editing mode
}

interface ProjectFormData {
  name: string;
  description: string;
  location: string;
  city: string;
  country: string;
  address: string;
  start_date: string;
  end_date: string;
  status: string;
}

export function ProjectForm({ open, onOpenChange, onProjectCreated, project }: ProjectFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [selectedMachinesByClient, setSelectedMachinesByClient] = useState<Record<string, Machine[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const initialData = {
    name: "",
    description: "",
    location: "",
    city: "",
    country: "Colombia",
    address: "",
    start_date: "",
    end_date: "",
    status: "planificacion"
  };
  
  const [formData, setFormData] = useState<ProjectFormData>(initialData);

  // Load project data when editing
  useEffect(() => {
    const loadProjectData = async () => {
      if (project && open) {
        setIsLoading(true);
        try {
          // Set form data
          setFormData({
            name: project.name || "",
            description: project.description || "",
            location: project.location || "",
            city: project.city || "",
            country: project.country || "Colombia",
            address: project.address || "",
            start_date: project.start_date || "",
            end_date: project.end_date || "",
            status: project.status || "planificacion"
          });

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

          const clients = projectClients?.map(pc => pc.clients).filter(Boolean) as Client[] || [];
          setSelectedClients(clients);

          // Load associated machines grouped by client
          const { data: projectMachines, error: machinesError } = await supabase
            .from('project_machines')
            .select(`
              machines (
                id,
                name,
                model,
                brand,
                current_hours,
                status
              )
            `)
            .eq('project_id', project.id);

          if (machinesError) throw machinesError;

          // Group machines by client (assuming all machines belong to the first client for now)
          // In a real scenario, you might need a client_machines table to properly map this
          const machines = projectMachines?.map(pm => pm.machines).filter(Boolean) as Machine[] || [];
          
          if (clients.length > 0 && machines.length > 0) {
            // For now, assign all machines to the first client
            // This should be improved based on your business logic
            const machinesByClient: Record<string, Machine[]> = {};
            clients.forEach(client => {
              machinesByClient[client.id] = machines;
            });
            setSelectedMachinesByClient(machinesByClient);
          }

        } catch (error) {
          console.error('Error loading project data:', error);
          toast({
            title: "Error",
            description: "No se pudo cargar la información del proyecto",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      } else if (!project) {
        // Reset form for new project
        setFormData(initialData);
        setSelectedClients([]);
        setSelectedMachinesByClient({});
      }
    };

    loadProjectData();
  }, [project, open]);

  const handleFormChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (clients: Client[]) => {
    setSelectedClients(clients);
    
    // Remove machines for clients that are no longer selected
    const clientIds = clients.map(c => c.id);
    const updatedMachines: Record<string, Machine[]> = {};
    clientIds.forEach(clientId => {
      if (selectedMachinesByClient[clientId]) {
        updatedMachines[clientId] = selectedMachinesByClient[clientId];
      }
    });
    setSelectedMachinesByClient(updatedMachines);
  };

  const handleMachinesChange = (clientId: string, machines: Machine[]) => {
    setSelectedMachinesByClient(prev => ({
      ...prev,
      [clientId]: machines
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push("El nombre del proyecto es obligatorio");
    if (!formData.city.trim()) errors.push("La ciudad es obligatoria");
    if (!formData.address.trim()) errors.push("La dirección es obligatoria");
    if (selectedClients.length === 0) errors.push("Debe seleccionar al menos un cliente");
    
    // Check if all selected clients have at least one machine
    for (const client of selectedClients) {
      if (!selectedMachinesByClient[client.id] || selectedMachinesByClient[client.id].length === 0) {
        errors.push(`Debe seleccionar al menos una máquina para el cliente ${client.name}`);
      }
    }
    
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.push("La fecha de inicio debe ser anterior a la fecha de fin");
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Errores en el formulario",
        description: errors.join(", "),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let projectResult;
      
      if (project) {
        // Update existing project
        projectResult = await supabase
          .from('projects')
          .update({
            name: formData.name,
            description: formData.description,
            location: formData.location,
            city: formData.city,
            country: formData.country,
            address: formData.address,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            status: formData.status
          })
          .eq('id', project.id)
          .select()
          .single();
      } else {
        // Create new project
        projectResult = await supabase
          .from('projects')
          .insert({
            name: formData.name,
            description: formData.description,
            location: formData.location,
            city: formData.city,
            country: formData.country,
            address: formData.address,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            status: formData.status
          })
          .select()
          .single();
      }

      if (projectResult.error) throw projectResult.error;

      // Update client and machine relationships
      if (project) {
        // For editing, delete existing relationships first
        await supabase.from('project_clients').delete().eq('project_id', project.id);
        await supabase.from('project_machines').delete().eq('project_id', project.id);
      }

      // Link clients to project
      if (selectedClients.length > 0) {
        const clientInserts = selectedClients.map(client => ({
          project_id: projectResult.data.id,
          client_id: client.id
        }));

        const { error: clientsError } = await supabase
          .from('project_clients')
          .insert(clientInserts);

        if (clientsError) throw clientsError;

        // Link machines to project
        const allMachines = Object.values(selectedMachinesByClient).flat();
        if (allMachines.length > 0) {
          const machineInserts = allMachines.map(machine => ({
            project_id: projectResult.data.id,
            machine_id: machine.id
          }));

          const { error: machinesError } = await supabase
            .from('project_machines')
            .insert(machineInserts);

          if (machinesError) throw machinesError;
        }
      }

      toast({
        title: project ? "Proyecto actualizado" : "Proyecto creado",
        description: project 
          ? `El proyecto "${formData.name}" se actualizó correctamente`
          : `El proyecto "${formData.name}" se creó correctamente`,
        variant: "default"
      });

      // Reset form only if creating new project
      if (!project) {
        setFormData(initialData);
        setSelectedClients([]);
        setSelectedMachinesByClient({});
      }

      onProjectCreated();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error al crear proyecto",
        description: "No se pudo crear el proyecto. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Editar Proyecto" : "Crear Nuevo Proyecto"}</DialogTitle>
          <DialogDescription>
            {project 
              ? "Actualiza la información del proyecto"
              : "Complete la información del proyecto, seleccione clientes y asigne máquinas"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Proyecto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Ej: Construcción Torre Central"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planificacion">Planificación</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="pausado">Pausado</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Describa brevemente el proyecto..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha de Inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleFormChange('start_date', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de Fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleFormChange('end_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                    placeholder="Ej: Bogotá"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleFormChange('country', e.target.value)}
                    placeholder="Colombia"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder="Ej: Carrera 15 #85-32, Zona Rosa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación Adicional</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="Información adicional de ubicación"
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Selección de Clientes</CardTitle>
              <CardDescription>
                Seleccione uno o varios clientes para este proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientSelector
                selectedClients={selectedClients}
                onClientSelect={handleClientSelect}
              />
            </CardContent>
          </Card>

          {/* Machine Selection by Client */}
          {selectedClients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Asignación de Máquinas por Cliente</CardTitle>
                <CardDescription>
                  Seleccione las máquinas disponibles para cada cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedClients.map((client, index) => (
                  <div key={client.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <MachinesSelector
                      client={client}
                      selectedMachines={selectedMachinesByClient[client.id] || []}
                      onMachinesChange={(machines) => handleMachinesChange(client.id, machines)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting 
              ? (project ? "Actualizando..." : "Creando...") 
              : (project ? "Actualizar Proyecto" : "Crear Proyecto")
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}