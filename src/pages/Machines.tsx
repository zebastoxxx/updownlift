import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, createSortableHeader } from "@/components/ui/data-table";
import { Search, Plus, Filter, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "@/hooks/use-toast";
import { MachineForm } from "@/components/machines/MachineForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Machine {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  status: string;
  location?: string;
  current_hours?: number;
  next_preventive_hours?: number;
  last_preop_date?: string;
  created_at: string;
}

export default function Machines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las máquinas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsFormOpen(true);
  };

  const handleDelete = async (machine: Machine) => {
    try {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', machine.id);

      if (error) throw error;
      
      setMachines(prev => prev.filter(m => m.id !== machine.id));
      toast({
        title: "Éxito",
        description: "Máquina eliminada correctamente"
      });
    } catch (error) {
      console.error('Error deleting machine:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la máquina",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async (selectedMachines: Machine[]) => {
    try {
      const ids = selectedMachines.map(m => m.id);
      const { error } = await supabase
        .from('machines')
        .delete()
        .in('id', ids);

      if (error) throw error;
      
      setMachines(prev => prev.filter(m => !ids.includes(m.id)));
      toast({
        title: "Éxito",
        description: `${selectedMachines.length} máquinas eliminadas correctamente`
      });
    } catch (error) {
      console.error('Error bulk deleting machines:', error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar las máquinas seleccionadas",
        variant: "destructive"
      });
    }
  };

  const handleMachineCreated = () => {
    fetchMachines();
    setIsFormOpen(false);
    setSelectedMachine(null);
  };

  const statusCounts = machines.reduce((acc, machine) => {
    acc[machine.status] = (acc[machine.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || machine.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'operativo': { label: 'Operativo', variant: 'default' as const },
      'mantenimiento': { label: 'Mantenimiento', variant: 'destructive' as const },
      'fuera_de_servicio': { label: 'Fuera de Servicio', variant: 'outline' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: ColumnDef<Machine>[] = [
    {
      accessorKey: "name",
      header: createSortableHeader("Nombre"),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "model",
      header: "Modelo",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("model") || "-"}</div>
      ),
    },
    {
      accessorKey: "brand",
      header: "Marca",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("brand") || "-"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue("location") || "-"}</div>
      ),
    },
    {
      accessorKey: "current_hours",
      header: createSortableHeader("Horómetro"),
      cell: ({ row }) => {
        const hours = row.getValue("current_hours") as number;
        return <div className="text-sm">{hours ? `${hours}h` : "-"}</div>;
      },
    },
    {
      accessorKey: "last_preop_date",
      header: createSortableHeader("Último Preoperacional"),
      cell: ({ row }) => {
        const date = row.getValue("last_preop_date") as string;
        return (
          <div className="text-sm">
            {date ? new Date(date).toLocaleDateString('es-ES') : "No registrado"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente la máquina de la base de datos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(row.original)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Máquinas</h1>
          <p className="text-muted-foreground">
            Administra y monitorea toda tu flota de equipos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Máquina
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, modelo, marca o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avanzados
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Todas ({machines.length})
        </Button>
        <Button
          variant={statusFilter === "operativo" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("operativo")}
        >
          Operativas ({statusCounts.operativo || 0})
        </Button>
        <Button
          variant={statusFilter === "mantenimiento" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("mantenimiento")}
        >
          Mantenimiento ({statusCounts.mantenimiento || 0})
        </Button>
        <Button
          variant={statusFilter === "fuera_de_servicio" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("fuera_de_servicio")}
        >
          Fuera de Servicio ({statusCounts.fuera_de_servicio || 0})
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">Cargando máquinas...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredMachines}
              searchKey="name"
              searchPlaceholder="Buscar máquinas..."
              onBulkDelete={handleBulkDelete}
            />
          )}
        </CardContent>
      </Card>

      <MachineForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedMachine(null);
        }}
        onMachineCreated={handleMachineCreated}
        machine={selectedMachine}
      />
    </div>
  );
}