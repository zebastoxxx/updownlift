-- Fix RLS policies for machines table and add maintenance date fields
-- Update SELECT policy to ensure proper viewing
DROP POLICY IF EXISTS "Machines are viewable by authenticated users" ON public.machines;

CREATE POLICY "Authenticated users can view machines"
ON public.machines
FOR SELECT
USING (true);

-- Update INSERT policy 
DROP POLICY IF EXISTS "Authenticated users can insert machines" ON public.machines;

CREATE POLICY "Authenticated users can insert machines"
ON public.machines
FOR INSERT
WITH CHECK (true);

-- Update UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update machines" ON public.machines;

CREATE POLICY "Authenticated users can update machines"
ON public.machines
FOR UPDATE
USING (true);

-- Add maintenance date fields to machines table
ALTER TABLE public.machines 
ADD COLUMN IF NOT EXISTS last_corrective_maintenance_date date,
ADD COLUMN IF NOT EXISTS last_preventive_maintenance_date date;