-- IBeanThere: Visits and Views Tracking Schema
-- Purpose: Track cafe views (clicks) and visits (physical presence) for trending algorithm

-- ============================================
-- cafe_views: Track when users view cafe details
-- ============================================
CREATE TABLE IF NOT EXISTS cafe_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- Reference to Supabase Auth users
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  
  CONSTRAINT fk_cafe_views_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cafe_views_cafe_time 
ON cafe_views(cafe_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cafe_views_user 
ON cafe_views(user_id, viewed_at DESC) 
WHERE user_id IS NOT NULL;

-- ============================================
-- cafe_visits: Track physical visits to cafes
-- ============================================
CREATE TABLE IF NOT EXISTS cafe_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- Reference to Supabase Auth users
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Location verification
  check_in_lat DECIMAL(10, 8),
  check_in_lng DECIMAL(11, 8),
  distance_meters INTEGER,
  
  -- Visit metadata
  duration_minutes INTEGER,
  auto_detected BOOLEAN DEFAULT FALSE,
  confirmed BOOLEAN DEFAULT TRUE,
  
  -- Related content
  has_review BOOLEAN DEFAULT FALSE,
  has_photos BOOLEAN DEFAULT FALSE,
  review_id UUID,  -- Will reference reviews table when it exists
  
  CONSTRAINT fk_cafe_visits_cafe FOREIGN KEY (cafe_id) REFERENCES cafes(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cafe_visits_cafe_time 
ON cafe_visits(cafe_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_cafe_visits_user_time 
ON cafe_visits(user_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_cafe_visits_auto_detected 
ON cafe_visits(auto_detected, confirmed) 
WHERE auto_detected = TRUE;

-- ============================================
-- Add aggregation columns to cafes table
-- ============================================
ALTER TABLE cafes 
  ADD COLUMN IF NOT EXISTS view_count_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count_14d INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visit_count_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visit_count_14d INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trending_score DECIMAL(10, 2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS trending_rank INTEGER,
  ADD COLUMN IF NOT EXISTS trending_updated_at TIMESTAMP WITH TIME ZONE;

-- Index for trending queries
CREATE INDEX IF NOT EXISTS idx_cafes_trending 
ON cafes(trending_score DESC NULLS LAST, trending_rank);

-- ============================================
-- Function: Update cafe aggregates
-- ============================================
CREATE OR REPLACE FUNCTION update_cafe_aggregates(p_cafe_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE cafes
  SET
    view_count_total = (
      SELECT COUNT(*) 
      FROM cafe_views 
      WHERE cafe_id = p_cafe_id
    ),
    view_count_14d = (
      SELECT COUNT(*) 
      FROM cafe_views 
      WHERE cafe_id = p_cafe_id 
        AND viewed_at > NOW() - INTERVAL '14 days'
    ),
    visit_count_total = (
      SELECT COUNT(*) 
      FROM cafe_visits 
      WHERE cafe_id = p_cafe_id 
        AND confirmed = TRUE
    ),
    visit_count_14d = (
      SELECT COUNT(*) 
      FROM cafe_visits 
      WHERE cafe_id = p_cafe_id 
        AND confirmed = TRUE
        AND visited_at > NOW() - INTERVAL '14 days'
    )
  WHERE id = p_cafe_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Calculate trending score
-- ============================================
CREATE OR REPLACE FUNCTION calculate_trending_score(p_cafe_id UUID)
RETURNS DECIMAL AS $$
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
  FROM cafes
  WHERE id = p_cafe_id;
  
  -- Count recent reviews (if reviews table exists)
  SELECT COUNT(*)
  INTO v_reviews_14d
  FROM reviews
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
  FROM cafes
  WHERE id = p_cafe_id;
  
  v_decay_factor := POWER(0.95, COALESCE(v_days_since_update, 0));
  
  RETURN v_score * v_decay_factor;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Update all trending scores
-- ============================================
CREATE OR REPLACE FUNCTION update_all_trending_scores()
RETURNS INTEGER AS $$
DECLARE
  v_cafe_record RECORD;
  v_updated_count INTEGER := 0;
BEGIN
  FOR v_cafe_record IN 
    SELECT id FROM cafes
  LOOP
    UPDATE cafes
    SET 
      trending_score = calculate_trending_score(v_cafe_record.id),
      trending_updated_at = NOW()
    WHERE id = v_cafe_record.id;
    
    v_updated_count := v_updated_count + 1;
  END LOOP;
  
  -- Update trending ranks
  WITH ranked_cafes AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY trending_score DESC) as rank
    FROM cafes
    WHERE trending_score > 0
  )
  UPDATE cafes c
  SET trending_rank = rc.rank
  FROM ranked_cafes rc
  WHERE c.id = rc.id;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers: Auto-update aggregates
-- ============================================
CREATE OR REPLACE FUNCTION trigger_update_cafe_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_cafe_aggregates(NEW.cafe_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on cafe_views insert
DROP TRIGGER IF EXISTS trigger_cafe_views_insert ON cafe_views;
CREATE TRIGGER trigger_cafe_views_insert
  AFTER INSERT ON cafe_views
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_cafe_aggregates();

-- Trigger on cafe_visits insert/update
DROP TRIGGER IF EXISTS trigger_cafe_visits_change ON cafe_visits;
CREATE TRIGGER trigger_cafe_visits_change
  AFTER INSERT OR UPDATE ON cafe_visits
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_cafe_aggregates();

-- ============================================
-- Verify schema
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('cafe_views', 'cafe_visits')
ORDER BY table_name, ordinal_position;

