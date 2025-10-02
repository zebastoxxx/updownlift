import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Mail, MessageCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePreoperationalPDF } from "@/lib/pdf-generator";
import { PreoperationalPhotos } from "./PreoperationalPhotos";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PreoperationalViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
}

const CHECKLIST_LABELS: Record<string, string> = {
  temperature_ok: 'Temperatura del equipo',
  dashboard_alerts: 'Revisión de alertas en tablero',
  hoses_condition: 'Revisión de mangueras',
  oil_leaks: 'Revisión de fugas de aceite',
  ac_working: 'Funcionamiento aire acondicionado',
  tire_pressure: 'Llantas con suficiente aire',
  track_grease: 'Oruga: grasa ok',
  first_aid_kit: 'Revisión del botiquín',
  safety_cones: 'Conos de seguridad disponibles',
  spill_kit: 'Kit antiderrame completo',
  fire_extinguisher: 'Extintor en buen estado y cargado'
};

export function PreoperationalViewModal({ open, onOpenChange, record }: PreoperationalViewModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getLevelBadgeVariant = (level: string): "default" | "secondary" | "destructive" => {
    switch (level?.toLowerCase()) {
      case 'alto': return 'default';
      case 'medio': return 'secondary';
      case 'bajo': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status?.toLowerCase()) {
      case 'bueno': return 'default';
      case 'foco_danado': return 'secondary';
      case 'farola_partida': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const doc = await generatePreoperationalPDF(record);
      const fileName = `Preoperacional_${record.machine.name}_${format(new Date(record.datetime), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Generado",
        description: "El reporte se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      // Get client email
      const { data: clientData } = await supabase
        .from('clients')
        .select('email, name')
        .eq('name', record.project.client_name)
        .single();

      const clientEmail = clientData?.email || '';

      const subject = `Reporte Preoperacional - ${record.machine.name} - ${format(new Date(record.datetime), 'dd/MM/yyyy')}`;
      
      const body = `REPORTE PREOPERACIONAL
======================

INFORMACIÓN GENERAL
-------------------
Fecha: ${format(new Date(record.datetime), 'dd/MM/yyyy HH:mm')}
Proyecto: ${record.project.name}
Cliente: ${record.project.client_name || 'N/A'}
Ubicación: ${record.project.location || 'N/A'}
Máquina: ${record.machine.name}
Marca/Modelo: ${record.machine.brand || 'N/A'} / ${record.machine.model || 'N/A'}
Serie: ${record.machine.serial_number || 'N/A'}
Operador: ${record.user?.full_name || record.username}

HORAS DE TRABAJO
-----------------
Horómetro Inicial: ${record.horometer_initial || 0} hrs
Horas Trabajadas: ${record.hours_worked || 0}.${record.hours_fraction || 0} hrs
Horómetro Final: ${record.horometer_final || 0} hrs

NIVELES DE FLUIDOS
------------------
🛢️ Combustible: ${record.fuel_level?.toUpperCase() || 'N/A'}
🔧 Aceite Motor: ${record.oil_level?.toUpperCase() || 'N/A'}
❄️ Refrigerante: ${record.coolant_level?.toUpperCase() || 'N/A'}
💧 Hidráulico: ${record.hydraulic_level?.toUpperCase() || 'N/A'}
✅ Engrasado: ${record.greased ? 'SÍ' : 'NO'}

ESTADO DE LLANTAS
-----------------
Nivel de Desgaste: ${record.tires_wear || 'N/A'}
Pinchadas: ${record.tires_punctured ? 'SÍ' : 'NO'}
Problema en Rodamientos: ${record.tires_bearing_issue ? 'SÍ' : 'NO'}
Acción Requerida: ${record.tires_action === 'none' ? 'Ninguna' : record.tires_action === 'repair' ? 'Reparar' : record.tires_action === 'replace' ? 'Reemplazar' : 'N/A'}

SISTEMA DE LUCES
----------------
🔦 Delantera Izquierda: ${record.lights_front_left?.status || 'N/A'}${record.lights_front_left?.note ? ` - ${record.lights_front_left.note}` : ''}
🔦 Delantera Derecha: ${record.lights_front_right?.status || 'N/A'}${record.lights_front_right?.note ? ` - ${record.lights_front_right.note}` : ''}
🔴 Trasera Izquierda: ${record.lights_rear_left?.status || 'N/A'}${record.lights_rear_left?.note ? ` - ${record.lights_rear_left.note}` : ''}
🔴 Trasera Derecha: ${record.lights_rear_right?.status || 'N/A'}${record.lights_rear_right?.note ? ` - ${record.lights_rear_right.note}` : ''}
📢 Pito de Reversa: ${record.reverse_horn?.status || 'N/A'}${record.reverse_horn?.note ? ` - ${record.reverse_horn.note}` : ''}

MANGUERAS
---------
Estado: ${record.hoses_status || 'N/A'}
${record.hoses_note ? `Notas: ${record.hoses_note}` : ''}

CHECKLIST DE INSPECCIÓN
------------------------
${Object.entries(record.checklist || {}).map(([key, value]: [string, any]) => 
  `${value.checked ? '✅' : '❌'} ${CHECKLIST_LABELS[key] || key}${value.comment ? ` - ${value.comment}` : ''}`
).join('\n')}

${record.observations ? `OBSERVACIONES
-------------
${record.observations}` : ''}

FIRMAS DIGITALES
----------------
Operador: ${record.operator_signature_url ? 'Firmado ✅' : 'Sin firma ❌'}
Supervisor: ${record.supervisor_signature_url ? 'Firmado ✅' : 'Sin firma ❌'}

---
Este es un reporte generado automáticamente por Up & Down Lift S.A.S.
Para más información, contacte con nuestro equipo.
`;

      const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;

      toast({
        title: "Cliente de Email Abierto",
        description: "Se ha abierto tu cliente de email predeterminado",
      });
    } catch (error) {
      console.error('Error preparing email:', error);
      toast({
        title: "Error",
        description: "No se pudo preparar el email",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const message = `*📄 REPORTE PREOPERACIONAL*

*INFORMACIÓN GENERAL*
📅 Fecha: ${format(new Date(record.datetime), 'dd/MM/yyyy HH:mm')}
🏗️ Proyecto: ${record.project.name}
👤 Cliente: ${record.project.client_name || 'N/A'}
📍 Ubicación: ${record.project.location || 'N/A'}
🚜 Máquina: ${record.machine.name}
🏭 Marca/Modelo: ${record.machine.brand || 'N/A'} / ${record.machine.model || 'N/A'}
🔢 Serie: ${record.machine.serial_number || 'N/A'}
👷 Operador: ${record.user?.full_name || record.username}

*⏱️ HORAS DE TRABAJO*
▪️ Horómetro Inicial: ${record.horometer_initial || 0} hrs
▪️ Horas Trabajadas: ${record.hours_worked || 0}.${record.hours_fraction || 0} hrs
▪️ Horómetro Final: ${record.horometer_final || 0} hrs

*⛽ NIVELES DE FLUIDOS*
🛢️ Combustible: ${record.fuel_level?.toUpperCase() || 'N/A'}
🔧 Aceite Motor: ${record.oil_level?.toUpperCase() || 'N/A'}
❄️ Refrigerante: ${record.coolant_level?.toUpperCase() || 'N/A'}
💧 Hidráulico: ${record.hydraulic_level?.toUpperCase() || 'N/A'}
${record.greased ? '✅' : '❌'} Engrasado

*🛞 ESTADO DE LLANTAS*
▪️ Desgaste: ${record.tires_wear || 'N/A'}
▪️ Pinchadas: ${record.tires_punctured ? '❌ SÍ' : '✅ NO'}
▪️ Rodamientos: ${record.tires_bearing_issue ? '❌ Problema' : '✅ OK'}
▪️ Acción: ${record.tires_action === 'none' ? 'Ninguna' : record.tires_action === 'repair' ? '⚠️ Reparar' : record.tires_action === 'replace' ? '🔴 Reemplazar' : 'N/A'}

*💡 SISTEMA DE LUCES*
🔦 Delantera Izq.: ${record.lights_front_left?.status || 'N/A'}
🔦 Delantera Der.: ${record.lights_front_right?.status || 'N/A'}
🔴 Trasera Izq.: ${record.lights_rear_left?.status || 'N/A'}
🔴 Trasera Der.: ${record.lights_rear_right?.status || 'N/A'}
📢 Pito Reversa: ${record.reverse_horn?.status || 'N/A'}

*🔧 MANGUERAS*
Estado: ${record.hoses_status || 'N/A'}

*✅ CHECKLIST*
${Object.entries(record.checklist || {}).map(([key, value]: [string, any]) => 
  `${value.checked ? '✅' : '❌'} ${CHECKLIST_LABELS[key] || key}`
).join('\n')}

${record.observations ? `*📝 OBSERVACIONES*\n${record.observations}\n` : ''}
*✍️ FIRMAS*
Operador: ${record.operator_signature_url ? '✅' : '❌'}
Supervisor: ${record.supervisor_signature_url ? '✅' : '❌'}

_Reporte generado por Up & Down Lift S.A.S._`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "WhatsApp Abierto",
      description: "Compartir el reporte desde WhatsApp",
    });
  };

  if (!record) return null;

  const hasIssues = 
    record.tires_action !== 'none' ||
    record.hoses_status !== 'bueno' ||
    record.lights_front_left?.status !== 'bueno' ||
    record.lights_front_right?.status !== 'bueno' ||
    record.lights_rear_left?.status !== 'bueno' ||
    record.lights_rear_right?.status !== 'bueno' ||
    record.reverse_horn?.status !== 'bueno';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            📄 Reporte Preoperacional
          </DialogTitle>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleDownloadPDF} disabled={loading} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
            <Button onClick={handleSendEmail} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button onClick={handleWhatsAppShare} variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm" className="ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="space-y-4 pr-4">
                {/* INFORMACIÓN GENERAL */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="bg-primary/10">
                    <CardTitle className="text-lg">📋 Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                      <p className="font-semibold">{format(new Date(record.datetime), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Proyecto</p>
                      <p className="font-semibold">{record.project.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-semibold">{record.project.client_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ubicación</p>
                      <p className="font-semibold">{record.project.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Máquina</p>
                      <p className="font-semibold">{record.machine.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Marca / Modelo</p>
                      <p className="font-semibold">{record.machine.brand || 'N/A'} / {record.machine.model || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serie</p>
                      <p className="font-semibold">{record.machine.serial_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Operador</p>
                      <p className="font-semibold">{record.user?.full_name || record.username}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* HORAS DE TRABAJO */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">⏱️ Horas de Trabajo</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Horómetro Inicial</p>
                      <p className="font-semibold text-xl">{record.horometer_initial || 0} hrs</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horas Trabajadas</p>
                      <p className="font-semibold text-xl text-primary">{record.hours_worked || 0}.{record.hours_fraction || 0} hrs</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horómetro Final</p>
                      <p className="font-semibold text-xl">{record.horometer_final || 0} hrs</p>
                    </div>
                  </CardContent>
                </Card>

                {/* NIVELES DE FLUIDOS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">⛽ Niveles de Fluidos</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">🛢️ Combustible</p>
                      <Badge variant={getLevelBadgeVariant(record.fuel_level)}>{record.fuel_level?.toUpperCase()}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">🔧 Aceite</p>
                      <Badge variant={getLevelBadgeVariant(record.oil_level)}>{record.oil_level?.toUpperCase()}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">❄️ Refrigerante</p>
                      <Badge variant={getLevelBadgeVariant(record.coolant_level)}>{record.coolant_level?.toUpperCase()}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">💧 Hidráulico</p>
                      <Badge variant={getLevelBadgeVariant(record.hydraulic_level)}>{record.hydraulic_level?.toUpperCase()}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">✅ Engrasado</p>
                      <Badge variant={record.greased ? 'default' : 'destructive'}>{record.greased ? 'SÍ' : 'NO'}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* ESTADO DE LLANTAS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🛞 Estado de Llantas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nivel de Desgaste</p>
                        <p className="font-semibold">{record.tires_wear || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Acción Requerida</p>
                        <Badge variant={record.tires_action === 'none' ? 'default' : 'destructive'}>
                          {record.tires_action === 'none' ? 'Ninguna' : record.tires_action === 'repair' ? 'Reparar' : 'Reemplazar'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{record.tires_punctured ? '❌' : '✅'}</span>
                        <span className="text-sm">Pinchadas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{record.tires_bearing_issue ? '❌' : '✅'}</span>
                        <span className="text-sm">Rodamientos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SISTEMA DE LUCES */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💡 Sistema de Luces</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { icon: '🔦', label: 'Delantera Izquierda', data: record.lights_front_left },
                      { icon: '🔦', label: 'Delantera Derecha', data: record.lights_front_right },
                      { icon: '🔴', label: 'Trasera Izquierda', data: record.lights_rear_left },
                      { icon: '🔴', label: 'Trasera Derecha', data: record.lights_rear_right },
                      { icon: '📢', label: 'Pito de Reversa', data: record.reverse_horn },
                    ].map((light, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <span>{light.icon}</span>
                          <span className="text-sm font-medium">{light.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(light.data?.status)}>
                            {light.data?.status || 'N/A'}
                          </Badge>
                          {light.data?.note && (
                            <span className="text-xs text-muted-foreground">({light.data.note})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* MANGUERAS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🔧 Mangueras</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge variant={getStatusBadgeVariant(record.hoses_status)}>{record.hoses_status || 'N/A'}</Badge>
                    </div>
                    {record.hoses_note && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notas</p>
                        <p className="text-sm">{record.hoses_note}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* CHECKLIST */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">✅ Checklist de Inspección</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(record.checklist || {}).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                        <span className="text-lg">{value.checked ? '✅' : '❌'}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{CHECKLIST_LABELS[key] || key}</p>
                          {value.comment && (
                            <p className="text-xs text-muted-foreground mt-1">{value.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* FIRMAS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">✍️ Firmas Digitales</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Operador</p>
                      {record.operator_signature_url ? (
                        <img src={record.operator_signature_url} alt="Firma Operador" className="border rounded max-h-24 mx-auto" />
                      ) : (
                        <Badge variant="destructive">Sin firma</Badge>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Supervisor</p>
                      {record.supervisor_signature_url ? (
                        <img src={record.supervisor_signature_url} alt="Firma Supervisor" className="border rounded max-h-24 mx-auto" />
                      ) : (
                        <Badge variant="destructive">Sin firma</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* OBSERVACIONES */}
                {record.observations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">📝 Observaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{record.observations}</p>
                    </CardContent>
                  </Card>
                )}

                {/* PROBLEMAS DETECTADOS */}
                {hasIssues && (
                  <Card className="border-destructive">
                    <CardHeader className="bg-destructive/10">
                      <CardTitle className="text-lg text-destructive">⚠️ Problemas Detectados</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {record.tires_action !== 'none' && (
                          <li>Llantas requieren {record.tires_action === 'repair' ? 'reparación' : 'reemplazo'}</li>
                        )}
                        {record.hoses_status !== 'bueno' && (
                          <li>Mangueras en estado: {record.hoses_status}</li>
                        )}
                        {record.lights_front_left?.status !== 'bueno' && (
                          <li>Luz delantera izquierda: {record.lights_front_left?.status}</li>
                        )}
                        {record.lights_front_right?.status !== 'bueno' && (
                          <li>Luz delantera derecha: {record.lights_front_right?.status}</li>
                        )}
                        {record.lights_rear_left?.status !== 'bueno' && (
                          <li>Luz trasera izquierda: {record.lights_rear_left?.status}</li>
                        )}
                        {record.lights_rear_right?.status !== 'bueno' && (
                          <li>Luz trasera derecha: {record.lights_rear_right?.status}</li>
                        )}
                        {record.reverse_horn?.status !== 'bueno' && (
                          <li>Pito de reversa: {record.reverse_horn?.status}</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="photos">
            <ScrollArea className="h-[calc(90vh-200px)]">
              <PreoperationalPhotos preoperationalId={record.id} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
