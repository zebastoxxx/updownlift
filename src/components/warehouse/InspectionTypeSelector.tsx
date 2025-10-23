import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface InspectionTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}

export function InspectionTypeSelector({ value, onChange }: InspectionTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <Package className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Inspección de Bodega</h2>
        <p className="text-muted-foreground">
          Selecciona el tipo de inspección que deseas realizar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg border-2",
            value === "salida" 
              ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
              : "border-border hover:border-red-300"
          )}
          onClick={() => onChange("salida")}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <ArrowRight className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400">SALIDA</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Máquina sale de bodega hacia cliente
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg border-2",
            value === "entrada" 
              ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
              : "border-border hover:border-green-300"
          )}
          onClick={() => onChange("entrada")}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <ArrowLeft className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400">ENTRADA</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Máquina regresa de cliente a bodega
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
