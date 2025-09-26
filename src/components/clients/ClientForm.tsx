import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const clientSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Nombre muy largo'),
  tax_id: z.string().trim().min(5, 'El NIT debe tener al menos 5 caracteres').max(20, 'NIT muy largo').optional().or(z.literal('')),
  contact_person: z.string().trim().min(2, 'El contacto debe tener al menos 2 caracteres').max(100, 'Contacto muy largo').optional().or(z.literal('')),
  email: z.string().trim().email('Email inválido').max(255, 'Email muy largo').optional().or(z.literal('')),
  phone: z.string().trim().min(7, 'Teléfono debe tener al menos 7 dígitos').max(20, 'Teléfono muy largo').optional().or(z.literal('')),
  website: z.string().trim().url('URL inválida').max(255, 'URL muy larga').optional().or(z.literal('')),
  address: z.string().trim().max(255, 'Dirección muy larga').optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Ciudad debe tener al menos 2 caracteres').max(100, 'Ciudad muy larga').optional().or(z.literal('')),
  country: z.string().trim().min(2, 'País debe tener al menos 2 caracteres').max(100, 'País muy largo'),
  status: z.enum(['activo', 'inactivo'])
});

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: () => void;
  client?: any; // For editing mode
}

interface ClientFormData {
  name: string;
  tax_id: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  status: 'activo' | 'inactivo';
}

const initialFormData: ClientFormData = {
  name: '',
  tax_id: '',
  contact_person: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  country: 'Colombia',
  status: 'activo'
};

export function ClientForm({ open, onOpenChange, onClientCreated, client }: ClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(
    client ? { ...initialFormData, ...client } : initialFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      clientSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
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
    
    if (!validateForm()) {
      toast({
        title: 'Error en el formulario',
        description: 'Por favor corrige los errores antes de continuar',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean data - remove empty strings and convert to null for optional fields
      const cleanData = {
        ...formData,
        tax_id: formData.tax_id.trim() || null,
        contact_person: formData.contact_person.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        website: formData.website.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
      };

      let result;
      if (client) {
        // Update existing client
        result = await supabase
          .from('clients')
          .update(cleanData)
          .eq('id', client.id);
      } else {
        // Create new client
        result = await supabase
          .from('clients')
          .insert([cleanData]);
      }

      if (result.error) throw result.error;

      toast({
        title: client ? 'Cliente actualizado' : 'Cliente creado',
        description: client 
          ? 'El cliente ha sido actualizado correctamente' 
          : 'El nuevo cliente ha sido agregado al sistema',
      });

      // Reset form and close dialog
      setFormData(initialFormData);
      setErrors({});
      onOpenChange(false);
      onClientCreated();

    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al guardar el cliente',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    setFormData(client ? { ...initialFormData, ...client } : initialFormData);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          <DialogDescription>
            {client 
              ? 'Actualiza la información del cliente' 
              : 'Completa la información para crear un nuevo cliente'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Constructora Los Andes S.A."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">NIT</Label>
                <Input
                  id="tax_id"
                  type="text"
                  placeholder="900123456-1"
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                  className={errors.tax_id ? 'border-destructive' : ''}
                />
                {errors.tax_id && (
                  <p className="text-sm text-destructive">{errors.tax_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value: 'activo' | 'inactivo') => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Contacto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Persona de Contacto</Label>
                <Input
                  id="contact_person"
                  type="text"
                  placeholder="Carlos Mendoza"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  className={errors.contact_person ? 'border-destructive' : ''}
                />
                {errors.contact_person && (
                  <p className="text-sm text-destructive">{errors.contact_person}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="carlos@constructora.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Página Web</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.empresa.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={errors.website ? 'border-destructive' : ''}
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ubicación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País *</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Colombia">Colombia</SelectItem>
                    <SelectItem value="México">México</SelectItem>
                    <SelectItem value="Perú">Perú</SelectItem>
                    <SelectItem value="Ecuador">Ecuador</SelectItem>
                    <SelectItem value="Chile">Chile</SelectItem>
                    <SelectItem value="Argentina">Argentina</SelectItem>
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Bogotá"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                placeholder="Carrera 15 #85-23, Zona Norte"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-destructive' : ''}
                rows={2}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {client ? 'Actualizar Cliente' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}