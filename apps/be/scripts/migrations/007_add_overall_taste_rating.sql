-- Add overall taste rating column to cafe_visits
ALTER TABLE cafe_visits ADD COLUMN IF NOT EXISTS overall_taste_rating INTEGER CHECK (overall_taste_rating >= 0 AND overall_taste_rating <= 10);
