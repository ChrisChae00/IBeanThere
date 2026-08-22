-- Add detailed review fields to cafe_visits table
ALTER TABLE cafe_visits
ADD COLUMN IF NOT EXISTS atmosphere_rating SMALLINT CHECK (atmosphere_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS parking_info VARCHAR(50),
ADD COLUMN IF NOT EXISTS acidity_rating SMALLINT CHECK (acidity_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS body_rating SMALLINT CHECK (body_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS sweetness_rating SMALLINT CHECK (sweetness_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS bitterness_rating SMALLINT CHECK (bitterness_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS aftertaste_rating SMALLINT CHECK (aftertaste_rating BETWEEN 1 AND 5);

COMMENT ON COLUMN cafe_visits.atmosphere_rating IS 'Rating for cafe atmosphere (1-5)';
COMMENT ON COLUMN cafe_visits.parking_info IS 'Parking availability info (free_parking, street_paid, street_free, unknown)';
COMMENT ON COLUMN cafe_visits.acidity_rating IS 'Rating for coffee acidity (1-5)';
COMMENT ON COLUMN cafe_visits.body_rating IS 'Rating for coffee body (1-5)';
COMMENT ON COLUMN cafe_visits.sweetness_rating IS 'Rating for coffee sweetness (1-5)';
COMMENT ON COLUMN cafe_visits.bitterness_rating IS 'Rating for coffee bitterness (1-5)';
COMMENT ON COLUMN cafe_visits.aftertaste_rating IS 'Rating for coffee aftertaste (1-5)';
