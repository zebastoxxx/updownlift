
CREATE TABLE public.user_table_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  table_name text NOT NULL,
  preferences jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, table_name)
);

ALTER TABLE public.user_table_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON public.user_table_preferences FOR ALL USING (true) WITH CHECK (true);
