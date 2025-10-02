import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logoImage from '@/assets/logo.png';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PreoperationalData {
  datetime: string;
  project: { name: string; client_name?: string; location?: string };
  machine: { name: string; brand?: string; model?: string; serial_number?: string };
  user: { full_name?: string; username: string };
  horometer_initial: number;
  horometer_final: number;
  hours_worked: number;
  hours_fraction: number;
  fuel_level: string;
  oil_level: string;
  coolant_level: string;
  hydraulic_level: string;
  greased: boolean;
  tires_wear: string;
  tires_punctured: boolean;
  tires_bearing_issue: boolean;
  tires_action: string;
  lights_front_left: { status: string; note: string };
  lights_front_right: { status: string; note: string };
  lights_rear_left: { status: string; note: string };
  lights_rear_right: { status: string; note: string };
  reverse_horn: { status: string; note: string };
  hoses_status: string;
  hoses_note: string;
  checklist: Record<string, { checked: boolean; comment: string }>;
  observations: string;
  operator_signature_url?: string;
  supervisor_signature_url?: string;
}

export const generatePreoperationalPDF = async (data: PreoperationalData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = 20;

  // Corporate colors
  const primaryYellow: [number, number, number] = [255, 192, 0]; // #FFC000
  const darkGray: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [245, 245, 245];
  const greenOk: [number, number, number] = [76, 175, 80];
  const yellowWarning: [number, number, number] = [255, 165, 0];
  const redCritical: [number, number, number] = [231, 76, 60];

  // ============= HEADER =============
  // Yellow stripe
  doc.setFillColor(...primaryYellow);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Logo
  try {
    doc.addImage(logoImage, 'PNG', margin, 8, 35, 18);
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE PREOPERACIONAL', pageWidth / 2, 20, { align: 'center' });

  // Company info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Up & Down Lift S.A.S.', pageWidth - margin, 12, { align: 'right' });
  doc.text('NIT: 901.234.567-8', pageWidth - margin, 16, { align: 'right' });
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, pageWidth - margin, 20, { align: 'right' });

  yPosition = 45;

  // ============= INFORMACIÓN GENERAL =============
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('📋 INFORMACIÓN GENERAL', margin + 3, yPosition + 5);
  yPosition += 12;

  const generalInfo = [
    ['Fecha y Hora:', new Date(data.datetime).toLocaleString('es-CO')],
    ['Proyecto:', data.project.name],
    ['Cliente:', data.project.client_name || 'N/A'],
    ['Ubicación:', data.project.location || 'N/A'],
    ['Máquina:', data.machine.name],
    ['Marca/Modelo:', `${data.machine.brand || 'N/A'} / ${data.machine.model || 'N/A'}`],
    ['Serie:', data.machine.serial_number || 'N/A'],
    ['Operador:', data.user.full_name || data.user.username],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [],
    body: generalInfo,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // ============= HORAS DE TRABAJO =============
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('⏱️ HORAS DE TRABAJO', margin + 3, yPosition + 5);
  yPosition += 12;

  const hoursData = [
    ['Horómetro Inicial:', `${data.horometer_initial || 0} hrs`],
    ['Horas Trabajadas:', `${data.hours_worked || 0}.${data.hours_fraction || 0} hrs`],
    ['Horómetro Final:', `${data.horometer_final || 0} hrs`],
  ];

  doc.autoTable({
    startY: yPosition,
    body: hoursData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // ============= NIVELES DE FLUIDOS =============
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('⛽ NIVELES DE FLUIDOS', margin + 3, yPosition + 5);
  yPosition += 12;

  const getLevelColor = (level: string): [number, number, number] => {
    switch (level?.toLowerCase()) {
      case 'alto': return greenOk;
      case 'medio': return yellowWarning;
      case 'bajo': return redCritical;
      default: return darkGray;
    }
  };

  const fluidsData = [
    ['🛢️ Combustible', data.fuel_level?.toUpperCase() || 'N/A'],
    ['🔧 Aceite Motor', data.oil_level?.toUpperCase() || 'N/A'],
    ['❄️ Refrigerante', data.coolant_level?.toUpperCase() || 'N/A'],
    ['💧 Hidráulico', data.hydraulic_level?.toUpperCase() || 'N/A'],
    ['✅ Engrasado', data.greased ? 'SÍ' : 'NO'],
  ];

  doc.autoTable({
    startY: yPosition,
    body: fluidsData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto', halign: 'center' }
    },
    didParseCell: (data: any) => {
      if (data.column.index === 1 && data.row.index < 4) {
        const level = fluidsData[data.row.index][1];
        doc.setTextColor(...getLevelColor(level));
      }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // ============= ESTADO DE LLANTAS =============
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('🛞 ESTADO DE LLANTAS', margin + 3, yPosition + 5);
  yPosition += 12;

  const tiresData = [
    ['Nivel de Desgaste:', data.tires_wear || 'N/A'],
    ['Pinchadas:', data.tires_punctured ? '❌ SÍ' : '✅ NO'],
    ['Problema en Rodamientos:', data.tires_bearing_issue ? '❌ SÍ' : '✅ NO'],
    ['Acción Requerida:', data.tires_action === 'none' ? 'Ninguna' : data.tires_action === 'repair' ? 'REPARAR' : data.tires_action === 'replace' ? 'REEMPLAZAR' : 'N/A'],
  ];

  doc.autoTable({
    startY: yPosition,
    body: tiresData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // ============= SISTEMA DE LUCES =============
  doc.setFillColor(...lightGray);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('💡 SISTEMA DE LUCES', margin + 3, yPosition + 5);
  yPosition += 12;

  const lightsData = [
    ['🔦 Delantera Izquierda', data.lights_front_left?.status || 'N/A', data.lights_front_left?.note || ''],
    ['🔦 Delantera Derecha', data.lights_front_right?.status || 'N/A', data.lights_front_right?.note || ''],
    ['🔴 Trasera Izquierda', data.lights_rear_left?.status || 'N/A', data.lights_rear_left?.note || ''],
    ['🔴 Trasera Derecha', data.lights_rear_right?.status || 'N/A', data.lights_rear_right?.note || ''],
    ['📢 Pito de Reversa', data.reverse_horn?.status || 'N/A', data.reverse_horn?.note || ''],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Componente', 'Estado', 'Notas']],
    body: lightsData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: primaryYellow, textColor: darkGray, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 'auto' }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // ============= MANGUERAS =============
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(...lightGray);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('🔧 MANGUERAS', margin + 3, yPosition + 5);
  yPosition += 12;

  const hosesData = [
    ['Estado:', data.hoses_status || 'N/A'],
    ['Notas:', data.hoses_note || 'Sin observaciones'],
  ];

  doc.autoTable({
    startY: yPosition,
    body: hosesData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // ============= CHECKLIST =============
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(...lightGray);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('✅ CHECKLIST DE INSPECCIÓN', margin + 3, yPosition + 5);
  yPosition += 12;

  const checklistItems = [
    'temperature_ok',
    'dashboard_alerts',
    'hoses_condition',
    'oil_leaks',
    'ac_working',
    'tire_pressure',
    'track_grease',
    'first_aid_kit',
    'safety_cones',
    'spill_kit',
    'fire_extinguisher'
  ];

  const checklistLabels: Record<string, string> = {
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

  const checklistData = checklistItems.map(key => {
    const item = data.checklist?.[key];
    return [
      item?.checked ? '✅' : '❌',
      checklistLabels[key] || key,
      item?.comment || ''
    ];
  });

  doc.autoTable({
    startY: yPosition,
    head: [['✓', 'Item', 'Comentarios']],
    body: checklistData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: primaryYellow, textColor: darkGray, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 'auto' }
    },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // ============= OBSERVACIONES =============
  if (data.observations) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(...lightGray);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('📝 OBSERVACIONES', margin + 3, yPosition + 5);
    yPosition += 12;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitObservations = doc.splitTextToSize(data.observations, pageWidth - 2 * margin - 10);
    doc.text(splitObservations, margin + 5, yPosition);
    yPosition += splitObservations.length * 5 + 10;
  }

  // ============= FIRMAS =============
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(...lightGray);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('✍️ FIRMAS DIGITALES', margin + 3, yPosition + 5);
  yPosition += 12;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Operador:', margin + 5, yPosition);
  doc.text(data.operator_signature_url ? '✅ Firmado' : '❌ Sin firma', margin + 35, yPosition);
  yPosition += 8;

  doc.text('Supervisor:', margin + 5, yPosition);
  doc.text(data.supervisor_signature_url ? '✅ Firmado' : '❌ Sin firma', margin + 35, yPosition);
  yPosition += 15;

  // ============= FOOTER =============
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Documento confidencial - Up & Down Lift S.A.S.',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  return doc;
};
