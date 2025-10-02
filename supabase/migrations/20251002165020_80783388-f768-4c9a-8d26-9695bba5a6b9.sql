-- Agregar campos para firmas digitales
ALTER TABLE public.preoperational
  ADD COLUMN IF NOT EXISTS operator_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS operator_signature_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS supervisor_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS supervisor_signature_timestamp TIMESTAMPTZ;

-- Agregar campos para el nuevo sistema de luces detallado
ALTER TABLE public.preoperational
  ADD COLUMN IF NOT EXISTS lights_front_left JSONB DEFAULT '{"status": "bueno", "note": ""}',
  ADD COLUMN IF NOT EXISTS lights_front_right JSONB DEFAULT '{"status": "bueno", "note": ""}',
  ADD COLUMN IF NOT EXISTS lights_rear_left JSONB DEFAULT '{"status": "bueno", "note": ""}',
  ADD COLUMN IF NOT EXISTS lights_rear_right JSONB DEFAULT '{"status": "bueno", "note": ""}',
  ADD COLUMN IF NOT EXISTS reverse_horn JSONB DEFAULT '{"status": "bueno", "note": ""}';

-- Agregar campo para fracción de horas
ALTER TABLE public.preoperational
  ADD COLUMN IF NOT EXISTS hours_fraction NUMERIC(2,1) DEFAULT 0.0;

-- Comentarios para documentación
COMMENT ON COLUMN public.preoperational.operator_signature_url IS 'URL de la firma digital del operador (obligatoria)';
COMMENT ON COLUMN public.preoperational.supervisor_signature_url IS 'URL de la firma digital del supervisor (opcional)';
COMMENT ON COLUMN public.preoperational.lights_front_left IS 'Estado de luz delantera izquierda: {status: bueno|foco_danado|farola_danada|no_funciona, note: string}';
COMMENT ON COLUMN public.preoperational.lights_front_right IS 'Estado de luz delantera derecha: {status: bueno|foco_danado|farola_danada|no_funciona, note: string}';
COMMENT ON COLUMN public.preoperational.lights_rear_left IS 'Estado de luz trasera izquierda: {status: bueno|foco_danado|farola_danada|no_funciona, note: string}';
COMMENT ON COLUMN public.preoperational.lights_rear_right IS 'Estado de luz trasera derecha: {status: bueno|foco_danado|farola_danada|no_funciona, note: string}';
COMMENT ON COLUMN public.preoperational.reverse_horn IS 'Estado de pito de reversa: {status: bueno|foco_danado|farola_danada|no_funciona, note: string}';
COMMENT ON COLUMN public.preoperational.hours_fraction IS 'Fracción decimal de horas trabajadas (0.0 - 0.9)';