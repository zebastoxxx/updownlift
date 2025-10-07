import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, createSortableHeader } from "@/components/ui/data-table";
import { AdaptiveDataView } from "@/components/ui/adaptive-data-view";
import { UserMobileCard } from "@/components/users/UserMobileCard";
import { DetailModal } from "@/components/ui/detail-modal";
import { Database, UserPlus, Users, Save, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

interface User {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

const userSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["operario", "supervisor", "administrador"])
});

export default function Settings() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    password: "",
    role: "operario" as const
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { hasPermission, user: currentUser } = useAuth();

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    maintenance: true,
    inspections: true,
    alerts: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data: typeof formData) => {
    try {
      userSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            errors[String(err.path[0])] = err.message;
          }
        });
        return errors;
      }
      return {};
    }
  };

  const handleCreateUser = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Normalize username
    const normalizedUsername = formData.username.trim().toLowerCase().replace(/\s+/g, '_');
    
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .ilike('username', normalizedUsername)
        .single();
      
      if (existingUser) {
        setFormErrors({ username: 'Este nombre de usuario ya existe' });
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: normalizedUsername,
          full_name: formData.full_name.trim(),
          password_hash: formData.password,
          role: formData.role,
          status: 'activo'
        }]);

      if (error) throw error;

      toast({
        title: "Usuario creado",
        description: `Usuario creado exitosamente. Nombre de usuario: ${normalizedUsername}`,
      });

      setCreateDialogOpen(false);
      setFormData({ username: "", full_name: "", password: "", role: "operario" });
      setFormErrors({});
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (updatedData: Record<string, any>) => {
    if (!selectedUser) return;

    try {
      // Handle password update
      if (updatedData.password_hash && updatedData.password_hash !== '******') {
        // Only update if it's not the placeholder
        updatedData.password_hash = updatedData.password_hash;
      } else {
        // Don't update password if it's the placeholder
        delete updatedData.password_hash;
      }

      // Normalize username if it's being updated
      if (updatedData.username) {
        updatedData.username = updatedData.username.trim().toLowerCase().replace(/\s+/g, '_');
      }
      
      // Normalize full_name if it's being updated
      if (updatedData.full_name) {
        updatedData.full_name = updatedData.full_name.trim();
      }

      const { error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });

      // Reload users and close modal
      await loadUsers();
      setDetailModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    // Prevent admin from deleting themselves
    if (currentUser && user.id === currentUser.id) {
      toast({
        title: "Acción no permitida",
        description: "No puedes eliminar tu propio usuario",
        variant: "destructive",
      });
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario "${user.full_name || user.username}"?`
    );
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });

      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'administrador': return 'default';
      case 'supervisor': return 'secondary';
      case 'operario': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'activo' ? 'default' : 'destructive';
  };

  const columns = [
    {
      id: "username",
      header: createSortableHeader("Usuario"),
      accessorKey: "username",
    },
    {
      id: "full_name",
      header: createSortableHeader("Nombre Completo"),
      accessorKey: "full_name",
      cell: ({ row }: any) => row.original.full_name || "-",
    },
    {
      id: "role",
      header: "Rol",
      cell: ({ row }: any) => (
        <Badge variant={getRoleBadgeVariant(row.original.role)}>
          {row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1)}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }: any) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "created_at",
      header: createSortableHeader("Fecha de Creación"),
      accessorKey: "created_at",
      cell: ({ row }: any) => new Date(row.original.created_at).toLocaleDateString(),
    },
  ];

  const userDetailFields = [
    { key: 'username', label: 'Usuario', type: 'text' as const, editable: true, section: 'general' },
    { key: 'full_name', label: 'Nombre Completo', type: 'text' as const, editable: true, section: 'general' },
    { key: 'password_hash', label: 'Contraseña', type: 'text' as const, editable: true, section: 'general', format: () => '******' },
    { key: 'role', label: 'Rol', type: 'select' as const, options: [
      { value: 'administrador', label: 'Administrador' },
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'operario', label: 'Operario' }
    ], editable: true, section: 'general', format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1) },
    { key: 'status', label: 'Estado', type: 'select' as const, options: [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' }
    ], editable: true, section: 'general', format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1) },
    { key: 'created_at', label: 'Fecha de Creación', type: 'date' as const, editable: false, section: 'informacion', format: (value: string) => new Date(value).toLocaleString('es-CO') },
    { key: 'updated_at', label: 'Última Modificación', type: 'date' as const, editable: false, section: 'informacion', format: (value: string) => new Date(value).toLocaleString('es-CO') }
  ];

  if (!hasPermission("administrador")) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-6xl">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-6xl mobile-scroll overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona usuarios, roles y configuración del sistema
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto sm:max-w-none">
          <TabsTrigger value="users" className="text-sm">
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="system" className="text-sm">
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6 overflow-x-hidden">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  <Users className="h-5 w-5 mt-0.5 sm:mt-0 flex-shrink-0" />
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl">Gestión de Usuarios</CardTitle>
                    <CardDescription className="text-sm">
                      Administra cuentas de usuario y permisos
                    </CardDescription>
                  </div>
                </div>
                
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Crear Usuario</span>
                      <span className="sm:hidden">Crear</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                      <DialogDescription>
                        Completa la información para crear una nueva cuenta de usuario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Usuario</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Nombre de usuario"
                        />
                        {formErrors.username && (
                          <p className="text-sm text-destructive">{formErrors.username}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Nombre completo"
                        />
                        {formErrors.full_name && (
                          <p className="text-sm text-destructive">{formErrors.full_name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Contraseña"
                        />
                        {formErrors.password && (
                          <p className="text-sm text-destructive">{formErrors.password}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operario">Operario</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.role && (
                          <p className="text-sm text-destructive">{formErrors.role}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateUser}>Crear Usuario</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 overflow-hidden">
              {loading ? (
                <div className="text-center py-8">Cargando usuarios...</div>
              ) : (
                <AdaptiveDataView
                  columns={columns}
                  data={users}
                  searchKey="username"
                  searchPlaceholder="Buscar usuarios..."
                  onView={handleViewUser}
                  onEdit={handleViewUser}
                  onDelete={handleDeleteUser}
                  mobileCardComponent={(user) => (
                    <UserMobileCard
                      user={user}
                      onView={handleViewUser}
                      onDelete={handleDeleteUser}
                    />
                  )}
                  emptyMessage="No se encontraron usuarios"
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration */}
        <TabsContent value="system" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>Configuración del Sistema</CardTitle>
              </div>
              <CardDescription>
                Configuraciones generales y de mantenimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Mantenimiento Automático</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Recordatorios Automáticos</Label>
                      <p className="text-sm text-muted-foreground">Generar recordatorios basados en horas de uso</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Intervalo de Mantenimiento (horas)</Label>
                    <Input type="number" defaultValue="300" className="max-w-32" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Días de Anticipación</Label>
                    <Input type="number" defaultValue="7" className="max-w-32" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Notificaciones</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Enviar notificaciones por correo electrónico</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones de Mantenimiento</Label>
                      <p className="text-sm text-muted-foreground">Recordatorios de mantenimiento programado</p>
                    </div>
                    <Switch
                      checked={notifications.maintenance}
                      onCheckedChange={(checked) => handleNotificationChange("maintenance", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedUser && (
        <DetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          title={`Usuario - ${selectedUser.full_name || selectedUser.username}`}
          data={selectedUser}
          fields={userDetailFields}
          onSave={handleEditUser}
        />
      )}
    </div>
  );
}