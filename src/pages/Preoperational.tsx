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
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreoperationalHistory } from "@/components/preoperational/PreoperationalHistory";
import { ProjectSelector } from "@/components/preoperational/ProjectSelector";
import { MachineSelector } from "@/components/preoperational/MachineSelector";
import { HourometerInput } from "@/components/preoperational/HourometerInput";
import { FluidLevelSelector } from "@/components/preoperational/FluidLevelSelector";
import { ChecklistSection } from "@/components/preoperational/ChecklistSection";
import { PhotoCapture } from "@/components/preoperational/PhotoCapture";
import { TireWearSelector } from "@/components/preoperational/TireWearSelector";
import { PreoperationalConfirmationModal } from "@/components/preoperational/PreoperationalConfirmationModal";
import { SignatureCanvas } from "@/components/preoperational/SignatureCanvas";
import { LightsAndReverseCheck } from "@/components/preoperational/LightsAndReverseCheck";

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
  category?: string;
}

interface LightCheck {
  status: "bueno" | "foco_danado" | "farola_danada" | "no_funciona";
  note: string;
}

const CHECKLIST_ITEMS = [
  { key: "temperatura", label: "Temperatura del equipo" },
  { key: "alertas", label: "Revisión de alertas en tablero" },
  { key: "mangueras", label: "Revisión de mangueras" },
  { key: "fugas", label: "Revisión de fugas de aceite" },
  { key: "aire_acondicionado", label: "Funcionamiento aire acondicionado" },
  { key: "llantas_aire", label: "Llantas con suficiente aire" },
  { key: "oruga_grasa", label: "(Si aplica) Oruga: grasa ok" },
  { key: "botiquin", label: "Revisión del botiquín" },
  { key: "conos", label: "Conos de seguridad disponibles" },
  { key: "kit_antiderrame", label: "Kit antiderrame completo" },
  { key: "extintor", label: "Extintor en buen estado y cargado" }
];

export default function Preoperational() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // Use actual auth context
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Get current datetime in Bogotá timezone
  const getBogotaDateTime = () => {
    const date = new Date();
    // Convert to Colombia/Bogotá timezone (UTC-5)
    const bogotaOffset = -5 * 60; // -5 hours in minutes
    const utcOffset = date.getTimezoneOffset();
    const bogotaTime = new Date(date.getTime() + (bogotaOffset - utcOffset) * 60 * 1000);
    return bogotaTime.toISOString();
  };

  // Form data
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    datetime: getBogotaDateTime(),
    horometer_initial: 0,
    hours_worked: 0,
    hours_fraction: 0,
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
  
  // Detailed lights state
  const [lightsData, setLightsData] = useState<{
    front_left: LightCheck;
    front_right: LightCheck;
    rear_left: LightCheck;
    rear_right: LightCheck;
    reverse_horn: LightCheck;
  }>({
    front_left: { status: "bueno", note: "" },
    front_right: { status: "bueno", note: "" },
    rear_left: { status: "bueno", note: "" },
    rear_right: { status: "bueno", note: "" },
    reverse_horn: { status: "bueno", note: "" }
  });
  
  // Signatures
  const [operatorSignature, setOperatorSignature] = useState<string | null>(null);
  const [supervisorSignature, setSupervisorSignature] = useState<string | null>(null);
  
  const [checklist, setChecklist] = useState<Record<string, { checked: boolean; comment: string }>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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

  // Auto-calculate final horometer with fraction
  useEffect(() => {
    const fractionValue = formData.hours_fraction / 10;
    const finalHours = formData.horometer_initial + formData.hours_worked + fractionValue;
    setFormData(prev => ({
      ...prev,
      horometer_final: Math.round(finalHours * 10) / 10 // Round to 1 decimal
    }));
  }, [formData.horometer_initial, formData.hours_worked, formData.hours_fraction]);

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
    if (formData.hours_fraction < 0 || formData.hours_fraction > 9) errors.push("La fracción debe estar entre 0 y 9");
    
    // Validate operator signature (required)
    if (!operatorSignature) errors.push("La firma del operador es obligatoria");
    
    // Validate all lights are checked
    const allLights = Object.values(lightsData);
    if (allLights.some(light => !light.status)) {
      errors.push("Debe revisar todas las luces y el pito de reversa");
    }
    
    // Check if any light needs a note
    const lightsNeedingNotes = allLights.filter(light => light.status !== "bueno" && !light.note);
    if (lightsNeedingNotes.length > 0) {
      errors.push("Debe agregar notas para las luces con problemas");
    }
    
    // Check if critical items need photos
    const hasLightIssues = allLights.some(light => light.status !== "bueno");
    const needsPhoto = formData.tires_action !== "none" || 
                      formData.hoses_status !== "bueno" || 
                      hasLightIssues ||
                      formData.tires_punctured ||
                      formData.tires_bearing_issue;
    
    if (needsPhoto && photos.length === 0) {
      errors.push("Debe adjuntar al menos una foto cuando hay elementos que requieren reparación");
    }
    
    return errors;
  };

  const handleSubmitForm = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Errores en el formulario",
        description: errors.join(", "),
        variant: "destructive"
      });
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate user is authenticated
      if (!user || !user.id) {
        toast({
          title: "Error de autenticación",
          description: "Debe estar autenticado para enviar el formulario",
          variant: "destructive"
        });
        return;
      }

      // Upload signatures to storage
      let operatorSignatureUrl = null;
      let supervisorSignatureUrl = null;
      const timestamp = new Date().toISOString();

      if (operatorSignature) {
        const blob = await fetch(operatorSignature).then(r => r.blob());
        const fileName = `operator_${user.id}_${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Updown preoperational photos')
          .upload(fileName, blob, { contentType: 'image/png' });
        
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('Updown preoperational photos')
            .getPublicUrl(uploadData.path);
          operatorSignatureUrl = publicUrl;
        }
      }

      if (supervisorSignature) {
        const blob = await fetch(supervisorSignature).then(r => r.blob());
        const fileName = `supervisor_${user.id}_${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Updown preoperational photos')
          .upload(fileName, blob, { contentType: 'image/png' });
        
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('Updown preoperational photos')
            .getPublicUrl(uploadData.path);
          supervisorSignatureUrl = publicUrl;
        }
      }

      // Create preoperational record
      const { data, error } = await supabase
        .from('preoperational')
        .insert({
          machine_id: selectedMachine!.id,
          project_id: selectedProject!.id,
          user_id: user.id,
          username: user.full_name || user.username,
          datetime: formData.datetime,
          horometer_initial: formData.horometer_initial,
          hours_worked: formData.hours_worked,
          hours_fraction: formData.hours_fraction,
          horometer_final: formData.horometer_final,
          fuel_level: formData.fuel_level,
          oil_level: formData.oil_level,
          coolant_level: formData.coolant_level,
          hydraulic_level: formData.hydraulic_level,
          greased: formData.greased,
          tires_wear: formData.tires_wear,
          tires_punctured: formData.tires_punctured,
          tires_bearing_issue: formData.tires_bearing_issue,
          tires_action: formData.tires_action,
          lights_status: formData.lights_status,
          lights_note: formData.lights_note,
          hoses_status: formData.hoses_status,
          hoses_note: formData.hoses_note,
          observations: formData.observations,
          lights_front_left: lightsData.front_left,
          lights_front_right: lightsData.front_right,
          lights_rear_left: lightsData.rear_left,
          lights_rear_right: lightsData.rear_right,
          reverse_horn: lightsData.reverse_horn,
          operator_signature_url: operatorSignatureUrl,
          operator_signature_timestamp: timestamp,
          supervisor_signature_url: supervisorSignatureUrl,
          supervisor_signature_timestamp: supervisorSignatureUrl ? timestamp : null,
          checklist: Object.entries(checklist).map(([key, value]) => ({
            key,
            checked: value.checked,
            comment: value.comment
          })),
          sync_status: isOnline ? 'synced' : 'pending'
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Upload photos if any
      if (photos.length > 0) {
        console.log('Uploading photos...');
        const { data: { session } } = await supabase.auth.getSession();
        const authToken = session?.access_token;
        
        if (!authToken) {
          toast({
            title: "Error de autenticación",
            description: "No se pudo obtener el token de sesión",
            variant: "destructive"
          });
          return;
        }
        
        let uploadedCount = 0;
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          
          try {
            const formData = new FormData();
            formData.append('file', photo.file);
            formData.append('preoperational_id', data.id);
            formData.append('photo_type', photo.category || 'general');
            formData.append('index', (i + 1).toString());

            const uploadResponse = await supabase.functions.invoke('upload-preop-photos', {
              body: formData,
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });

            if (uploadResponse.error) {
              console.error('Photo upload error:', uploadResponse.error);
              toast({
                title: "Error en foto",
                description: `No se pudo subir la foto ${i + 1}`,
                variant: "destructive"
              });
            } else {
              uploadedCount++;
              console.log(`Photo ${i + 1} uploaded successfully`);
            }
          } catch (photoError) {
            console.error(`Error uploading photo ${i + 1}:`, photoError);
            toast({
              title: "Error en foto",
              description: `Error al subir foto ${i + 1}`,
              variant: "destructive"
            });
          }
        }

        if (uploadedCount > 0) {
          toast({
            title: "Fotos subidas",
            description: `${uploadedCount} de ${photos.length} fotos subidas correctamente`,
            variant: "default"
          });
        }
      }

      // Success message and cleanup
      toast({
        title: "Preoperacional enviado",
        description: `Preoperacional completado exitosamente por ${user.full_name || user.username}`,
        variant: "default"
      });

      // Reset form
      setSelectedProject(null);
      setSelectedMachine(null);
      setCurrentStep(0);
      setFormData({
        datetime: getBogotaDateTime(),
        horometer_initial: 0,
        horometer_final: 0,
        hours_worked: 0,
        hours_fraction: 0,
        fuel_level: '',
        oil_level: '',
        coolant_level: '',
        hydraulic_level: '',
        tires_wear: '',
        tires_action: 'none',
        tires_bearing_issue: false,
        tires_punctured: false,
        lights_status: 'bueno',
        lights_note: '',
        hoses_status: 'bueno',
        hoses_note: '',
        greased: false,
        observations: ''
      });
      setLightsData({
        front_left: { status: "bueno", note: "" },
        front_right: { status: "bueno", note: "" },
        rear_left: { status: "bueno", note: "" },
        rear_right: { status: "bueno", note: "" },
        reverse_horn: { status: "bueno", note: "" }
      });
      setOperatorSignature(null);
      setSupervisorSignature(null);
      setChecklist({});
      setPhotos([]);
      
      // Close modal and navigate to history
      setShowConfirmationModal(false);
      
      toast({
        title: "Preoperacional enviado",
        description: `Formulario enviado por ${user.full_name || user.username}. ${isOnline ? 'Guardado correctamente' : 'Se guardó localmente y se sincronizará cuando haya conexión'}`,
        variant: "default"
      });

      // Navigate to preoperational history tab
      navigate("/preoperational", { state: { activeTab: "history" } });
      
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
          {user && (
            <p className="text-xs text-muted-foreground mt-1">
              👤 Operador: {user.full_name || user.username}
            </p>
          )}
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
          <div className="space-y-2 md:space-y-6 px-1 md:p-4 preop-form-mobile">
            {/* Machine Info */}
            <Card className="mx-1 md:mx-0 preop-card-mobile">
              <CardHeader className="p-3 pb-2 md:p-6 md:pb-6 preop-card-header-mobile">
                <CardTitle className="flex items-center gap-2 text-sm md:text-lg preop-title-mobile">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  Información de la Máquina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-3 md:p-6 preop-card-content-mobile">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground text-xs md:text-sm preop-label-mobile">Proyecto</Label>
                    <p className="font-medium text-xs md:text-base">{selectedProject?.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs md:text-sm preop-label-mobile">Máquina</Label>
                    <p className="font-medium text-xs md:text-base">{selectedMachine?.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs md:text-sm preop-label-mobile">Modelo</Label>
                    <p className="font-medium text-xs md:text-base">{selectedMachine?.model}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs md:text-sm preop-label-mobile">Estado</Label>
                    <Badge variant={selectedMachine?.status === 'operativo' ? 'default' : 'secondary'}>
                      {selectedMachine?.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date and Time - Read Only */}
            <Card className="mx-1 md:mx-0 preop-card-mobile">
              <CardHeader className="p-3 pb-2 md:pb-3 md:p-6 preop-card-header-mobile">
                <CardTitle className="text-sm md:text-base md:text-lg preop-title-mobile">Fecha y Hora (Automática)</CardTitle>
                <CardDescription className="text-xs md:text-sm preop-description-mobile">
                  Zona horaria: América/Bogotá (Colombia)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 md:p-6 preop-card-content-mobile">
                <Input
                  type="text"
                  value={new Date(formData.datetime).toLocaleString('es-CO', { 
                    timeZone: 'America/Bogota',
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                  readOnly
                  disabled
                  className="w-full bg-muted text-xs md:text-sm md:text-base"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Esta fecha y hora se registra automáticamente y no puede modificarse
                </p>
              </CardContent>
            </Card>

            {/* Horometer Section */}
            <HourometerInput
              initialHours={formData.horometer_initial}
              hoursWorked={formData.hours_worked}
              hoursFraction={formData.hours_fraction}
              finalHours={formData.horometer_final}
              onInitialChange={(value) => handleFormChange('horometer_initial', value)}
              onWorkedChange={(value) => handleFormChange('hours_worked', value)}
              onFractionChange={(value) => handleFormChange('hours_fraction', value)}
            />

            {/* Fluid Levels */}
            <Card className="mx-1 md:mx-0 preop-card-mobile">
              <CardHeader className="p-3 pb-2 md:p-6 md:pb-6 preop-card-header-mobile">
                <CardTitle className="text-sm md:text-lg preop-title-mobile">Niveles de Fluidos</CardTitle>
                <CardDescription className="text-xs md:text-sm preop-description-mobile">Indique el estado de cada fluido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-3 md:p-6 preop-card-content-mobile">
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
            <Card className="mx-1 md:mx-0 preop-card-mobile">
              <CardHeader className="p-3 pb-2 md:p-6 md:pb-6 preop-card-header-mobile">
                <CardTitle className="text-sm md:text-lg preop-title-mobile">Inspección de Llantas</CardTitle>
                <CardDescription className="text-xs md:text-sm preop-description-mobile">Verifique el estado de las llantas del equipo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-3 md:p-6 preop-card-content-mobile">
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
            <Card className="mx-1 md:mx-0 preop-card-mobile">
              <CardHeader className="p-3 pb-2 md:p-6 md:pb-6 preop-card-header-mobile">
                <CardTitle className="text-sm md:text-lg preop-title-mobile">Engrase</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 preop-card-content-mobile">
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

            {/* Detailed Lights and Reverse Horn Check */}
            <LightsAndReverseCheck
              frontLeft={lightsData.front_left}
              frontRight={lightsData.front_right}
              rearLeft={lightsData.rear_left}
              rearRight={lightsData.rear_right}
              reverseHorn={lightsData.reverse_horn}
              onFrontLeftChange={(value) => setLightsData(prev => ({ ...prev, front_left: value }))}
              onFrontRightChange={(value) => setLightsData(prev => ({ ...prev, front_right: value }))}
              onRearLeftChange={(value) => setLightsData(prev => ({ ...prev, rear_left: value }))}
              onRearRightChange={(value) => setLightsData(prev => ({ ...prev, rear_right: value }))}
              onReverseHornChange={(value) => setLightsData(prev => ({ ...prev, reverse_horn: value }))}
            />

            {/* Hoses */}
            <Card className="mx-1 md:mx-0 preop-card-mobile">
              <CardHeader className="p-3 pb-2 md:p-6 md:pb-6 preop-card-header-mobile">
                <CardTitle className="text-sm md:text-lg preop-title-mobile">Mangueras</CardTitle>
                <CardDescription className="text-xs md:text-sm preop-description-mobile">Estado del sistema de mangueras</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-3 md:p-6 preop-card-content-mobile">
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
                      className="text-sm"
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
            <Card className="mx-1 md:mx-0 preop-card-mobile">
              <CardHeader className="p-3 pb-2 md:pb-3 md:p-6 md:pb-6 preop-card-header-mobile">
                <CardTitle className="text-sm md:text-base md:text-lg preop-title-mobile">Observaciones Adicionales</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 preop-card-content-mobile">
                <Textarea
                  placeholder="Describa cualquier observación adicional sobre el estado de la máquina..."
                  value={formData.observations}
                  onChange={(e) => handleFormChange('observations', e.target.value)}
                  rows={4}
                  className="text-xs md:text-sm"
                />
              </CardContent>
            </Card>

            {/* Digital Signatures */}
            <SignatureCanvas
              title="Firma del Operador"
              description="Esta firma es obligatoria. Firme con el dedo o mouse."
              required={true}
              onSignatureChange={setOperatorSignature}
            />
            
            <SignatureCanvas
              title="Firma del Supervisor"
              description="Esta firma es opcional."
              required={false}
              onSignatureChange={setSupervisorSignature}
            />

            {/* Submit Button */}
            <div className="pb-4 md:pb-6 sticky bottom-0 bg-background pt-4 border-t md:relative md:border-t-0">
              <Button
                onClick={handleSubmitForm}
                disabled={isSubmitting || !operatorSignature}
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm md:text-base"
                size="lg"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : !operatorSignature ? (
                  "Firma del operador requerida"
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
          {user && (
            <p className="text-xs text-muted-foreground mt-1">
              👤 Operador: {user.full_name || user.username}
            </p>
          )}
        </div>

      <Tabs defaultValue="form" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Nueva Inspección</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <div className="min-h-screen bg-background">
            {renderHeader()}
            <div className="max-w-2xl mx-auto px-0 md:px-4">
              {renderStepContent()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <PreoperationalHistory />
        </TabsContent>
      </Tabs>

      {/* Confirmation Modal */}
      {selectedProject && selectedMachine && (
        <PreoperationalConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          onConfirm={handleConfirmSubmit}
          project={selectedProject}
          machine={selectedMachine}
          formData={formData}
          checklist={checklist}
          photos={photos}
          user={user}
          isSubmitting={isSubmitting}
          operatorSignature={operatorSignature}
          supervisorSignature={supervisorSignature}
          lightsData={lightsData}
        />
      )}
    </div>
  );

  // Show authentication required message if user is not logged in
  if (!user) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Autenticación Requerida</h2>
            <p className="text-muted-foreground mb-4">
              Debe iniciar sesión para completar un formulario preoperacional.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}