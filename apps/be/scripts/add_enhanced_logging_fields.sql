BEGIN;

-- =========================================================
-- Add Enhanced Logging Fields to cafe_visits table
-- =========================================================
-- This migration adds new fields for enhanced coffee logging:
-- - Basic logging: dessert, price
-- - Coffee & Taste: bean_origin, processing_method, roast_level, extraction_method, extraction_equipment, aroma_rating
-- - Space & Work Environment: wifi_quality, wifi_rating, outlet_info, furniture_comfort, noise_level, noise_rating, temperature_lighting, facilities_info
-- All fields are optional (NULL allowed) to maintain compatibility with existing data

-- Basic logging fields
ALTER TABLE public.cafe_visits
ADD COLUMN IF NOT EXISTS dessert TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);

-- Coffee & Taste fields
ALTER TABLE public.cafe_visits
ADD COLUMN IF NOT EXISTS bean_origin TEXT,
ADD COLUMN IF NOT EXISTS processing_method TEXT,
ADD COLUMN IF NOT EXISTS roast_level TEXT,
ADD COLUMN IF NOT EXISTS extraction_method TEXT,
ADD COLUMN IF NOT EXISTS extraction_equipment TEXT,
ADD COLUMN IF NOT EXISTS aroma_rating INTEGER;

-- Space & Work Environment fields
ALTER TABLE public.cafe_visits
ADD COLUMN IF NOT EXISTS wifi_quality TEXT,
ADD COLUMN IF NOT EXISTS wifi_rating INTEGER CHECK (wifi_rating IS NULL OR (wifi_rating >= 1 AND wifi_rating <= 5)),
ADD COLUMN IF NOT EXISTS outlet_info TEXT,
ADD COLUMN IF NOT EXISTS furniture_comfort TEXT,
ADD COLUMN IF NOT EXISTS noise_level TEXT,
ADD COLUMN IF NOT EXISTS noise_rating INTEGER CHECK (noise_rating IS NULL OR (noise_rating >= 1 AND noise_rating <= 5)),
ADD COLUMN IF NOT EXISTS temperature_lighting TEXT,
ADD COLUMN IF NOT EXISTS facilities_info TEXT;

-- Update existing tasting notes rating fields from 1-5 to 0-10 range
-- Drop existing check constraints if they exist
DO $$
BEGIN
    -- Drop old constraints if they exist
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cafe_visits_acidity_rating_check') THEN
        ALTER TABLE public.cafe_visits DROP CONSTRAINT cafe_visits_acidity_rating_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cafe_visits_body_rating_check') THEN
        ALTER TABLE public.cafe_visits DROP CONSTRAINT cafe_visits_body_rating_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cafe_visits_sweetness_rating_check') THEN
        ALTER TABLE public.cafe_visits DROP CONSTRAINT cafe_visits_sweetness_rating_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cafe_visits_bitterness_rating_check') THEN
        ALTER TABLE public.cafe_visits DROP CONSTRAINT cafe_visits_bitterness_rating_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cafe_visits_aftertaste_rating_check') THEN
        ALTER TABLE public.cafe_visits DROP CONSTRAINT cafe_visits_aftertaste_rating_check;
    END IF;
END $$;

-- Add new check constraints for 0-10 range
ALTER TABLE public.cafe_visits
ADD CONSTRAINT cafe_visits_acidity_rating_check 
    CHECK (acidity_rating IS NULL OR (acidity_rating >= 0 AND acidity_rating <= 10));

ALTER TABLE public.cafe_visits
ADD CONSTRAINT cafe_visits_body_rating_check 
    CHECK (body_rating IS NULL OR (body_rating >= 0 AND body_rating <= 10));

ALTER TABLE public.cafe_visits
ADD CONSTRAINT cafe_visits_sweetness_rating_check 
    CHECK (sweetness_rating IS NULL OR (sweetness_rating >= 0 AND sweetness_rating <= 10));

ALTER TABLE public.cafe_visits
ADD CONSTRAINT cafe_visits_bitterness_rating_check 
    CHECK (bitterness_rating IS NULL OR (bitterness_rating >= 0 AND bitterness_rating <= 10));

ALTER TABLE public.cafe_visits
ADD CONSTRAINT cafe_visits_aftertaste_rating_check 
    CHECK (aftertaste_rating IS NULL OR (aftertaste_rating >= 0 AND aftertaste_rating <= 10));

-- Update aroma_rating to 0-10 range as well
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cafe_visits_aroma_rating_check') THEN
        ALTER TABLE public.cafe_visits DROP CONSTRAINT cafe_visits_aroma_rating_check;
    END IF;
END $$;

ALTER TABLE public.cafe_visits
ADD CONSTRAINT cafe_visits_aroma_rating_check 
    CHECK (aroma_rating IS NULL OR (aroma_rating >= 0 AND aroma_rating <= 10));

-- Add comments for documentation
COMMENT ON COLUMN public.cafe_visits.dessert IS 'Dessert ordered (optional basic logging field)';
COMMENT ON COLUMN public.cafe_visits.price IS 'Price paid (optional basic logging field)';
COMMENT ON COLUMN public.cafe_visits.bean_origin IS 'Coffee bean origin (e.g., Ethiopia, Colombia)';
COMMENT ON COLUMN public.cafe_visits.processing_method IS 'Processing method (Washed, Natural, Honey, etc.)';
COMMENT ON COLUMN public.cafe_visits.roast_level IS 'Roast level (Light, Medium, Medium-Dark, Dark)';
COMMENT ON COLUMN public.cafe_visits.extraction_method IS 'Extraction method used';
COMMENT ON COLUMN public.cafe_visits.extraction_equipment IS 'Equipment used for extraction (e.g., La Marzocco, Hario, Aeropress)';
COMMENT ON COLUMN public.cafe_visits.aroma_rating IS 'Aroma rating (0-10)';
COMMENT ON COLUMN public.cafe_visits.wifi_quality IS 'WiFi quality description';
COMMENT ON COLUMN public.cafe_visits.wifi_rating IS 'WiFi rating (1-5 stars)';
COMMENT ON COLUMN public.cafe_visits.outlet_info IS 'Outlet availability and location information';
COMMENT ON COLUMN public.cafe_visits.furniture_comfort IS 'Furniture comfort description (table height, chair comfort, etc.)';
COMMENT ON COLUMN public.cafe_visits.noise_level IS 'Noise level description (decibels, conversation vs white noise, music genre/volume)';
COMMENT ON COLUMN public.cafe_visits.noise_rating IS 'Noise rating (1-5 stars)';
COMMENT ON COLUMN public.cafe_visits.temperature_lighting IS 'Temperature and lighting description (AC/heater strength, lighting for work)';
COMMENT ON COLUMN public.cafe_visits.facilities_info IS 'Facilities information (bathroom location/cleanliness, gender separation, parking availability)';

COMMIT;

