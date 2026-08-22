-- Add trending and statistics columns to cafes table
-- Run this in Supabase SQL Editor

-- Add trending columns
ALTER TABLE public.cafes 
ADD COLUMN IF NOT EXISTS view_count_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count_14d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visit_count_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visit_count_14d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trending_score DECIMAL(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS trending_rank INTEGER,
ADD COLUMN IF NOT EXISTS trending_updated_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cafes_trending_score 
  ON public.cafes(trending_score DESC);

CREATE INDEX IF NOT EXISTS idx_cafes_trending_rank 
  ON public.cafes(trending_rank ASC);

-- Drop cafe_views if it exists as a VIEW (to recreate as TABLE)
DROP VIEW IF EXISTS public.cafe_views CASCADE;

-- Create cafe_views as TABLE (not VIEW)
CREATE TABLE IF NOT EXISTS public.cafe_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cafe_id UUID REFERENCES public.cafes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for cafe_views (only works on TABLE, not VIEW)
CREATE INDEX IF NOT EXISTS idx_cafe_views_cafe_id 
  ON public.cafe_views(cafe_id);

CREATE INDEX IF NOT EXISTS idx_cafe_views_user_id 
  ON public.cafe_views(user_id);

CREATE INDEX IF NOT EXISTS idx_cafe_views_viewed_at 
  ON public.cafe_views(viewed_at DESC);

-- Update existing cafes with default values
UPDATE public.cafes 
SET 
  view_count_total = COALESCE(view_count_total, 0),
  view_count_14d = COALESCE(view_count_14d, 0),
  visit_count_total = COALESCE(visit_count_total, 0),
  visit_count_14d = COALESCE(visit_count_14d, 0),
  trending_score = COALESCE(trending_score, 0.0)
WHERE view_count_total IS NULL 
   OR view_count_14d IS NULL 
   OR visit_count_total IS NULL 
   OR visit_count_14d IS NULL 
   OR trending_score IS NULL;

-- Success message
SELECT 'Trending columns added successfully!' AS message;

