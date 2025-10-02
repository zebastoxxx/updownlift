import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Share2, 
  Download, 
  Mail, 
  CheckCircle, 
  Clock,
  User,
  Settings,
  Fuel,
  Wrench,
  Camera,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  client_name: string;
  location: string;
}

interface Machine {
  id: string;
  name: string;
  model: string;
  brand: string;
}

interface Photo {
  file: File;
  preview: string;
  category?: string;
}

interface ChecklistItem {
  checked: boolean;
  comment: string;
}

interface LightCheck {
  status: "bueno" | "foco_danado" | "farola_danada" | "no_funciona";
  note: string;
}

interface PreoperationalData {
  datetime: string;
  horometer_initial: number;
  hours_worked: number;
  hours_fraction: number;
  horometer_final: number;
  fuel_level: string;
  oil_level: string;
  coolant_level: string;
  hydraulic_level: string;
  greased: boolean;
  tires_wear: string;
  tires_punctured: boolean;
  tires_bearing_issue: boolean;
  tires_action: string;
  lights_status: string;
  lights_note: string;
  hoses_status: string;
  hoses_note: string;
  observations: string;
}

interface PreoperationalConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  project: Project;
  machine: Machine;
  formData: PreoperationalData;
  checklist: Record<string, ChecklistItem>;
  photos: Photo[];
  user: any;
  isSubmitting: boolean;
  operatorSignature: string | null;
  supervisorSignature: string | null;
  lightsData: {
    front_left: LightCheck;
    front_right: LightCheck;
    rear_left: LightCheck;
    rear_right: LightCheck;
    reverse_horn: LightCheck;
  };
}

const FLUID_LABELS: Record<string, string> = {
  'alto': 'Alto',
  'medio': 'Medio',
  'bajo': 'Bajo',
  'critico': 'Crítico'
};

const TIRE_WEAR_LABELS: Record<string, string> = {
  'alto': 'Alto (25% - 0%)',
  'medio': 'Medio (50% - 25%)',
  'bueno': 'Bueno (75% - 50%)',
  'excelente': 'Excelente (100% - 75%)'
};

const ACTION_LABELS: Record<string, string> = {
  'none': 'Sin acción',
  'repair': 'Reparar',
  'replace': 'Reemplazar'
};

const STATUS_LABELS: Record<string, string> = {
  'bueno': 'Bueno',
  'foco_danado': 'Foco dañado',
  'farola_partida': 'Farola partida',
  'requiere_reparacion': 'Requiere reparación',
  'reemplazo': 'Reemplazo'
};

export function PreoperationalConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  project,
  machine,
  formData,
  checklist,
  photos,
  user,
  isSubmitting,
  operatorSignature,
  supervisorSignature,
  lightsData
}: PreoperationalConfirmationModalProps) {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIssues = () => {
    const issues = [];
    if (formData.tires_action !== 'none') issues.push(`Llantas: ${ACTION_LABELS[formData.tires_action]}`);
    if (formData.tires_punctured) issues.push('Llantas pinchadas');
    if (formData.tires_bearing_issue) issues.push('Problemas de rodamiento');
    if (formData.lights_status !== 'bueno') issues.push(`Luces: ${STATUS_LABELS[formData.lights_status]}`);
    if (formData.hoses_status !== 'bueno') issues.push(`Mangueras: ${STATUS_LABELS[formData.hoses_status]}`);
    
    const criticalFluids = [];
    if (formData.fuel_level === 'bajo' || formData.fuel_level === 'critico') criticalFluids.push('Combustible');
    if (formData.oil_level === 'bajo' || formData.oil_level === 'critico') criticalFluids.push('Aceite');
    if (formData.coolant_level === 'bajo' || formData.coolant_level === 'critico') criticalFluids.push('Refrigerante');
    if (formData.hydraulic_level === 'bajo' || formData.hydraulic_level === 'critico') criticalFluids.push('Hidráulico');
    
    if (criticalFluids.length > 0) {
      issues.push(`Fluidos críticos: ${criticalFluids.join(', ')}`);
    }

    return issues;
  };

  const handleWhatsAppShare = () => {
    const reportText = `🔧 *REPORTE PREOPERACIONAL*

📍 *Proyecto:* ${project.name}
🏗️ *Cliente:* ${project.client_name}
🚛 *Máquina:* ${machine.name} (${machine.model})
📅 *Fecha:* ${formatDateTime(formData.datetime)}
👤 *Operador:* ${user?.full_name || user?.username}

⏱️ *HORAS:*
• Inicial: ${formData.horometer_initial}
• Trabajadas: ${formData.hours_worked}
• Final: ${formData.horometer_final}

⛽ *FLUIDOS:*
• Combustible: ${FLUID_LABELS[formData.fuel_level]}
• Aceite: ${FLUID_LABELS[formData.oil_level]}
• Refrigerante: ${FLUID_LABELS[formData.coolant_level]}
• Hidráulico: ${FLUID_LABELS[formData.hydraulic_level]}

🛞 *LLANTAS:*
• Desgaste: ${TIRE_WEAR_LABELS[formData.tires_wear]}
• Acción: ${ACTION_LABELS[formData.tires_action]}

${getIssues().length > 0 ? `⚠️ *PROBLEMAS DETECTADOS:*\n${getIssues().map(issue => `• ${issue}`).join('\n')}` : '✅ *Sin problemas detectados*'}

${formData.observations ? `📝 *Observaciones:* ${formData.observations}` : ''}

---
Reporte generado automáticamente`;

    const encodedText = encodeURIComponent(reportText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "PDF generado",
        description: "El reporte se ha descargado exitosamente",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el reporte",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Email enviado",
        description: "El reporte ha sido enviado por correo electrónico",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error al enviar email",
        description: "No se pudo enviar el reporte por correo",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const issues = getIssues();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmar Envío - Reporte Preoperacional
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Proyecto</p>
                <p className="font-medium">{project.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{project.client_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Máquina</p>
                <p className="font-medium">{machine.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{machine.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDateTime(formData.datetime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Operador</p>
                <p className="font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user?.full_name || user?.username}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Horas de Trabajo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Horas de Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Inicial</p>
                <p className="text-2xl font-bold">{formData.horometer_initial}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Trabajadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formData.hours_worked}.{formData.hours_fraction}h
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Final</p>
                <p className="text-2xl font-bold">{formData.horometer_final}</p>
              </div>
            </CardContent>
          </Card>

          {/* Niveles de Fluidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Fuel className="h-5 w-5" />
                Niveles de Fluidos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span>Combustible:</span>
                <Badge variant={formData.fuel_level === 'critico' || formData.fuel_level === 'bajo' ? 'destructive' : 'default'}>
                  {FLUID_LABELS[formData.fuel_level]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Aceite:</span>
                <Badge variant={formData.oil_level === 'critico' || formData.oil_level === 'bajo' ? 'destructive' : 'default'}>
                  {FLUID_LABELS[formData.oil_level]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Refrigerante:</span>
                <Badge variant={formData.coolant_level === 'critico' || formData.coolant_level === 'bajo' ? 'destructive' : 'default'}>
                  {FLUID_LABELS[formData.coolant_level]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Hidráulico:</span>
                <Badge variant={formData.hydraulic_level === 'critico' || formData.hydraulic_level === 'bajo' ? 'destructive' : 'default'}>
                  {FLUID_LABELS[formData.hydraulic_level]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Estado de Llantas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5" />
                Estado de Llantas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Desgaste:</span>
                <Badge>{TIRE_WEAR_LABELS[formData.tires_wear]}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Acción requerida:</span>
                <Badge variant={formData.tires_action !== 'none' ? 'destructive' : 'default'}>
                  {ACTION_LABELS[formData.tires_action]}
                </Badge>
              </div>
              {formData.tires_punctured && (
                <Badge variant="destructive">Llantas pinchadas</Badge>
              )}
              {formData.tires_bearing_issue && (
                <Badge variant="destructive">Problemas de rodamiento</Badge>
              )}
            </CardContent>
          </Card>

          {/* Sistema de Luces Detallado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sistema de Luces y Pito de Reversa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Luz Delantera Izq.</p>
                  <Badge variant={lightsData.front_left.status !== 'bueno' ? 'destructive' : 'default'}>
                    {STATUS_LABELS[lightsData.front_left.status] || lightsData.front_left.status}
                  </Badge>
                  {lightsData.front_left.note && (
                    <p className="text-xs text-muted-foreground mt-1">{lightsData.front_left.note}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Luz Delantera Der.</p>
                  <Badge variant={lightsData.front_right.status !== 'bueno' ? 'destructive' : 'default'}>
                    {STATUS_LABELS[lightsData.front_right.status] || lightsData.front_right.status}
                  </Badge>
                  {lightsData.front_right.note && (
                    <p className="text-xs text-muted-foreground mt-1">{lightsData.front_right.note}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Luz Trasera Izq.</p>
                  <Badge variant={lightsData.rear_left.status !== 'bueno' ? 'destructive' : 'default'}>
                    {STATUS_LABELS[lightsData.rear_left.status] || lightsData.rear_left.status}
                  </Badge>
                  {lightsData.rear_left.note && (
                    <p className="text-xs text-muted-foreground mt-1">{lightsData.rear_left.note}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Luz Trasera Der.</p>
                  <Badge variant={lightsData.rear_right.status !== 'bueno' ? 'destructive' : 'default'}>
                    {STATUS_LABELS[lightsData.rear_right.status] || lightsData.rear_right.status}
                  </Badge>
                  {lightsData.rear_right.note && (
                    <p className="text-xs text-muted-foreground mt-1">{lightsData.rear_right.note}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Pito de Reversa</p>
                  <Badge variant={lightsData.reverse_horn.status !== 'bueno' ? 'destructive' : 'default'}>
                    {STATUS_LABELS[lightsData.reverse_horn.status] || lightsData.reverse_horn.status}
                  </Badge>
                  {lightsData.reverse_horn.note && (
                    <p className="text-xs text-muted-foreground mt-1">{lightsData.reverse_horn.note}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado de Mangueras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado de Mangueras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span>Mangueras:</span>
                <Badge variant={formData.hoses_status !== 'bueno' ? 'destructive' : 'default'}>
                  {STATUS_LABELS[formData.hoses_status]}
                </Badge>
              </div>
              {formData.hoses_note && (
                <p className="text-sm text-muted-foreground mt-2">{formData.hoses_note}</p>
              )}
            </CardContent>
          </Card>

          {/* Resumen de Problemas */}
          {issues.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  Problemas Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {issues.map((issue, index) => (
                    <li key={index} className="flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="h-4 w-4" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Fotos adjuntas */}
          {photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5" />
                  Fotos Adjuntas ({photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(0, 4).map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={photo.preview} 
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {photos.length > 4 && (
                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">+{photos.length - 4} más</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Firmas Digitales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Firmas Digitales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Firma Operador</p>
                {operatorSignature && (
                  <img src={operatorSignature} alt="Firma Operador" className="border rounded-md max-h-32 w-full object-contain bg-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Firma Supervisor (Opcional)</p>
                {supervisorSignature ? (
                  <img src={supervisorSignature} alt="Firma Supervisor" className="border rounded-md max-h-32 w-full object-contain bg-white" />
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sin firma de supervisor</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {formData.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{formData.observations}</p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Acciones */}
          <div className="space-y-4">
            <h3 className="font-medium">Opciones adicionales:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartir WhatsApp
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {isSendingEmail ? "Enviando..." : "Enviar por Email"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Revisar Formulario
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Enviando..." : "Confirmar y Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}