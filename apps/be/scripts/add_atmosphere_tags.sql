BEGIN;

-- =========================================================
-- Add atmosphere_tags field to cafe_visits table
-- =========================================================
-- This migration adds the atmosphere_tags field to store cafe atmosphere tags
-- as a JSONB array for efficient querying and filtering

ALTER TABLE public.cafe_visits
ADD COLUMN IF NOT EXISTS atmosphere_tags JSONB DEFAULT '[]'::jsonb;

-- Add index for efficient filtering by atmosphere tags
CREATE INDEX IF NOT EXISTS idx_cafe_visits_atmosphere_tags ON public.cafe_visits USING GIN (atmosphere_tags);

-- Add comment for documentation
COMMENT ON COLUMN public.cafe_visits.atmosphere_tags IS 'Array of cafe atmosphere tags (e.g., ["cozy", "modern", "minimalist"]) stored as JSONB';

COMMIT;

