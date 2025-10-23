-- Create warehouse_inspections table
CREATE TABLE public.warehouse_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  inspection_type TEXT NOT NULL CHECK (inspection_type IN ('entrada', 'salida')),
  horometer_reading NUMERIC,
  fuel_level TEXT CHECK (fuel_level IN ('lleno', '3/4', '1/2', '1/4', 'vacio')),
  oil_level TEXT CHECK (oil_level IN ('lleno', '3/4', '1/2', '1/4', 'bajo')),
  coolant_level TEXT CHECK (coolant_level IN ('lleno', 'medio', 'bajo')),
  hydraulic_level TEXT CHECK (hydraulic_level IN ('lleno', 'medio', 'bajo')),
  tire_condition TEXT CHECK (tire_condition IN ('excelente', 'bueno', 'regular', 'malo')),
  tire_pressure_ok BOOLEAN DEFAULT true,
  body_condition TEXT CHECK (body_condition IN ('excelente', 'bueno', 'con_rayones', 'con_golpes', 'danado')),
  lights_working BOOLEAN DEFAULT true,
  lights_note TEXT,
  horn_working BOOLEAN DEFAULT true,
  windows_intact BOOLEAN DEFAULT true,
  windows_note TEXT,
  mirrors_intact BOOLEAN DEFAULT true,
  seat_condition TEXT CHECK (seat_condition IN ('excelente', 'bueno', 'regular', 'danado')),
  cabin_cleanliness TEXT CHECK (cabin_cleanliness IN ('limpio', 'regular', 'sucio')),
  leaks_detected BOOLEAN DEFAULT false,
  leaks_location TEXT,
  hoses_condition TEXT CHECK (hoses_condition IN ('bueno', 'desgastado', 'requiere_reparacion')),
  battery_condition TEXT CHECK (battery_condition IN ('excelente', 'bueno', 'bajo', 'requiere_reemplazo')),
  tools_complete BOOLEAN DEFAULT true,
  tools_missing TEXT,
  fire_extinguisher BOOLEAN DEFAULT true,
  first_aid_kit BOOLEAN DEFAULT true,
  safety_cones BOOLEAN DEFAULT true,
  reflective_triangles BOOLEAN DEFAULT true,
  documents_complete BOOLEAN DEFAULT true,
  documents_missing TEXT,
  overall_condition TEXT NOT NULL CHECK (overall_condition IN ('excelente', 'bueno', 'aceptable', 'requiere_atencion', 'no_apto')),
  observations TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,
  photos_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warehouse_inspection_photos table
CREATE TABLE public.warehouse_inspection_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_inspection_id UUID NOT NULL REFERENCES public.warehouse_inspections(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('general', 'damage', 'tire', 'cabin', 'engine', 'body', 'front', 'rear', 'left', 'right')),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warehouse_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_inspection_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for warehouse_inspections
CREATE POLICY "Authenticated users can view warehouse inspections"
ON public.warehouse_inspections
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create warehouse inspections"
ON public.warehouse_inspections
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update warehouse inspections"
ON public.warehouse_inspections
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete warehouse inspections"
ON public.warehouse_inspections
FOR DELETE
USING (is_admin(auth.uid()));

-- Create policies for warehouse_inspection_photos
CREATE POLICY "Authenticated users can view warehouse inspection photos"
ON public.warehouse_inspection_photos
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create warehouse inspection photos"
ON public.warehouse_inspection_photos
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_warehouse_inspections_updated_at
BEFORE UPDATE ON public.warehouse_inspections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_warehouse_inspections_machine_id ON public.warehouse_inspections(machine_id);
CREATE INDEX idx_warehouse_inspections_datetime ON public.warehouse_inspections(datetime DESC);
CREATE INDEX idx_warehouse_inspections_type ON public.warehouse_inspections(inspection_type);
CREATE INDEX idx_warehouse_inspection_photos_inspection_id ON public.warehouse_inspection_photos(warehouse_inspection_id);