-- Add website field to clients table
ALTER TABLE public.clients ADD COLUMN website text;

-- Add missing insert policy for project_clients and project_machines  
CREATE POLICY "Authenticated users can insert project clients" 
ON public.project_clients 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert project machines" 
ON public.project_machines 
FOR INSERT 
WITH CHECK (true);

-- Add missing insert/update policies for projects
CREATE POLICY "Authenticated users can insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" 
ON public.projects 
FOR UPDATE 
USING (true);

-- Add missing policies for machines
CREATE POLICY "Authenticated users can insert machines" 
ON public.machines 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update machines" 
ON public.machines 
FOR UPDATE 
USING (true);