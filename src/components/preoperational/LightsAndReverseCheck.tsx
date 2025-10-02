import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, AlertTriangle } from "lucide-react";

type LightStatus = "bueno" | "foco_danado" | "farola_danada" | "no_funciona";

interface LightCheck {
  status: LightStatus;
  note: string;
}

interface LightsAndReverseCheckProps {
  frontLeft: LightCheck;
  frontRight: LightCheck;
  rearLeft: LightCheck;
  rearRight: LightCheck;
  reverseHorn: LightCheck;
  onFrontLeftChange: (value: LightCheck) => void;
  onFrontRightChange: (value: LightCheck) => void;
  onRearLeftChange: (value: LightCheck) => void;
  onRearRightChange: (value: LightCheck) => void;
  onReverseHornChange: (value: LightCheck) => void;
}

const STATUS_OPTIONS = [
  { value: "bueno", label: "✅ Bueno" },
  { value: "foco_danado", label: "💡 Foco dañado" },
  { value: "farola_danada", label: "🔦 Farola dañada" },
  { value: "no_funciona", label: "❌ No funciona" }
];

function LightCheckItem({ 
  title, 
  value, 
  onChange, 
  icon 
}: { 
  title: string; 
  value: LightCheck; 
  onChange: (value: LightCheck) => void;
  icon?: React.ReactNode;
}) {
  const needsNote = value.status !== "bueno";

  return (
    <div className="space-y-2 p-3 md:p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        {icon}
        <Label className="text-sm md:text-base font-medium">{title}</Label>
      </div>
      
      <Select
        value={value.status}
        onValueChange={(status) => onChange({ ...value, status: status as LightStatus })}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccione estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {needsNote && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Descripción del problema
          </Label>
          <Textarea
            placeholder="Describa el problema detectado..."
            value={value.note}
            onChange={(e) => onChange({ ...value, note: e.target.value })}
            className="text-sm min-h-[60px]"
          />
        </div>
      )}
    </div>
  );
}

export function LightsAndReverseCheck({
  frontLeft,
  frontRight,
  rearLeft,
  rearRight,
  reverseHorn,
  onFrontLeftChange,
  onFrontRightChange,
  onRearLeftChange,
  onRearRightChange,
  onReverseHornChange
}: LightsAndReverseCheckProps) {
  return (
    <Card>
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Lightbulb className="h-5 w-5" />
          Luces y Pito de Reversa
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Revise cada luz y el pito de reversa individualmente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6">
        <LightCheckItem
          title="Luz Delantera Izquierda"
          value={frontLeft}
          onChange={onFrontLeftChange}
          icon={<Lightbulb className="h-4 w-4 text-yellow-500" />}
        />
        
        <LightCheckItem
          title="Luz Delantera Derecha"
          value={frontRight}
          onChange={onFrontRightChange}
          icon={<Lightbulb className="h-4 w-4 text-yellow-500" />}
        />
        
        <LightCheckItem
          title="Luz Trasera Izquierda"
          value={rearLeft}
          onChange={onRearLeftChange}
          icon={<Lightbulb className="h-4 w-4 text-red-500" />}
        />
        
        <LightCheckItem
          title="Luz Trasera Derecha"
          value={rearRight}
          onChange={onRearRightChange}
          icon={<Lightbulb className="h-4 w-4 text-red-500" />}
        />
        
        <LightCheckItem
          title="Pito de Reversa"
          value={reverseHorn}
          onChange={onReverseHornChange}
          icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
        />
      </CardContent>
    </Card>
  );
}
