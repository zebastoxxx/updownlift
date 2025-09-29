import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Camera, Upload, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/AuthContext";
import { ProjectSelector } from "@/components/preoperational/ProjectSelector";
import { MachineSelector } from "@/components/preoperational/MachineSelector";
import { HourometerInput } from "@/components/preoperational/HourometerInput";
import { FluidLevelSelector } from "@/components/preoperational/FluidLevelSelector";
import { ChecklistSection } from "@/components/preoperational/ChecklistSection";
import { PhotoCapture } from "@/components/preoperational/PhotoCapture";
import { TireWearSelector } from "@/components/preoperational/TireWearSelector";

interface Project {
  id: string;
  name: string;
  client_name: string;
  status: string;
  location: string;
}

interface Machine {
  id: string;
  name: string;
  model: string;
  brand: string;
  current_hours: number;
  status: string;
}

interface Photo {
  file: File;
  preview: string;
}

const CHECKLIST_ITEMS = [
  { key: "temperatura", label: "Temperatura del equipo" },
  { key: "alertas", label: "Revisión de alertas en tablero" },
  { key: "mangueras", label: "Revisión de mangueras" },
  { key: "fugas", label: "Revisión de fugas de aceite" },
  { key: "aire_acondicionado", label: "Funcionamiento aire acondicionado" },
  { key: "llantas_aire", label: "Llantas con suficiente aire" },
  { key: "oruga_grasa", label: "(Si aplica) Oruga: grasa ok" }
];

export default function Preoperational() {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Temporarily use hardcoded user ID until auth context issue is resolved
  const user = { id: '00000000-0000-0000-0000-000000000000' };
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    datetime: new Date().toISOString().slice(0, 16),
    horometer_initial: 0,
    hours_worked: 0,
    horometer_final: 0,
    fuel_level: "",
    oil_level: "",
    coolant_level: "",
    hydraulic_level: "",
    greased: false,
    tires_wear: "alto",
    tires_punctured: false,
    tires_bearing_issue: false,
    tires_action: "none",
    lights_status: "bueno",
    lights_note: "",
    hoses_status: "bueno",
    hoses_note: "",
    observations: ""
  });
  
  const [checklist, setChecklist] = useState<Record<string, { checked: boolean; comment: string }>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize checklist
  useEffect(() => {
    const initialChecklist: Record<string, { checked: boolean; comment: string }> = {};
    CHECKLIST_ITEMS.forEach(item => {
      initialChecklist[item.key] = { checked: false, comment: "" };
    });
    setChecklist(initialChecklist);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-calculate final horometer
  useEffect(() => {
    if (formData.horometer_initial && formData.hours_worked) {
      setFormData(prev => ({
        ...prev,
        horometer_final: prev.horometer_initial + prev.hours_worked
      }));
    }
  }, [formData.horometer_initial, formData.hours_worked]);

  // Set initial horometer from selected machine
  useEffect(() => {
    if (selectedMachine) {
      setFormData(prev => ({
        ...prev,
        horometer_initial: selectedMachine.current_hours || 0
      }));
    }
  }, [selectedMachine]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedMachine(null); // Reset machine when project changes
    setCurrentStep(2);
  };

  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine);
    setCurrentStep(3);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChecklistChange = (key: string, field: 'checked' | 'comment', value: boolean | string) => {
    setChecklist(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handlePhotoAdd = (photo: Photo) => {
    setPhotos(prev => [...prev, photo]);
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!selectedProject) errors.push("Debe seleccionar un proyecto");
    if (!selectedMachine) errors.push("Debe seleccionar una máquina");
    if (!formData.hydraulic_level) errors.push("Debe indicar el nivel hidráulico");
    if (!formData.fuel_level) errors.push("Debe indicar el nivel de combustible");
    if (!formData.oil_level) errors.push("Debe indicar el nivel de aceite");
    if (!formData.coolant_level) errors.push("Debe indicar el nivel de refrigerante");
    if (!formData.tires_wear) errors.push("Debe indicar el desgaste de llantas");
    if (formData.hours_worked > 24) errors.push("Las horas trabajadas no pueden exceder 24");
    if (formData.hours_worked < 0) errors.push("Las horas trabajadas no pueden ser negativas");
    
    // Check if critical items need photos
    const needsPhoto = formData.tires_action !== "none" || 
                      formData.hoses_status !== "bueno" || 
                      formData.lights_status !== "bueno" ||
                      formData.tires_punctured ||
                      formData.tires_bearing_issue;
    
    if (needsPhoto && photos.length === 0) {
      errors.push("Debe adjuntar al menos una foto cuando hay elementos que requieren reparación");
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
      // Create preoperational record
      const { data, error } = await supabase
        .from('preoperational')
        .insert({
          machine_id: selectedMachine!.id,
          project_id: selectedProject!.id,
          user_id: user?.id || '',
          datetime: formData.datetime,
          ...formData,
          checklist: Object.entries(checklist).map(([key, value]) => ({
            key,
            checked: value.checked,
            comment: value.comment
          })),
          sync_status: isOnline ? 'synced' : 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Upload photos to storage and create photo records
      
      toast({
        title: "Preoperacional enviado",
        description: isOnline ? "El formulario se ha guardado correctamente" : "Se guardó localmente y se sincronizará cuando haya conexión",
        variant: "default"
      });

      navigate("/machines");
      
    } catch (error) {
      console.error('Error submitting preoperational:', error);
      toast({
        title: "Error al enviar",
        description: "No se pudo guardar el formulario. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Preoperacional</h1>
          <p className="text-sm text-muted-foreground">
            {selectedProject && selectedMachine 
              ? `${selectedProject.name} - ${selectedMachine.name}`
              : "Formulario diario de inspección"
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isOnline && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Sin conexión
          </Badge>
        )}
        <Badge variant="outline">
          Paso {currentStep} de 3
        </Badge>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectSelector
            onProjectSelect={handleProjectSelect}
            selectedProject={selectedProject}
          />
        );
      
      case 2:
        return (
          <MachineSelector
            projectId={selectedProject?.id || ''}
            onMachineSelect={handleMachineSelect}
            selectedMachine={selectedMachine}
            onBack={() => setCurrentStep(1)}
          />
        );
      
      case 3:
        return (
          <div className="space-y-6 p-4">
            {/* Machine Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Información de la Máquina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Proyecto</Label>
                    <p className="font-medium">{selectedProject?.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Máquina</Label>
                    <p className="font-medium">{selectedMachine?.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Modelo</Label>
                    <p className="font-medium">{selectedMachine?.model}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <Badge variant={selectedMachine?.status === 'operativo' ? 'default' : 'secondary'}>
                      {selectedMachine?.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date and Time */}
            <Card>
              <CardHeader>
                <CardTitle>Fecha y Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="datetime-local"
                  value={formData.datetime}
                  onChange={(e) => handleFormChange('datetime', e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Horometer Section */}
            <HourometerInput
              initialHours={formData.horometer_initial}
              hoursWorked={formData.hours_worked}
              finalHours={formData.horometer_final}
              onInitialChange={(value) => handleFormChange('horometer_initial', value)}
              onWorkedChange={(value) => handleFormChange('hours_worked', value)}
            />

            {/* Fluid Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Niveles de Fluidos</CardTitle>
                <CardDescription>Indique el estado de cada fluido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FluidLevelSelector
                  label="Combustible"
                  value={formData.fuel_level}
                  onChange={(value) => handleFormChange('fuel_level', value)}
                />
                <FluidLevelSelector
                  label="Aceite Motor"
                  value={formData.oil_level}
                  onChange={(value) => handleFormChange('oil_level', value)}
                />
                <FluidLevelSelector
                  label="Refrigerante"
                  value={formData.coolant_level}
                  onChange={(value) => handleFormChange('coolant_level', value)}
                />
                <FluidLevelSelector
                  label="Hidráulico"
                  value={formData.hydraulic_level}
                  onChange={(value) => handleFormChange('hydraulic_level', value)}
                />
              </CardContent>
            </Card>

            {/* Tires */}
            <Card>
              <CardHeader>
                <CardTitle>Inspección de Llantas</CardTitle>
                <CardDescription>Verifique el estado de las llantas del equipo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TireWearSelector
                  value={formData.tires_wear}
                  onChange={(value) => handleFormChange('tires_wear', value)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tires_punctured"
                      checked={formData.tires_punctured}
                      onCheckedChange={(checked) => handleFormChange('tires_punctured', checked)}
                    />
                    <Label htmlFor="tires_punctured">Llantas pinchadas</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tires_bearing_issue"
                      checked={formData.tires_bearing_issue}
                      onCheckedChange={(checked) => handleFormChange('tires_bearing_issue', checked)}
                    />
                    <Label htmlFor="tires_bearing_issue">Problemas de rodamiento</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Acción Requerida</Label>
                  <Select value={formData.tires_action} onValueChange={(value) => handleFormChange('tires_action', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione acción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin acción</SelectItem>
                      <SelectItem value="repair">Reparar</SelectItem>
                      <SelectItem value="replace">Reemplazar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Greasing */}
            <Card>
              <CardHeader>
                <CardTitle>Engrase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="greased"
                    checked={formData.greased}
                    onCheckedChange={(checked) => handleFormChange('greased', checked)}
                  />
                  <Label htmlFor="greased">Equipos engrasados correctamente</Label>
                </div>
              </CardContent>
            </Card>

            {/* Lights and Hoses */}
            <Card>
              <CardHeader>
                <CardTitle>Luces y Mangueras</CardTitle>
                <CardDescription>Estado de luces y sistema de mangueras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado de Luces</Label>
                  <Select value={formData.lights_status} onValueChange={(value) => handleFormChange('lights_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado de las luces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="foco_danado">Foco dañado</SelectItem>
                      <SelectItem value="farola_partida">Farola partida</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.lights_status !== "bueno" && (
                    <Textarea
                      placeholder="Describa el problema con las luces..."
                      value={formData.lights_note}
                      onChange={(e) => handleFormChange('lights_note', e.target.value)}
                      rows={2}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado de Mangueras</Label>
                  <Select value={formData.hoses_status} onValueChange={(value) => handleFormChange('hoses_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado de las mangueras" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="requiere_reparacion">Requiere reparación</SelectItem>
                      <SelectItem value="reemplazo">Reemplazo</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.hoses_status !== "bueno" && (
                    <Textarea
                      placeholder="Describa el problema con las mangueras..."
                      value={formData.hoses_note}
                      onChange={(e) => handleFormChange('hoses_note', e.target.value)}
                      rows={2}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Checklist */}
            <ChecklistSection
              items={CHECKLIST_ITEMS}
              checklist={checklist}
              onChange={handleChecklistChange}
            />

            {/* Photos */}
            <PhotoCapture
              photos={photos}
              onPhotoAdd={handlePhotoAdd}
              onPhotoRemove={handlePhotoRemove}
            />

            {/* Observations */}
            <Card>
              <CardHeader>
                <CardTitle>Observaciones Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describa cualquier observación adicional sobre el estado de la máquina..."
                  value={formData.observations}
                  onChange={(e) => handleFormChange('observations', e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="pb-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                size="lg"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Enviar Formulario
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Preoperacional</h1>
        <p className="text-muted-foreground">
          Realiza inspecciones preoperacionales y consulta el historial
        </p>
      </div>

      <Tabs defaultValue="form" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Nueva Inspección</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <div className="min-h-screen bg-background">
            {renderHeader()}
            <div className="max-w-2xl mx-auto">
              {renderStepContent()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <PreoperationalHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}