-- Fix infinite recursion in users table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;

-- Create security definer function to check user roles without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = user_id LIMIT 1;
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND role = 'administrador'
  );
$$;

-- Create new RLS policies without recursion
CREATE POLICY "Users can view their own record"
ON public.users
FOR SELECT
USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert users"
ON public.users
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update users"
ON public.users
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete users"
ON public.users
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Fix clients RLS policies to allow proper insertion
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
CREATE POLICY "Authenticated users can insert clients"
ON public.clients
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add missing DELETE policy for clients
CREATE POLICY "Authenticated users can delete clients"
ON public.clients
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix machines policies to allow DELETE operations
CREATE POLICY "Authenticated users can delete machines"
ON public.machines
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Fix projects policies to allow DELETE operations  
CREATE POLICY "Authenticated users can delete projects"
ON public.projects
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Remove profiles table since we're consolidating into users table
DROP TABLE IF EXISTS public.profiles CASCADE;