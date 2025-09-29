-- Create user table preferences table to store column configurations
CREATE TABLE public.user_table_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, table_name)
);

-- Enable RLS
ALTER TABLE public.user_table_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_table_preferences 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own preferences" 
ON public.user_table_preferences 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own preferences" 
ON public.user_table_preferences 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own preferences" 
ON public.user_table_preferences 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_table_preferences_updated_at
BEFORE UPDATE ON public.user_table_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();