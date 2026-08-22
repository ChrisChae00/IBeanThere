BEGIN;

-- Add visit tracking fields to cafe_visits table (if not already exist)
ALTER TABLE cafe_visits
ADD COLUMN IF NOT EXISTS check_in_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS check_in_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS distance_meters INTEGER,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS auto_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS has_review BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_photos BOOLEAN DEFAULT FALSE;

-- Add coffee log fields to cafe_visits table
ALTER TABLE cafe_visits
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS comment TEXT CHECK (char_length(comment) <= 1000),
ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS anonymous BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS coffee_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_visits_public_logs ON cafe_visits(cafe_id, is_public, visited_at DESC) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visits_user_logs ON cafe_visits(user_id, is_public);

-- Update has_review trigger to check rating instead of separate review table
-- First, drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_has_review ON cafe_visits;

-- Create function to update has_review based on rating
CREATE OR REPLACE FUNCTION update_has_review_from_rating()
RETURNS TRIGGER AS $$
BEGIN
  NEW.has_review := (NEW.rating IS NOT NULL);
  NEW.has_photos := (NEW.photo_urls IS NOT NULL AND jsonb_array_length(NEW.photo_urls) > 0);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_has_review
  BEFORE INSERT OR UPDATE ON cafe_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_has_review_from_rating();

-- Update updated_at trigger
-- First check if set_updated_at function exists, if not create it
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_visits_updated_at ON cafe_visits;
CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON cafe_visits
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

COMMIT;

