
-- Users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'operario' CHECK (role IN ('operario', 'supervisor', 'administrador')),
  status text NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tax_id text,
  contact_person text,
  email text,
  phone text,
  website text,
  address text,
  city text,
  country text NOT NULL DEFAULT 'Colombia',
  status text NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Machines table
CREATE TABLE public.machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  model text,
  serial_number text,
  location text,
  status text NOT NULL DEFAULT 'operativo' CHECK (status IN ('operativo', 'mantenimiento', 'fuera_de_servicio')),
  current_hours numeric DEFAULT 0,
  next_certification_date date,
  last_corrective_maintenance_date date,
  last_preventive_maintenance_date date,
  next_preventive_hours numeric,
  last_preop_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text,
  city text,
  country text DEFAULT 'Colombia',
  address text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planificacion' CHECK (status IN ('planificacion', 'activo', 'pausado', 'completado')),
  client_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Project-Clients junction table
CREATE TABLE public.project_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, client_id)
);

-- Project-Machines junction table
CREATE TABLE public.project_machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  machine_id uuid NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, machine_id)
);

-- Preoperational table
CREATE TABLE public.preoperational (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES public.machines(id),
  project_id uuid NOT NULL REFERENCES public.projects(id),
  user_id uuid,
  username text,
  datetime timestamptz NOT NULL DEFAULT now(),
  horometer_initial numeric DEFAULT 0,
  hours_worked numeric DEFAULT 0,
  hours_fraction numeric DEFAULT 0,
  horometer_final numeric DEFAULT 0,
  fuel_level text,
  oil_level text,
  coolant_level text,
  hydraulic_level text,
  greased boolean DEFAULT false,
  tires_wear text,
  tires_punctured boolean DEFAULT false,
  tires_bearing_issue boolean DEFAULT false,
  tires_action text DEFAULT 'none',
  lights_status text DEFAULT 'bueno',
  lights_note text,
  lights_front_left jsonb,
  lights_front_right jsonb,
  lights_rear_left jsonb,
  lights_rear_right jsonb,
  reverse_horn jsonb,
  hoses_status text DEFAULT 'bueno',
  hoses_note text,
  observations text,
  checklist jsonb,
  sync_status text DEFAULT 'synced',
  operator_signature_url text,
  operator_signature_timestamp timestamptz,
  supervisor_signature_url text,
  supervisor_signature_timestamp timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Preoperational photos
CREATE TABLE public.preoperational_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preoperational_id uuid NOT NULL REFERENCES public.preoperational(id) ON DELETE CASCADE,
  url text NOT NULL,
  photo_type text DEFAULT 'general',
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Warehouse inspections
CREATE TABLE public.warehouse_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES public.machines(id),
  user_id uuid,
  username text,
  inspection_type text NOT NULL,
  datetime timestamptz NOT NULL DEFAULT now(),
  horometer_reading numeric,
  fuel_level text,
  oil_level text,
  coolant_level text,
  hydraulic_level text,
  tire_condition text,
  tire_pressure_ok boolean DEFAULT true,
  body_condition text,
  lights_working boolean DEFAULT true,
  lights_note text,
  horn_working boolean DEFAULT true,
  windows_intact boolean DEFAULT true,
  windows_note text,
  mirrors_intact boolean DEFAULT true,
  seat_condition text,
  cabin_cleanliness text,
  leaks_detected boolean DEFAULT false,
  leaks_location text,
  hoses_condition text,
  battery_condition text,
  tools_complete boolean DEFAULT true,
  tools_missing text,
  fire_extinguisher boolean DEFAULT true,
  first_aid_kit boolean DEFAULT true,
  safety_cones boolean DEFAULT true,
  reflective_triangles boolean DEFAULT true,
  documents_complete boolean DEFAULT true,
  documents_missing text,
  overall_condition text,
  observations text,
  checklist jsonb,
  photos_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Warehouse inspection photos
CREATE TABLE public.warehouse_inspection_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_inspection_id uuid NOT NULL REFERENCES public.warehouse_inspections(id) ON DELETE CASCADE,
  url text NOT NULL,
  photo_type text DEFAULT 'general',
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preoperational ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preoperational_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_inspection_photos ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (since auth is custom, not Supabase auth)
CREATE POLICY "Allow all for anon" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.project_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.project_machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.preoperational FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.preoperational_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.warehouse_inspections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.warehouse_inspection_photos FOR ALL USING (true) WITH CHECK (true);
