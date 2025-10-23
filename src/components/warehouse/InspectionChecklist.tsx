import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck } from "lucide-react";

interface ChecklistItem {
  key: string;
  label: string;
  checked: boolean;
  comment?: string;
}

interface InspectionChecklistProps {
  checklist: ChecklistItem[];
  onChange: (updatedChecklist: ChecklistItem[]) => void;
}

const DEFAULT_ITEMS = [
  { key: "body_general", label: "Estado general de la carrocería" },
  { key: "engine_function", label: "Funcionamiento del motor" },
  { key: "noise_level", label: "Nivel de ruido anormal" },
  { key: "hydraulic_system", label: "Sistema hidráulico operativo" },
  { key: "steering", label: "Dirección sin holguras" },
  { key: "brakes", label: "Frenos en buen estado" },
  { key: "electrical_system", label: "Sistema eléctrico funcionando" },
  { key: "cabin_controls", label: "Controles de cabina operativos" },
  { key: "seatbelt", label: "Cinturón de seguridad" },
  { key: "mirrors", label: "Retrovisores ajustables" },
  { key: "wipers", label: "Limpiabrisas funcionando" },
  { key: "horn", label: "Claxon operativo" },
  { key: "cooling_system", label: "Sistema de enfriamiento" },
  { key: "air_filters", label: "Filtros de aire limpios" },
  { key: "belts", label: "Correas en buen estado" }
];

export function InspectionChecklist({ checklist, onChange }: InspectionChecklistProps) {
  const items = checklist.length > 0 ? checklist : DEFAULT_ITEMS.map(item => ({
    ...item,
    checked: false,
    comment: ""
  }));

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const percentage = Math.round((checkedCount / totalCount) * 100);

  const handleCheckChange = (index: number, checked: boolean) => {
    const updated = [...items];
    updated[index] = { ...updated[index], checked };
    onChange(updated);
  };

  const handleCommentChange = (index: number, comment: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], comment };
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Lista de Verificación Operacional
          </CardTitle>
          <span className="text-sm font-medium">
            {checkedCount} / {totalCount} ({percentage}%)
          </span>
        </div>
        <Progress value={percentage} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={item.key} className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id={`check-${item.key}`}
                checked={item.checked}
                onCheckedChange={(checked) => handleCheckChange(index, checked as boolean)}
                className="mt-1"
              />
              <Label 
                htmlFor={`check-${item.key}`} 
                className="cursor-pointer leading-tight flex-1"
              >
                {item.label}
              </Label>
            </div>
            {!item.checked && (
              <Input
                placeholder="Comentario (opcional)"
                value={item.comment || ""}
                onChange={(e) => handleCommentChange(index, e.target.value)}
                className="ml-6"
              />
            )}
          </div>
        ))}

        {percentage === 100 && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md text-center">
            <p className="text-sm text-green-800 dark:text-green-400 font-medium">
              ✓ Lista de verificación completa
            </p>
          </div>
        )}

        {percentage < 100 && percentage > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md text-center">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              Aún faltan {totalCount - checkedCount} items por verificar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
