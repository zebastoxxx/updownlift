import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Armchair, Sparkles, Shield, Wrench, FileText, Droplet, Battery } from "lucide-react";

interface CabinAndSafetyInspectionProps {
  seatCondition: string;
  cabinCleanliness: string;
  leaksDetected: boolean;
  leaksLocation: string;
  hosesCondition: string;
  batteryCondition: string;
  toolsComplete: boolean;
  toolsMissing: string;
  fireExtinguisher: boolean;
  firstAidKit: boolean;
  safetyCones: boolean;
  reflectiveTriangles: boolean;
  documentsComplete: boolean;
  documentsMissing: string;
  onSeatConditionChange: (value: string) => void;
  onCabinCleanlinessChange: (value: string) => void;
  onLeaksDetectedChange: (checked: boolean) => void;
  onLeaksLocationChange: (value: string) => void;
  onHosesConditionChange: (value: string) => void;
  onBatteryConditionChange: (value: string) => void;
  onToolsCompleteChange: (checked: boolean) => void;
  onToolsMissingChange: (value: string) => void;
  onFireExtinguisherChange: (checked: boolean) => void;
  onFirstAidKitChange: (checked: boolean) => void;
  onSafetyConesChange: (checked: boolean) => void;
  onReflectiveTrianglesChange: (checked: boolean) => void;
  onDocumentsCompleteChange: (checked: boolean) => void;
  onDocumentsMissingChange: (value: string) => void;
}

const SEAT_CONDITIONS = [
  { value: "excelente", label: "Excelente", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "bueno", label: "Bueno", color: "bg-lime-100 text-lime-800 border-lime-300" },
  { value: "regular", label: "Regular", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "danado", label: "Dañado", color: "bg-red-100 text-red-800 border-red-300" }
];

const CLEANLINESS_LEVELS = [
  { value: "limpio", label: "Limpio", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "regular", label: "Regular", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "sucio", label: "Sucio", color: "bg-red-100 text-red-800 border-red-300" }
];

const HOSES_CONDITIONS = [
  { value: "bueno", label: "Bueno", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "desgastado", label: "Desgastado", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "requiere_reparacion", label: "Requiere Reparación", color: "bg-red-100 text-red-800 border-red-300" }
];

const BATTERY_CONDITIONS = [
  { value: "excelente", label: "Excelente", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "bueno", label: "Bueno", color: "bg-lime-100 text-lime-800 border-lime-300" },
  { value: "bajo", label: "Bajo", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "requiere_reemplazo", label: "Requiere Reemplazo", color: "bg-red-100 text-red-800 border-red-300" }
];

export function CabinAndSafetyInspection(props: CabinAndSafetyInspectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Armchair className="h-5 w-5" />
            Condición de Cabina
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Estado del Asiento</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SEAT_CONDITIONS.map((condition) => (
                <Button
                  key={condition.value}
                  variant="outline"
                  size="sm"
                  onClick={() => props.onSeatConditionChange(condition.value)}
                  className={cn(
                    "h-10 transition-all",
                    props.seatCondition === condition.value 
                      ? condition.color + " border-2" 
                      : "hover:bg-accent"
                  )}
                >
                  {condition.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Limpieza de Cabina
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {CLEANLINESS_LEVELS.map((level) => (
                <Button
                  key={level.value}
                  variant="outline"
                  size="sm"
                  onClick={() => props.onCabinCleanlinessChange(level.value)}
                  className={cn(
                    "h-10 transition-all",
                    props.cabinCleanliness === level.value 
                      ? level.color + " border-2" 
                      : "hover:bg-accent"
                  )}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Fugas y Mangueras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="leaks"
              checked={props.leaksDetected}
              onCheckedChange={props.onLeaksDetectedChange}
            />
            <Label htmlFor="leaks" className="cursor-pointer">
              Se detectaron fugas
            </Label>
          </div>

          {props.leaksDetected && (
            <Textarea
              placeholder="Especificar ubicación de las fugas..."
              value={props.leaksLocation}
              onChange={(e) => props.onLeaksLocationChange(e.target.value)}
              rows={2}
            />
          )}

          <div className="space-y-2">
            <Label>Estado de Mangueras</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {HOSES_CONDITIONS.map((condition) => (
                <Button
                  key={condition.value}
                  variant="outline"
                  size="sm"
                  onClick={() => props.onHosesConditionChange(condition.value)}
                  className={cn(
                    "h-10 transition-all",
                    props.hosesCondition === condition.value 
                      ? condition.color + " border-2" 
                      : "hover:bg-accent"
                  )}
                >
                  {condition.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Battery className="h-5 w-5" />
            Estado de Batería
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {BATTERY_CONDITIONS.map((condition) => (
              <Button
                key={condition.value}
                variant="outline"
                size="sm"
                onClick={() => props.onBatteryConditionChange(condition.value)}
                className={cn(
                  "h-10 transition-all",
                  props.batteryCondition === condition.value 
                    ? condition.color + " border-2" 
                    : "hover:bg-accent"
                )}
              >
                {condition.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Equipos de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fire-extinguisher"
              checked={props.fireExtinguisher}
              onCheckedChange={props.onFireExtinguisherChange}
            />
            <Label htmlFor="fire-extinguisher" className="cursor-pointer">
              Extintor presente y vigente
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="first-aid"
              checked={props.firstAidKit}
              onCheckedChange={props.onFirstAidKitChange}
            />
            <Label htmlFor="first-aid" className="cursor-pointer">
              Botiquín de primeros auxilios
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="cones"
              checked={props.safetyCones}
              onCheckedChange={props.onSafetyConesChange}
            />
            <Label htmlFor="cones" className="cursor-pointer">
              Conos de seguridad
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="triangles"
              checked={props.reflectiveTriangles}
              onCheckedChange={props.onReflectiveTrianglesChange}
            />
            <Label htmlFor="triangles" className="cursor-pointer">
              Triángulos reflectivos
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Herramientas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tools"
              checked={props.toolsComplete}
              onCheckedChange={props.onToolsCompleteChange}
            />
            <Label htmlFor="tools" className="cursor-pointer">
              Kit de herramientas completo
            </Label>
          </div>

          {!props.toolsComplete && (
            <Textarea
              placeholder="Especificar herramientas faltantes..."
              value={props.toolsMissing}
              onChange={(e) => props.onToolsMissingChange(e.target.value)}
              rows={2}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="documents"
              checked={props.documentsComplete}
              onCheckedChange={props.onDocumentsCompleteChange}
            />
            <Label htmlFor="documents" className="cursor-pointer">
              Documentación completa (SOAT, póliza, revisión técnica)
            </Label>
          </div>

          {!props.documentsComplete && (
            <Textarea
              placeholder="Especificar documentos faltantes..."
              value={props.documentsMissing}
              onChange={(e) => props.onDocumentsMissingChange(e.target.value)}
              rows={2}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
