import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DetailModal } from "@/components/ui/detail-modal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createSortableHeader } from "@/components/ui/data-table";
import { useTablePreferences } from "@/hooks/useTablePreferences";
import { format } from "date-fns";

interface PreoperationalRecord {
  id: string;
  datetime: string;
  project_id: string;
  machine_id: string;
  username: string;
  horometer_initial: number;
  horometer_final: number;
  hours_worked: number;
  oil_level: string;
  hydraulic_level: string;
  coolant_level: string;
  fuel_level: string;
  tires_wear: string;
  tires_punctured: boolean;
  tires_bearing_issue: boolean;
  tires_action: string;
  hoses_status: string;
  hoses_note: string;
  lights_status: string;
  lights_note: string;
  greased: boolean;
  checklist: any;
  observations: string;
  sync_status: string;
  projects?: { name: string } | null;
  machines?: { name: string } | null;
}

export function PreoperationalHistory() {
  const [records, setRecords] = useState<PreoperationalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PreoperationalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PreoperationalRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [machineFilter, setMachineFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  
  const { toast } = useToast();
  const { preferences, updateColumnVisibility } = useTablePreferences('preoperational_history');

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, projectFilter, machineFilter, dateFilter]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('preoperational')
        .select('*')
        .order('datetime', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error loading preoperational records:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros preoperacionales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.machine_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.project_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.observations?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (projectFilter !== "all") {
      filtered = filtered.filter(record => record.project_id === projectFilter);
    }

    if (machineFilter !== "all") {
      filtered = filtered.filter(record => record.machine_id === machineFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(record => 
        record.datetime?.startsWith(dateFilter)
      );
    }

    setFilteredRecords(filtered);
  };

  const handleView = (record: PreoperationalRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleEdit = async (updatedData: Record<string, any>) => {
    if (!selectedRecord) return;

    try {
      const { error } = await supabase
        .from('preoperational')
        .update(updatedData)
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Registro actualizado correctamente",
      });

      loadRecords();
      setDetailModalOpen(false);
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'synced': 'default',
      'pending': 'secondary',
      'error': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'alto': 'default',
      'medio': 'secondary',
      'bajo': 'destructive'
    };
    return <Badge variant={variants[level] || 'outline'}>{level}</Badge>;
  };

  const columns = [
    {
      id: "datetime",
      header: createSortableHeader("Fecha"),
      accessorKey: "datetime",
      cell: ({ row }: any) => format(new Date(row.original.datetime), 'dd/MM/yyyy HH:mm'),
    },
    {
      id: "project_id",
      header: "Proyecto",
      cell: ({ row }: any) => row.original.project_id || "-",
    },
    {
      id: "machine_id",
      header: "Máquina",
      cell: ({ row }: any) => row.original.machine_id || "-",
    },
    {
      id: "username",
      header: "Usuario",
      accessorKey: "username",
    },
    {
      id: "hours_worked",
      header: createSortableHeader("Horas Trabajadas"),
      accessorKey: "hours_worked",
      cell: ({ row }: any) => row.original.hours_worked || "-",
    },
    {
      id: "oil_level",
      header: "Aceite",
      cell: ({ row }: any) => getLevelBadge(row.original.oil_level),
    },
    {
      id: "fuel_level",
      header: "Combustible",
      cell: ({ row }: any) => getLevelBadge(row.original.fuel_level),
    },
    {
      id: "sync_status",
      header: "Estado",
      cell: ({ row }: any) => getStatusBadge(row.original.sync_status),
    },
  ];

  // Field configuration for detail modal
  const detailFields = [
    { key: 'datetime', label: 'Fecha y Hora', type: 'text' as const, format: (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm'), section: 'general' },
    { key: 'username', label: 'Usuario', type: 'text' as const, section: 'general' },
    { key: 'horometer_initial', label: 'Horómetro Inicial', type: 'number' as const, editable: true, section: 'general' },
    { key: 'horometer_final', label: 'Horómetro Final', type: 'number' as const, editable: true, section: 'general' },
    { key: 'hours_worked', label: 'Horas Trabajadas', type: 'number' as const, editable: true, section: 'general' },
    { key: 'oil_level', label: 'Nivel de Aceite', type: 'select' as const, options: [
      { value: 'alto', label: 'Alto' },
      { value: 'medio', label: 'Medio' },
      { value: 'bajo', label: 'Bajo' }
    ], editable: true, section: 'fluidos' },
    { key: 'hydraulic_level', label: 'Nivel Hidráulico', type: 'select' as const, options: [
      { value: 'alto', label: 'Alto' },
      { value: 'medio', label: 'Medio' },
      { value: 'bajo', label: 'Bajo' }
    ], editable: true, section: 'fluidos' },
    { key: 'coolant_level', label: 'Refrigerante', type: 'select' as const, options: [
      { value: 'alto', label: 'Alto' },
      { value: 'medio', label: 'Medio' },
      { value: 'bajo', label: 'Bajo' }
    ], editable: true, section: 'fluidos' },
    { key: 'fuel_level', label: 'Combustible', type: 'select' as const, options: [
      { value: 'alto', label: 'Alto' },
      { value: 'medio', label: 'Medio' },
      { value: 'bajo', label: 'Bajo' }
    ], editable: true, section: 'fluidos' },
    { key: 'tires_wear', label: 'Desgaste de Llantas', type: 'text' as const, editable: true, section: 'llantas' },
    { key: 'tires_punctured', label: 'Llantas Pinchadas', type: 'boolean' as const, editable: true, section: 'llantas' },
    { key: 'tires_bearing_issue', label: 'Problemas en Rodamientos', type: 'boolean' as const, editable: true, section: 'llantas' },
    { key: 'tires_action', label: 'Acción Requerida', type: 'select' as const, options: [
      { value: 'none', label: 'Ninguna' },
      { value: 'repair', label: 'Reparar' },
      { value: 'replace', label: 'Reemplazar' }
    ], editable: true, section: 'llantas' },
    { key: 'hoses_status', label: 'Estado de Mangueras', type: 'select' as const, options: [
      { value: 'bueno', label: 'Bueno' },
      { value: 'requiere_revision', label: 'Requiere Revisión' },
      { value: 'requiere_reparacion', label: 'Requiere Reparación' },
      { value: 'reemplazo', label: 'Reemplazo' }
    ], editable: true, section: 'inspeccion' },
    { key: 'hoses_note', label: 'Notas de Mangueras', type: 'textarea' as const, editable: true, section: 'inspeccion' },
    { key: 'lights_status', label: 'Estado de Luces', type: 'select' as const, options: [
      { value: 'bueno', label: 'Bueno' },
      { value: 'foco_danado', label: 'Foco Dañado' },
      { value: 'farola_partida', label: 'Farola Partida' }
    ], editable: true, section: 'inspeccion' },
    { key: 'lights_note', label: 'Notas de Luces', type: 'textarea' as const, editable: true, section: 'inspeccion' },
    { key: 'greased', label: 'Engrasado', type: 'boolean' as const, editable: true, section: 'mantenimiento' },
    { key: 'observations', label: 'Observaciones', type: 'textarea' as const, editable: true, section: 'mantenimiento' },
  ];

  const uniqueProjects = Array.from(new Set(records.map(r => r.project_id).filter(Boolean)));
  const uniqueMachines = Array.from(new Set(records.map(r => r.machine_id).filter(Boolean)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historial de Preoperacionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Buscar por usuario, máquina, proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-sm"
            />
            
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="sm:max-w-[200px]">
                <SelectValue placeholder="Filtrar por proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {uniqueProjects.map((project) => (
                  <SelectItem key={project} value={project || ''}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={machineFilter} onValueChange={setMachineFilter}>
              <SelectTrigger className="sm:max-w-[200px]">
                <SelectValue placeholder="Filtrar por máquina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las máquinas</SelectItem>
                {uniqueMachines.map((machine) => (
                  <SelectItem key={machine} value={machine || ''}>
                    {machine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="sm:max-w-[200px]"
            />

            <Button variant="outline" className="sm:max-w-[120px]">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={filteredRecords}
            onView={handleView}
            searchPlaceholder="Buscar registros..."
            enableColumnVisibility={true}
          />
        </CardContent>
      </Card>

      {selectedRecord && (
        <DetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          title={`Preoperacional - ${selectedRecord.machine_id || 'Sin máquina'}`}
          data={selectedRecord}
          fields={detailFields}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}