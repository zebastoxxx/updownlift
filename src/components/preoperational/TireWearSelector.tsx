import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TireWearSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const WEAR_LEVELS = [
  { value: "alto", label: "Alto", color: "bg-green-100 text-green-800 border-green-300", description: "Buen estado" },
  { value: "medio", label: "Medio", color: "bg-yellow-100 text-yellow-800 border-yellow-300", description: "Desgaste normal" },
  { value: "bajo", label: "Bajo", color: "bg-red-100 text-red-800 border-red-300", description: "Requiere atención" }
];

export function TireWearSelector({ value, onChange }: TireWearSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Desgaste de Llantas</Label>
      <div className="grid grid-cols-3 gap-2">
        {WEAR_LEVELS.map((level) => (
          <Button
            key={level.value}
            variant="outline"
            size="sm"
            onClick={() => onChange(level.value)}
            className={cn(
              "h-auto p-3 transition-all duration-200 flex flex-col",
              value === level.value 
                ? level.color + " border-2" 
                : "hover:bg-accent"
            )}
          >
            <span className="font-medium">{level.label}</span>
            <span className="text-xs opacity-80">{level.description}</span>
          </Button>
        ))}
      </div>
      
      {value === "bajo" && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          ⚠️ Desgaste alto detectado - considere reemplazo
        </p>
      )}
    </div>
  );
}