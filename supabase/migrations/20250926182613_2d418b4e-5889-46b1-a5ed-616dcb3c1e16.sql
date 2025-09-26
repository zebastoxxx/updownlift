-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Colombia',
  contact_person TEXT,
  tax_id TEXT,
  status TEXT CHECK (status IN ('activo', 'inactivo', 'prospecto')) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_clients junction table (many-to-many)
CREATE TABLE public.project_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, client_id)
);

-- Create client_machines junction table (many-to-many)
CREATE TABLE public.client_machines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, machine_id)
);

-- Update projects table with additional location fields
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Colombia';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS address TEXT;

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_machines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Clients are viewable by authenticated users" 
ON public.clients FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert clients" 
ON public.clients FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
ON public.clients FOR UPDATE TO authenticated 
USING (true);

-- RLS Policies for project_clients
CREATE POLICY "Project clients are viewable by authenticated users" 
ON public.project_clients FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage project clients" 
ON public.project_clients FOR ALL TO authenticated 
USING (true);

-- RLS Policies for client_machines
CREATE POLICY "Client machines are viewable by authenticated users" 
ON public.client_machines FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can manage client machines" 
ON public.client_machines FOR ALL TO authenticated 
USING (true);

-- Create trigger for timestamp updates
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample clients
INSERT INTO public.clients (name, email, phone, address, city, country, contact_person, status) VALUES
('Inmobiliaria XYZ', 'contacto@inmobiliariaxyz.com', '+57 1 234-5678', 'Carrera 15 #85-32', 'Bogotá', 'Colombia', 'Carlos Mendoza', 'activo'),
('Alcaldía Municipal', 'proyectos@alcaldia.gov.co', '+57 4 567-8901', 'Calle 50 #46-36', 'Medellín', 'Colombia', 'Ana García', 'activo'),
('Inversiones ABC', 'gerencia@inversionesabc.com', '+57 2 345-6789', 'Avenida 5N #23-45', 'Cali', 'Colombia', 'Luis Rodríguez', 'activo'),
('Constructora del Valle', 'info@constructoravalle.com', '+57 2 876-5432', 'Carrera 100 #15-20', 'Cali', 'Colombia', 'María Fernández', 'activo');

-- Link clients to existing projects
INSERT INTO public.project_clients (project_id, client_id) VALUES
((SELECT id FROM public.projects WHERE name = 'Construcción Torre Central'), (SELECT id FROM public.clients WHERE name = 'Inmobiliaria XYZ')),
((SELECT id FROM public.projects WHERE name = 'Pavimentación Vía Norte'), (SELECT id FROM public.clients WHERE name = 'Alcaldía Municipal')),
((SELECT id FROM public.projects WHERE name = 'Centro Comercial Plaza'), (SELECT id FROM public.clients WHERE name = 'Inversiones ABC'));

-- Link clients to machines (sample assignments)
INSERT INTO public.client_machines (client_id, machine_id) VALUES
((SELECT id FROM public.clients WHERE name = 'Inmobiliaria XYZ'), (SELECT id FROM public.machines WHERE name = 'Excavadora CAT-001')),
((SELECT id FROM public.clients WHERE name = 'Alcaldía Municipal'), (SELECT id FROM public.machines WHERE name = 'Grúa Liebherr-001')),
((SELECT id FROM public.clients WHERE name = 'Inversiones ABC'), (SELECT id FROM public.machines WHERE name = 'Retroexcavadora JCB-001')),
((SELECT id FROM public.clients WHERE name = 'Constructora del Valle'), (SELECT id FROM public.machines WHERE name = 'Excavadora CAT-001'));