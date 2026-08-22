-- Add opening_hours field to cafes table
-- This field stores business hours in JSON format
-- Structure: { "monday": {"open": "09:00", "close": "18:00", "closed": false}, ... }

ALTER TABLE public.cafes 
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT NULL;

-- Add comment to describe the field
COMMENT ON COLUMN public.cafes.opening_hours IS 'Business hours in JSON format. Structure: {"monday": {"open": "HH:MM", "close": "HH:MM", "closed": boolean}, ...}';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_cafes_opening_hours ON public.cafes USING GIN (opening_hours);

