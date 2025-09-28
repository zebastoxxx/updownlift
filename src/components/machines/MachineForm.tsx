import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';

const machineSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['operativo', 'mantenimiento', 'fuera_de_servicio']),
  current_hours: z.number().min(0).optional(),
  next_certification_date: z.string().optional(),
  last_corrective_maintenance_date: z.string().optional(),
  last_preventive_maintenance_date: z.string().optional(),
});

type MachineFormData = z.infer<typeof machineSchema>;

interface Machine {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  location?: string;
  status: string;
  current_hours?: number;
  next_certification_date?: string;
  last_corrective_maintenance_date?: string;
  last_preventive_maintenance_date?: string;
}

interface MachineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onMachineCreated: () => void;
  machine?: Machine | null;
}

export function MachineForm({ isOpen, onClose, onMachineCreated, machine }: MachineFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MachineFormData>({
    name: machine?.name || '',
    brand: machine?.brand || '',
    model: machine?.model || '',
    serial_number: machine?.serial_number || '',
    location: machine?.location || '',
    status: (machine?.status as any) || 'operativo',
    current_hours: machine?.current_hours || 0,
    next_certification_date: machine?.next_certification_date || '',
    last_corrective_maintenance_date: machine?.last_corrective_maintenance_date || '',
    last_preventive_maintenance_date: machine?.last_preventive_maintenance_date || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (data: MachineFormData) => {
    try {
      machineSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, corrige los errores en el formulario',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (machine) {
        // Update existing machine
        const { error } = await supabase
          .from('machines')
          .update(formData)
          .eq('id', machine.id);

        if (error) throw error;

        toast({
          title: 'Máquina actualizada',
          description: 'La máquina ha sido actualizada exitosamente',
        });
      } else {
        // Create new machine
        const { error } = await supabase
          .from('machines')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Máquina creada',
          description: 'La nueva máquina ha sido registrada exitosamente',
        });
      }

      onMachineCreated();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        brand: '',
        model: '',
        serial_number: '',
        location: '',
        status: 'operativo',
        current_hours: 0,
        next_certification_date: '',
        last_corrective_maintenance_date: '',
        last_preventive_maintenance_date: '',
      });
    } catch (error) {
      console.error('Error saving machine:', error);
      toast({
        title: 'Error',
        description: machine ? 'Error al actualizar la máquina' : 'Error al crear la máquina',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof MachineFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {machine ? 'Editar Máquina' : 'Registrar Nueva Máquina'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Excavadora CAT 320"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Ej: Caterpillar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Ej: 320D"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_number">Número de Serie</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => handleInputChange('serial_number', e.target.value)}
                placeholder="Ej: ABC123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ej: Patio Principal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operativo">Operativo</SelectItem>
                  <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
                  <SelectItem value="fuera_de_servicio">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_hours">Horas Actuales</Label>
              <Input
                id="current_hours"
                type="number"
                min="0"
                value={formData.current_hours}
                onChange={(e) => handleInputChange('current_hours', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_certification_date">Vencimiento Certificado ONAC</Label>
              <Input
                id="next_certification_date"
                type="date"
                value={formData.next_certification_date}
                onChange={(e) => handleInputChange('next_certification_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_corrective_maintenance_date">Último Mantenimiento Correctivo</Label>
              <Input
                id="last_corrective_maintenance_date"
                type="date"
                value={formData.last_corrective_maintenance_date}
                onChange={(e) => handleInputChange('last_corrective_maintenance_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_preventive_maintenance_date">Último Mantenimiento Preventivo</Label>
              <Input
                id="last_preventive_maintenance_date"
                type="date"
                value={formData.last_preventive_maintenance_date}
                onChange={(e) => handleInputChange('last_preventive_maintenance_date', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : machine ? 'Actualizar' : 'Crear Máquina'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}