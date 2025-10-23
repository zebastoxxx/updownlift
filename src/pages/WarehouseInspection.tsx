import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ArrowRight, Save, Gauge, AlertTriangle } from "lucide-react";
import { InspectionTypeSelector } from "@/components/warehouse/InspectionTypeSelector";
import { MachineSelectorWarehouse } from "@/components/warehouse/MachineSelectorWarehouse";
import { FluidLevelsInspection } from "@/components/warehouse/FluidLevelsInspection";
import { TiresAndBodyInspection } from "@/components/warehouse/TiresAndBodyInspection";
import { CabinAndSafetyInspection } from "@/components/warehouse/CabinAndSafetyInspection";
import { InspectionChecklist } from "@/components/warehouse/InspectionChecklist";
import { PhotoCapture } from "@/components/preoperational/PhotoCapture";
import { cn } from "@/lib/utils";

interface Machine {
  id: string;
  name: string;
  model: string;
  brand: string;
  current_hours: number;
  status: string;
}

interface ChecklistItem {
  key: string;
  label: string;
  checked: boolean;
  comment?: string;
}

interface Photo {
  file: File;
  preview: string;
  category?: string;
}

const OVERALL_CONDITIONS = [
  { value: "excelente", label: "Excelente", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "bueno", label: "Bueno", color: "bg-lime-100 text-lime-800 border-lime-300" },
  { value: "aceptable", label: "Aceptable", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "requiere_atencion", label: "Requiere Atención", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { value: "no_apto", label: "No Apto", color: "bg-red-100 text-red-800 border-red-300" }
];

export default function WarehouseInspection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("new");
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [inspectionType, setInspectionType] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [horometerReading, setHorometerReading] = useState("");
  const [fuelLevel, setFuelLevel] = useState("lleno");
  const [oilLevel, setOilLevel] = useState("lleno");
  const [coolantLevel, setCoolantLevel] = useState("lleno");
  const [hydraulicLevel, setHydraulicLevel] = useState("lleno");
  const [tireCondition, setTireCondition] = useState("bueno");
  const [tirePressureOk, setTirePressureOk] = useState(true);
  const [bodyCondition, setBodyCondition] = useState("bueno");
  const [lightsWorking, setLightsWorking] = useState(true);
  const [lightsNote, setLightsNote] = useState("");
  const [hornWorking, setHornWorking] = useState(true);
  const [windowsIntact, setWindowsIntact] = useState(true);
  const [windowsNote, setWindowsNote] = useState("");
  const [mirrorsIntact, setMirrorsIntact] = useState(true);
  const [seatCondition, setSeatCondition] = useState("bueno");
  const [cabinCleanliness, setCabinCleanliness] = useState("limpio");
  const [leaksDetected, setLeaksDetected] = useState(false);
  const [leaksLocation, setLeaksLocation] = useState("");
  const [hosesCondition, setHosesCondition] = useState("bueno");
  const [batteryCondition, setBatteryCondition] = useState("bueno");
  const [toolsComplete, setToolsComplete] = useState(true);
  const [toolsMissing, setToolsMissing] = useState("");
  const [fireExtinguisher, setFireExtinguisher] = useState(true);
  const [firstAidKit, setFirstAidKit] = useState(true);
  const [safetyCones, setSafetyCones] = useState(true);
  const [reflectiveTriangles, setReflectiveTriangles] = useState(true);
  const [documentsComplete, setDocumentsComplete] = useState(true);
  const [documentsMissing, setDocumentsMissing] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [overallCondition, setOverallCondition] = useState("bueno");
  const [observations, setObservations] = useState("");

  const canContinue = () => {
    if (step === 1) return inspectionType !== "";
    if (step === 2) return selectedMachine !== null;
    if (step === 3) return horometerReading !== "";
    return true;
  };

  const handleNext = () => {
    if (canContinue()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const resetForm = () => {
    setStep(1);
    setInspectionType("");
    setSelectedMachine(null);
    setHorometerReading("");
    setFuelLevel("lleno");
    setOilLevel("lleno");
    setCoolantLevel("lleno");
    setHydraulicLevel("lleno");
    setTireCondition("bueno");
    setTirePressureOk(true);
    setBodyCondition("bueno");
    setLightsWorking(true);
    setLightsNote("");
    setHornWorking(true);
    setWindowsIntact(true);
    setWindowsNote("");
    setMirrorsIntact(true);
    setSeatCondition("bueno");
    setCabinCleanliness("limpio");
    setLeaksDetected(false);
    setLeaksLocation("");
    setHosesCondition("bueno");
    setBatteryCondition("bueno");
    setToolsComplete(true);
    setToolsMissing("");
    setFireExtinguisher(true);
    setFirstAidKit(true);
    setSafetyCones(true);
    setReflectiveTriangles(true);
    setDocumentsComplete(true);
    setDocumentsMissing("");
    setChecklist([]);
    setPhotos([]);
    setOverallCondition("bueno");
    setObservations("");
  };

  const handleSave = async () => {
    if (!selectedMachine || !user) {
      toast({
        title: "Error",
        description: "Información incompleta",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Save inspection record
      const { data: inspection, error: inspectionError } = await supabase
        .from("warehouse_inspections")
        .insert({
          machine_id: selectedMachine.id,
          user_id: user.id,
          username: user.username || user.full_name || "Usuario",
          inspection_type: inspectionType,
          horometer_reading: parseFloat(horometerReading),
          fuel_level: fuelLevel,
          oil_level: oilLevel,
          coolant_level: coolantLevel,
          hydraulic_level: hydraulicLevel,
          tire_condition: tireCondition,
          tire_pressure_ok: tirePressureOk,
          body_condition: bodyCondition,
          lights_working: lightsWorking,
          lights_note: lightsNote,
          horn_working: hornWorking,
          windows_intact: windowsIntact,
          windows_note: windowsNote,
          mirrors_intact: mirrorsIntact,
          seat_condition: seatCondition,
          cabin_cleanliness: cabinCleanliness,
          leaks_detected: leaksDetected,
          leaks_location: leaksLocation,
          hoses_condition: hosesCondition,
          battery_condition: batteryCondition,
          tools_complete: toolsComplete,
          tools_missing: toolsMissing,
          fire_extinguisher: fireExtinguisher,
          first_aid_kit: firstAidKit,
          safety_cones: safetyCones,
          reflective_triangles: reflectiveTriangles,
          documents_complete: documentsComplete,
          documents_missing: documentsMissing,
          overall_condition: overallCondition,
          observations: observations,
          checklist: checklist,
          photos_count: photos.length
        })
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // Upload photos if any
      if (photos.length > 0 && inspection) {
        const uploadPromises = photos.map(async (photo) => {
          const fileExt = photo.file.name.split('.').pop();
          const fileName = `${inspection.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Updown preoperational photos')
            .upload(fileName, photo.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('Updown preoperational photos')
            .getPublicUrl(fileName);

          await supabase
            .from('warehouse_inspection_photos')
            .insert({
              warehouse_inspection_id: inspection.id,
              url: publicUrl,
              photo_type: photo.category || 'general',
              caption: ''
            });
        });

        await Promise.all(uploadPromises);
      }

      toast({
        title: "Inspección guardada",
        description: `Inspección de ${inspectionType} registrada exitosamente`,
      });

      resetForm();
      setActiveTab("history");
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la inspección",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">Nueva Inspección</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {/* Progress indicator */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Paso {step} de 7</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((step / 7) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(step / 7) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Inspection Type */}
          {step === 1 && (
            <InspectionTypeSelector
              value={inspectionType}
              onChange={setInspectionType}
            />
          )}

          {/* Step 2: Machine Selection */}
          {step === 2 && (
            <MachineSelectorWarehouse
              onMachineSelect={setSelectedMachine}
              selectedMachine={selectedMachine}
              onBack={handleBack}
            />
          )}

          {/* Step 3: Horometer */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Lectura de Horómetro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMachine && (
                  <Alert>
                    <AlertDescription>
                      Última lectura: {selectedMachine.current_hours?.toLocaleString() || "0"} horas
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Horómetro Actual (horas)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={horometerReading}
                    onChange={(e) => setHorometerReading(e.target.value)}
                    placeholder="0.0"
                    className="text-lg"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Fluid Levels */}
          {step === 4 && (
            <FluidLevelsInspection
              fuelLevel={fuelLevel}
              oilLevel={oilLevel}
              coolantLevel={coolantLevel}
              hydraulicLevel={hydraulicLevel}
              onFuelChange={setFuelLevel}
              onOilChange={setOilLevel}
              onCoolantChange={setCoolantLevel}
              onHydraulicChange={setHydraulicLevel}
            />
          )}

          {/* Step 5: Tires and Body */}
          {step === 5 && (
            <TiresAndBodyInspection
              tireCondition={tireCondition}
              tirePressureOk={tirePressureOk}
              bodyCondition={bodyCondition}
              lightsWorking={lightsWorking}
              lightsNote={lightsNote}
              hornWorking={hornWorking}
              windowsIntact={windowsIntact}
              windowsNote={windowsNote}
              mirrorsIntact={mirrorsIntact}
              onTireConditionChange={setTireCondition}
              onTirePressureChange={setTirePressureOk}
              onBodyConditionChange={setBodyCondition}
              onLightsWorkingChange={setLightsWorking}
              onLightsNoteChange={setLightsNote}
              onHornWorkingChange={setHornWorking}
              onWindowsIntactChange={setWindowsIntact}
              onWindowsNoteChange={setWindowsNote}
              onMirrorsIntactChange={setMirrorsIntact}
            />
          )}

          {/* Step 6: Cabin, Safety & Checklist */}
          {step === 6 && (
            <div className="space-y-4">
              <CabinAndSafetyInspection
                seatCondition={seatCondition}
                cabinCleanliness={cabinCleanliness}
                leaksDetected={leaksDetected}
                leaksLocation={leaksLocation}
                hosesCondition={hosesCondition}
                batteryCondition={batteryCondition}
                toolsComplete={toolsComplete}
                toolsMissing={toolsMissing}
                fireExtinguisher={fireExtinguisher}
                firstAidKit={firstAidKit}
                safetyCones={safetyCones}
                reflectiveTriangles={reflectiveTriangles}
                documentsComplete={documentsComplete}
                documentsMissing={documentsMissing}
                onSeatConditionChange={setSeatCondition}
                onCabinCleanlinessChange={setCabinCleanliness}
                onLeaksDetectedChange={setLeaksDetected}
                onLeaksLocationChange={setLeaksLocation}
                onHosesConditionChange={setHosesCondition}
                onBatteryConditionChange={setBatteryCondition}
                onToolsCompleteChange={setToolsComplete}
                onToolsMissingChange={setToolsMissing}
                onFireExtinguisherChange={setFireExtinguisher}
                onFirstAidKitChange={setFirstAidKit}
                onSafetyConesChange={setSafetyCones}
                onReflectiveTrianglesChange={setReflectiveTriangles}
                onDocumentsCompleteChange={setDocumentsComplete}
                onDocumentsMissingChange={setDocumentsMissing}
              />
              <InspectionChecklist checklist={checklist} onChange={setChecklist} />
            </div>
          )}

          {/* Step 7: Final Review */}
          {step === 7 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evaluación Final y Observaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Condición General del Equipo</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {OVERALL_CONDITIONS.map((condition) => (
                        <Button
                          key={condition.value}
                          variant="outline"
                          size="sm"
                          onClick={() => setOverallCondition(condition.value)}
                          className={cn(
                            "h-12 transition-all",
                            overallCondition === condition.value
                              ? condition.color + " border-2"
                              : "hover:bg-accent"
                          )}
                        >
                          {condition.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observaciones Generales</Label>
                    <Textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Describa cualquier detalle adicional relevante..."
                      rows={4}
                    />
                  </div>

                  {overallCondition === "no_apto" && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Equipo marcado como NO APTO. Asegúrese de documentar todos los problemas en las observaciones.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <PhotoCapture
                photos={photos}
                onPhotoAdd={(photo) => setPhotos([...photos, photo])}
                onPhotoRemove={(index) => {
                  const newPhotos = [...photos];
                  URL.revokeObjectURL(newPhotos[index].preview);
                  newPhotos.splice(index, 1);
                  setPhotos(newPhotos);
                }}
              />
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-2 justify-between">
            {step > 1 && step < 7 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
            {step < 7 && (
              <Button onClick={handleNext} disabled={!canContinue()} className="ml-auto">
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 7 && (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Guardando..." : "Guardar Inspección"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Historial de inspecciones próximamente
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
