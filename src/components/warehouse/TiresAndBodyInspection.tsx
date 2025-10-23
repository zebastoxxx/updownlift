import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Circle, Car, Lightbulb, Volume2, Eye, ScanEye } from "lucide-react";

interface TiresAndBodyInspectionProps {
  tireCondition: string;
  tirePressureOk: boolean;
  bodyCondition: string;
  lightsWorking: boolean;
  lightsNote: string;
  hornWorking: boolean;
  windowsIntact: boolean;
  windowsNote: string;
  mirrorsIntact: boolean;
  onTireConditionChange: (value: string) => void;
  onTirePressureChange: (checked: boolean) => void;
  onBodyConditionChange: (value: string) => void;
  onLightsWorkingChange: (checked: boolean) => void;
  onLightsNoteChange: (value: string) => void;
  onHornWorkingChange: (checked: boolean) => void;
  onWindowsIntactChange: (checked: boolean) => void;
  onWindowsNoteChange: (value: string) => void;
  onMirrorsIntactChange: (checked: boolean) => void;
}

const TIRE_CONDITIONS = [
  { value: "excelente", label: "Excelente", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "bueno", label: "Bueno", color: "bg-lime-100 text-lime-800 border-lime-300" },
  { value: "regular", label: "Regular", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "malo", label: "Malo", color: "bg-red-100 text-red-800 border-red-300" }
];

const BODY_CONDITIONS = [
  { value: "excelente", label: "Excelente", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "bueno", label: "Bueno", color: "bg-lime-100 text-lime-800 border-lime-300" },
  { value: "con_rayones", label: "Con Rayones", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "con_golpes", label: "Con Golpes", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { value: "danado", label: "Dañado", color: "bg-red-100 text-red-800 border-red-300" }
];

export function TiresAndBodyInspection(props: TiresAndBodyInspectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5" />
            Estado de Llantas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Condición de las Llantas</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TIRE_CONDITIONS.map((condition) => (
                <Button
                  key={condition.value}
                  variant="outline"
                  size="sm"
                  onClick={() => props.onTireConditionChange(condition.value)}
                  className={cn(
                    "h-10 transition-all",
                    props.tireCondition === condition.value 
                      ? condition.color + " border-2" 
                      : "hover:bg-accent"
                  )}
                >
                  {condition.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="tire-pressure"
              checked={props.tirePressureOk}
              onCheckedChange={props.onTirePressureChange}
            />
            <Label htmlFor="tire-pressure" className="cursor-pointer">
              Presión de llantas correcta
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Estado de Carrocería
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Condición General</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BODY_CONDITIONS.map((condition) => (
                <Button
                  key={condition.value}
                  variant="outline"
                  size="sm"
                  onClick={() => props.onBodyConditionChange(condition.value)}
                  className={cn(
                    "h-10 transition-all",
                    props.bodyCondition === condition.value 
                      ? condition.color + " border-2" 
                      : "hover:bg-accent"
                  )}
                >
                  {condition.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lights"
                checked={props.lightsWorking}
                onCheckedChange={props.onLightsWorkingChange}
              />
              <Label htmlFor="lights" className="flex items-center gap-2 cursor-pointer">
                <Lightbulb className="h-4 w-4" />
                Luces funcionando correctamente
              </Label>
            </div>

            {!props.lightsWorking && (
              <Input
                placeholder="Especificar problema con las luces..."
                value={props.lightsNote}
                onChange={(e) => props.onLightsNoteChange(e.target.value)}
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="horn"
                checked={props.hornWorking}
                onCheckedChange={props.onHornWorkingChange}
              />
              <Label htmlFor="horn" className="flex items-center gap-2 cursor-pointer">
                <Volume2 className="h-4 w-4" />
                Bocina/Claxon funciona
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="windows"
                checked={props.windowsIntact}
                onCheckedChange={props.onWindowsIntactChange}
              />
              <Label htmlFor="windows" className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                Ventanas y parabrisas intactos
              </Label>
            </div>

            {!props.windowsIntact && (
              <Input
                placeholder="Especificar daño en ventanas..."
                value={props.windowsNote}
                onChange={(e) => props.onWindowsNoteChange(e.target.value)}
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mirrors"
                checked={props.mirrorsIntact}
                onCheckedChange={props.onMirrorsIntactChange}
              />
              <Label htmlFor="mirrors" className="flex items-center gap-2 cursor-pointer">
                <ScanEye className="h-4 w-4" />
                Espejos intactos y ajustables
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
