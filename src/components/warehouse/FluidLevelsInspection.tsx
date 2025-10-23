import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Droplets, Fuel, Battery, Activity } from "lucide-react";

interface FluidLevelsInspectionProps {
  fuelLevel: string;
  oilLevel: string;
  coolantLevel: string;
  hydraulicLevel: string;
  onFuelChange: (value: string) => void;
  onOilChange: (value: string) => void;
  onCoolantChange: (value: string) => void;
  onHydraulicChange: (value: string) => void;
}

const FUEL_LEVELS = [
  { value: "lleno", label: "Lleno", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "3/4", label: "3/4", color: "bg-lime-100 text-lime-800 border-lime-300" },
  { value: "1/2", label: "1/2", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "1/4", label: "1/4", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { value: "vacio", label: "Vacío", color: "bg-red-100 text-red-800 border-red-300" }
];

const OIL_LEVELS = [
  { value: "lleno", label: "Lleno", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "3/4", label: "3/4", color: "bg-lime-100 text-lime-800 border-lime-300" },
  { value: "1/2", label: "1/2", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "1/4", label: "1/4", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { value: "bajo", label: "Bajo", color: "bg-red-100 text-red-800 border-red-300" }
];

const SIMPLE_LEVELS = [
  { value: "lleno", label: "Lleno", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "medio", label: "Medio", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { value: "bajo", label: "Bajo", color: "bg-red-100 text-red-800 border-red-300" }
];

export function FluidLevelsInspection({
  fuelLevel,
  oilLevel,
  coolantLevel,
  hydraulicLevel,
  onFuelChange,
  onOilChange,
  onCoolantChange,
  onHydraulicChange
}: FluidLevelsInspectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Niveles de Fluidos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Combustible */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Nivel de Combustible
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {FUEL_LEVELS.map((level) => (
              <Button
                key={level.value}
                variant="outline"
                size="sm"
                onClick={() => onFuelChange(level.value)}
                className={cn(
                  "h-10 transition-all",
                  fuelLevel === level.value ? level.color + " border-2" : "hover:bg-accent"
                )}
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Aceite */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Nivel de Aceite
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {OIL_LEVELS.map((level) => (
              <Button
                key={level.value}
                variant="outline"
                size="sm"
                onClick={() => onOilChange(level.value)}
                className={cn(
                  "h-10 transition-all",
                  oilLevel === level.value ? level.color + " border-2" : "hover:bg-accent"
                )}
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Refrigerante */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Nivel de Refrigerante
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {SIMPLE_LEVELS.map((level) => (
              <Button
                key={level.value}
                variant="outline"
                size="sm"
                onClick={() => onCoolantChange(level.value)}
                className={cn(
                  "h-10 transition-all",
                  coolantLevel === level.value ? level.color + " border-2" : "hover:bg-accent"
                )}
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Hidráulico */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Nivel Hidráulico
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {SIMPLE_LEVELS.map((level) => (
              <Button
                key={level.value}
                variant="outline"
                size="sm"
                onClick={() => onHydraulicChange(level.value)}
                className={cn(
                  "h-10 transition-all",
                  hydraulicLevel === level.value ? level.color + " border-2" : "hover:bg-accent"
                )}
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
