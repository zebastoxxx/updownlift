-- Fix security warnings by setting search_path for existing functions
ALTER FUNCTION public.update_machine_after_preop() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;