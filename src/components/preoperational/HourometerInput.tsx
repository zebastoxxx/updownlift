import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Minus } from "lucide-react";

interface HourometerInputProps {
  initialHours: number;
  hoursWorked: number;
  hoursFraction: number;
  finalHours: number;
  onInitialChange: (value: number) => void;
  onWorkedChange: (value: number) => void;
  onFractionChange: (value: number) => void;
}

export function HourometerInput({ 
  initialHours, 
  hoursWorked, 
  hoursFraction,
  finalHours, 
  onInitialChange, 
  onWorkedChange,
  onFractionChange 
}: HourometerInputProps) {
  
  const adjustHours = (delta: number) => {
    const newValue = Math.max(0, Math.min(24, hoursWorked + delta));
    onWorkedChange(newValue);
  };

  const formatHours = (hours: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(hours);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horómetro
        </CardTitle>
        <CardDescription>
          Registre las horas inicial y trabajadas para actualizar el horómetro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Initial Hours */}
        <div className="space-y-2">
          <Label htmlFor="initial-hours">Horómetro Inicial</Label>
          <Input
            id="initial-hours"
            type="number"
            step="0.1"
            value={initialHours}
            onChange={(e) => onInitialChange(parseFloat(e.target.value) || 0)}
            className="text-lg font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Horómetro actual de la máquina
          </p>
        </div>

        {/* Hours Worked */}
        <div className="space-y-2">
          <Label>Horas Trabajadas</Label>
          <div className="grid grid-cols-2 gap-4">
            {/* Horas completas */}
            <div className="space-y-2">
              <Label htmlFor="hours-worked" className="text-xs text-muted-foreground">
                Horas completas
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustHours(-1)}
                  disabled={hoursWorked <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <Input
                  id="hours-worked"
                  type="number"
                  min="0"
                  max="24"
                  value={hoursWorked}
                  onChange={(e) => onWorkedChange(Math.min(24, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-mono"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustHours(1)}
                  disabled={hoursWorked >= 24}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Fracción decimal */}
            <div className="space-y-2">
              <Label htmlFor="hours-fraction" className="text-xs text-muted-foreground">
                Fracción (décimas)
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onFractionChange(Math.max(0, hoursFraction - 1))}
                  disabled={hoursFraction <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <Input
                  id="hours-fraction"
                  type="number"
                  min="0"
                  max="9"
                  value={hoursFraction}
                  onChange={(e) => onFractionChange(Math.min(9, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-mono"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onFractionChange(Math.min(9, hoursFraction + 1))}
                  disabled={hoursFraction >= 9}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[4, 8, 10, 12].map(hours => (
              <Button
                key={hours}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onWorkedChange(hours);
                  onFractionChange(0);
                }}
                className={hoursWorked === hours && hoursFraction === 0 ? 'bg-primary text-primary-foreground' : ''}
              >
                {hours}h
              </Button>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Ejemplo: 12 horas + 2 décimas = 12.2h (12h 12min)
          </p>
        </div>

        {/* Final Hours - Calculated */}
        <div className="space-y-2">
          <Label>Horómetro Final (Calculado)</Label>
          <div className="p-3 bg-muted rounded-md">
            <div className="text-2xl font-mono font-semibold text-center">
              {formatHours(finalHours)} h
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Horómetro inicial + horas trabajadas + fracción = {formatHours(initialHours)} + {hoursWorked}.{hoursFraction} = {formatHours(finalHours)}
          </p>
        </div>

        {/* Warning for excessive hours */}
        {hoursWorked > 12 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Más de 12 horas trabajadas. Verifique que sea correcto.
            </p>
          </div>
        )}
        
        {hoursWorked >= 24 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              🚫 No se permiten más de 24 horas trabajadas en un día.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}