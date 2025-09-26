import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Smartphone, Save } from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    maintenance: true,
    inspections: true,
    alerts: true,
  });

  const [profile, setProfile] = useState({
    name: "Administrador",
    email: "admin@updownlift.com",
    phone: "+57 300 123 4567",
    role: "admin",
    language: "es",
    timezone: "America/Bogota",
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log("Guardando configuración...");
    // Implementar lógica de guardado
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza tu experiencia y gestiona la configuración del sistema
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="mobile">Móvil</TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Información Personal</CardTitle>
              </div>
              <CardDescription>
                Actualiza tu información de perfil y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={profile.role} onValueChange={(value) => handleProfileChange("role", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="technician">Técnico</SelectItem>
                      <SelectItem value="operator">Operario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={profile.language} onValueChange={(value) => handleProfileChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select value={profile.timezone} onValueChange={(value) => handleProfileChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Preferencias de Notificación</CardTitle>
              </div>
              <CardDescription>
                Configura cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Canales de Notificación</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones en tu correo electrónico</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones Push</Label>
                      <p className="text-sm text-muted-foreground">Notificaciones en tiempo real en la aplicación</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones SMS</Label>
                      <p className="text-sm text-muted-foreground">Mensajes de texto para alertas críticas</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Tipos de Notificación</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mantenimiento</Label>
                      <p className="text-sm text-muted-foreground">Recordatorios de mantenimiento programado</p>
                    </div>
                    <Switch
                      checked={notifications.maintenance}
                      onCheckedChange={(checked) => handleNotificationChange("maintenance", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Inspecciones</Label>
                      <p className="text-sm text-muted-foreground">Notificaciones sobre inspecciones completadas</p>
                    </div>
                    <Switch
                      checked={notifications.inspections}
                      onCheckedChange={(checked) => handleNotificationChange("inspections", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas Críticas</Label>
                      <p className="text-sm text-muted-foreground">Alertas de fallas y problemas críticos</p>
                    </div>
                    <Switch
                      checked={notifications.alerts}
                      onCheckedChange={(checked) => handleNotificationChange("alerts", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Seguridad y Privacidad</CardTitle>
              </div>
              <CardDescription>
                Gestiona la seguridad de tu cuenta y permisos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Cambiar Contraseña</h4>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Actualizar Contraseña</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Autenticación de Dos Factores</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Habilitar 2FA</Label>
                    <p className="text-sm text-muted-foreground">Agrega una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Sesiones Activas</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Navegador Web - Chrome</p>
                      <p className="text-sm text-muted-foreground">Bogotá, Colombia • Activa ahora</p>
                    </div>
                    <Button variant="outline" size="sm">Cerrar Sesión</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Aplicación Móvil - Android</p>
                      <p className="text-sm text-muted-foreground">Medellín, Colombia • hace 2 horas</p>
                    </div>
                    <Button variant="outline" size="sm">Cerrar Sesión</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema */}
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

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Respaldo de Datos</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Respaldo Automático</Label>
                      <p className="text-sm text-muted-foreground">Último respaldo: 22/01/2024 a las 02:00</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Crear Respaldo</Button>
                    <Button variant="outline">Descargar Respaldo</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Integración API</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Clave API</Label>
                    <div className="flex gap-2">
                      <Input value="••••••••••••••••••••••••••••••••" readOnly />
                      <Button variant="outline">Regenerar</Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Usa esta clave para integrar sistemas externos con Up & Down Lift
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Móvil */}
        <TabsContent value="mobile" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <CardTitle>Configuración Móvil</CardTitle>
              </div>
              <CardDescription>
                Optimiza la experiencia móvil para operarios y técnicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Funciones Offline</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Modo Offline</Label>
                      <p className="text-sm text-muted-foreground">Permitir creación de inspecciones sin conexión</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sincronización Automática</Label>
                      <p className="text-sm text-muted-foreground">Sincronizar cuando haya conexión disponible</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Captura de Fotos</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Calidad de Imagen</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="max-w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja (más rápido)</SelectItem>
                        <SelectItem value="medium">Media (recomendado)</SelectItem>
                        <SelectItem value="high">Alta (mejor calidad)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compresión Automática</Label>
                      <p className="text-sm text-muted-foreground">Reducir tamaño de archivos para ahorrar datos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Ubicación GPS</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rastreo de Ubicación</Label>
                      <p className="text-sm text-muted-foreground">Registrar ubicación en inspecciones y firmas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Precisión Requerida (metros)</Label>
                    <Input type="number" defaultValue="100" className="max-w-32" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}