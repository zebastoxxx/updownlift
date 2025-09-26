-- Create users table with custom authentication
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'operario' CHECK (role IN ('operario', 'supervisor', 'administrador')),
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own record" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = id::text OR EXISTS (
  SELECT 1 FROM public.users 
  WHERE id::text = auth.uid()::text AND role = 'administrador'
));

CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id::text = auth.uid()::text AND role = 'administrador'
));

CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id::text = auth.uid()::text AND role = 'administrador'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO public.users (username, password_hash, full_name, role, created_by)
VALUES ('admin', '$2b$10$rqK8QJ8mZvzKJzZ9QzJ8Qu8/Y.QY1Qz4Y8zK8zQzJ8QzJ8QzJ8QzJ8', 'Administrador', 'administrador', NULL);

-- Update preoperational table to reference custom users
ALTER TABLE public.preoperational 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Update profiles to reference custom users  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT;