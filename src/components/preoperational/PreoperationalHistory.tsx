import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, createSortableHeader } from "@/components/ui/data-table";
import { AdaptiveDataView } from "@/components/ui/adaptive-data-view";
import { PreoperationalMobileCard } from "@/components/preoperational/PreoperationalMobileCard";
import { PreoperationalPhotos } from "@/components/preoperational/PreoperationalPhotos";
import { PreoperationalViewModal } from "@/components/preoperational/PreoperationalViewModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  hours_fraction: number;
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
  lights_front_left: any;
  lights_front_right: any;
  lights_rear_left: any;
  lights_rear_right: any;
  reverse_horn: any;
  greased: boolean;
  checklist: any;
  observations: string;
  sync_status: string;
  operator_signature_url?: string;
  supervisor_signature_url?: string;
  operator_signature_timestamp?: string;
  supervisor_signature_timestamp?: string;
  projects?: { name: string; client_name?: string; location?: string } | null;
  machines?: { name: string; brand?: string; model?: string; serial_number?: string } | null;
  project?: any;
  machine?: any;
  user?: any;
  photos?: any[];
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
      
      // First get preoperational records
      const { data: preoperationalData, error: preoperationalError } = await supabase
        .from('preoperational')
        .select('*')
        .order('datetime', { ascending: false });

      if (preoperationalError) throw preoperationalError;

      // Get projects and machines separately to avoid relation issues
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name');

      const { data: machinesData, error: machinesError } = await supabase
        .from('machines')
        .select('id, name');

      if (projectsError) throw projectsError;
      if (machinesError) throw machinesError;

      // Create lookup maps
      const projectsMap = new Map(projectsData?.map(p => [p.id, p.name]) || []);
      const machinesMap = new Map(machinesData?.map(m => [m.id, m.name]) || []);

      // Combine the data
      const enrichedRecords = (preoperationalData || []).map(record => ({
        ...record,
        projects: { name: projectsMap.get(record.project_id) || 'Proyecto desconocido' },
        machines: { name: machinesMap.get(record.machine_id) || 'Máquina desconocida' }
      }));

      setRecords(enrichedRecords);
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
        record.machines?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.observations?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (projectFilter !== "all") {
      filtered = filtered.filter(record => record.projects?.name === projectFilter);
    }

    if (machineFilter !== "all") {
      filtered = filtered.filter(record => record.machines?.name === machineFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(record => 
        record.datetime?.startsWith(dateFilter)
      );
    }

    setFilteredRecords(filtered);
  };

  const handleView = async (record: PreoperationalRecord) => {
    try {
      // Load complete record with all relationships
      const { data: preopData, error: preopError } = await supabase
        .from('preoperational')
        .select('*')
        .eq('id', record.id)
        .single();

      if (preopError) throw preopError;

      // Load project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', preopData.project_id)
        .single();

      if (projectError) throw projectError;

      // Load machine data
      const { data: machineData, error: machineError } = await supabase
        .from('machines')
        .select('*')
        .eq('id', preopData.machine_id)
        .single();

      if (machineError) throw machineError;

      // Load user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('username', preopData.username)
        .single();

      // Load photos
      const { data: photosData } = await supabase
        .from('preoperational_photos')
        .select('*')
        .eq('preoperational_id', record.id);

      // Combine all data
      const fullRecord = {
        ...preopData,
        project: projectData,
        machine: machineData,
        user: userData || { username: preopData.username },
        photos: photosData || [],
        // Keep the old format for compatibility
        projects: { 
          name: projectData.name,
          client_name: projectData.client_name,
          location: projectData.location
        },
        machines: { 
          name: machineData.name,
          brand: machineData.brand,
          model: machineData.model,
          serial_number: machineData.serial_number
        }
      };

      setSelectedRecord(fullRecord);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Error loading full record:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el registro completo",
        variant: "destructive",
      });
    }
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

  const handleDelete = async (record: PreoperationalRecord) => {
    try {
      const { error } = await supabase
        .from('preoperational')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Registro eliminado correctamente",
      });

      loadRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async (records: PreoperationalRecord[]) => {
    try {
      const recordIds = records.map(record => record.id);
      
      const { error } = await supabase
        .from('preoperational')
        .delete()
        .in('id', recordIds);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `${records.length} registros eliminados correctamente`,
      });

      loadRecords();
    } catch (error) {
      console.error('Error deleting records:', error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar los registros",
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
      id: "project",
      header: "Proyecto",
      cell: ({ row }: any) => row.original.projects?.name || "Sin proyecto",
    },
    {
      id: "machine",
      header: "Máquina", 
      cell: ({ row }: any) => row.original.machines?.name || "Sin máquina",
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
      header: "Estado de Sincronización",
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          {getStatusBadge(row.original.sync_status)}
          <span className="text-xs text-muted-foreground">
            {row.original.sync_status === 'synced' && 'Sincronizado con sistema'}
            {row.original.sync_status === 'pending' && 'Pendiente de sincronización'}
            {row.original.sync_status === 'error' && 'Error en sincronización'}
          </span>
        </div>
      ),
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

  const uniqueProjects = Array.from(new Set(records.map(r => r.projects?.name).filter(Boolean)));
  const uniqueMachines = Array.from(new Set(records.map(r => r.machines?.name).filter(Boolean)));

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

          <AdaptiveDataView
            columns={columns}
            data={filteredRecords}
            searchKey="username"
            searchPlaceholder="Buscar registros..."
            onView={handleView}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            enableMultiSelect={true}
            mobileCardComponent={(record) => (
              <PreoperationalMobileCard
                record={record}
                onView={handleView}
                onEdit={handleEdit}
              />
            )}
            emptyMessage="No se encontraron registros preoperacionales"
            loading={loading}
          />
        </CardContent>
      </Card>

      {selectedRecord && (
        <PreoperationalViewModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          record={selectedRecord}
        />
      )}
    </div>
  );
}