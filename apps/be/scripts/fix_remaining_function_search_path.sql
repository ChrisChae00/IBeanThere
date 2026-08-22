-- =========================================================
-- Fix Remaining Function Search Path Warnings
-- =========================================================
-- This fixes the 4 remaining functions without search_path
-- Run in Supabase SQL Editor
-- =========================================================

BEGIN;

-- 1. update_cafe_aggregates
CREATE OR REPLACE FUNCTION public.update_cafe_aggregates(p_cafe_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.cafes
  SET
    view_count_total = (
      SELECT COUNT(*) 
      FROM public.cafe_views 
      WHERE cafe_id = p_cafe_id
    ),
    view_count_14d = (
      SELECT COUNT(*) 
      FROM public.cafe_views 
      WHERE cafe_id = p_cafe_id 
        AND viewed_at > NOW() - INTERVAL '14 days'
    ),
    visit_count_total = (
      SELECT COUNT(*) 
      FROM public.cafe_visits 
      WHERE cafe_id = p_cafe_id 
        AND confirmed = TRUE
    ),
    visit_count_14d = (
      SELECT COUNT(*) 
      FROM public.cafe_visits 
      WHERE cafe_id = p_cafe_id 
        AND confirmed = TRUE
        AND visited_at > NOW() - INTERVAL '14 days'
    )
  WHERE id = p_cafe_id;
END;
$$;

-- 2. calculate_trending_score
CREATE OR REPLACE FUNCTION public.calculate_trending_score(p_cafe_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
  v_views_14d INTEGER;
  v_visits_14d INTEGER;
  v_reviews_14d INTEGER;
  v_rating DECIMAL;
  v_score DECIMAL;
  v_days_since_update INTEGER;
  v_decay_factor DECIMAL;
BEGIN
  -- Get 14-day metrics
  SELECT 
    COALESCE(view_count_14d, 0),
    COALESCE(visit_count_14d, 0),
    COALESCE(google_rating, 0)
  INTO v_views_14d, v_visits_14d, v_rating
  FROM public.cafes
  WHERE id = p_cafe_id;
  
  -- Count recent reviews (if reviews table exists)
  SELECT COUNT(*)
  INTO v_reviews_14d
  FROM public.reviews
  WHERE cafe_id = p_cafe_id
    AND created_at > NOW() - INTERVAL '14 days';
  
  -- Calculate base score with weighted factors
  v_score := (
    v_views_14d * 1.0 +      -- Views: lowest weight
    v_visits_14d * 5.0 +     -- Visits: high weight
    v_reviews_14d * 10.0 +   -- Reviews: highest weight
    v_rating * 2.0           -- Rating: moderate weight
  );
  
  -- Apply time decay (data freshness bonus)
  SELECT EXTRACT(DAY FROM NOW() - last_synced_at)
  INTO v_days_since_update
  FROM public.cafes
  WHERE id = p_cafe_id;
  
  v_decay_factor := POWER(0.95, COALESCE(v_days_since_update, 0));
  
  RETURN v_score * v_decay_factor;
END;
$$;

-- 3. update_all_trending_scores
CREATE OR REPLACE FUNCTION public.update_all_trending_scores()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
  v_cafe_record RECORD;
  v_updated_count INTEGER := 0;
BEGIN
  FOR v_cafe_record IN 
    SELECT id FROM public.cafes
  LOOP
    UPDATE public.cafes
    SET 
      trending_score = public.calculate_trending_score(v_cafe_record.id),
      trending_updated_at = NOW()
    WHERE id = v_cafe_record.id;
    
    v_updated_count := v_updated_count + 1;
  END LOOP;
  
  -- Update trending ranks
  WITH ranked_cafes AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY trending_score DESC) as rank
    FROM public.cafes
    WHERE trending_score > 0
  )
  UPDATE public.cafes c
  SET trending_rank = rc.rank
  FROM ranked_cafes rc
  WHERE c.id = rc.id;
  
  RETURN v_updated_count;
END;
$$;

-- 4. trigger_update_cafe_aggregates
CREATE OR REPLACE FUNCTION public.trigger_update_cafe_aggregates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.update_cafe_aggregates(NEW.cafe_id);
  RETURN NEW;
END;
$$;

COMMIT;

-- Verification
SELECT 'Functions updated successfully!' as message;
