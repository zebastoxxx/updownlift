-- Fix RLS policies for preoperational table to work with custom authentication
-- Remove existing policies that rely on auth.uid()
DROP POLICY IF EXISTS "Users can view their own preoperational records" ON public.preoperational;
DROP POLICY IF EXISTS "Users can create their own preoperational records" ON public.preoperational;

-- Create new policies that allow authenticated users to manage preoperational records
CREATE POLICY "Authenticated users can view preoperational records" 
ON public.preoperational 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create preoperational records" 
ON public.preoperational 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update preoperational records" 
ON public.preoperational 
FOR UPDATE 
USING (true);

-- Also fix preoperational_photos policies
DROP POLICY IF EXISTS "Photos are viewable by preop owner" ON public.preoperational_photos;
DROP POLICY IF EXISTS "Users can insert photos for their preops" ON public.preoperational_photos;

CREATE POLICY "Authenticated users can view preoperational photos" 
ON public.preoperational_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create preoperational photos" 
ON public.preoperational_photos 
FOR INSERT 
WITH CHECK (true);