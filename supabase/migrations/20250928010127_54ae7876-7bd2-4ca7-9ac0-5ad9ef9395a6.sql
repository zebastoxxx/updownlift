-- Fix RLS policies for projects table to work with custom authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Projects are viewable by authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- Create permissive policies that allow all operations
CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update projects" 
ON public.projects 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete projects" 
ON public.projects 
FOR DELETE 
USING (true);

-- Also fix project_clients table policies
DROP POLICY IF EXISTS "Project clients are viewable by authenticated users" ON public.project_clients;
DROP POLICY IF EXISTS "Authenticated users can manage project clients" ON public.project_clients;
DROP POLICY IF EXISTS "Authenticated users can insert project clients" ON public.project_clients;

CREATE POLICY "Anyone can view project clients" 
ON public.project_clients 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert project clients" 
ON public.project_clients 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update project clients" 
ON public.project_clients 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete project clients" 
ON public.project_clients 
FOR DELETE 
USING (true);

-- Also fix project_machines table policies
DROP POLICY IF EXISTS "Machine assignments are viewable by authenticated users" ON public.project_machines;
DROP POLICY IF EXISTS "Authenticated users can insert project machines" ON public.project_machines;

CREATE POLICY "Anyone can view project machines" 
ON public.project_machines 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert project machines" 
ON public.project_machines 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update project machines" 
ON public.project_machines 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete project machines" 
ON public.project_machines 
FOR DELETE 
USING (true);