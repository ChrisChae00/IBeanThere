-- Add composite index on cafes table for geospatial query optimization
-- This will significantly improve query performance when searching cafes by location

-- Create composite index on latitude and longitude
CREATE INDEX IF NOT EXISTS idx_cafes_location 
ON cafes(latitude, longitude);

-- Optional: Add partial index for only valid locations (non-null)
CREATE INDEX IF NOT EXISTS idx_cafes_valid_location 
ON cafes(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Verify indexes were created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'cafes' 
ORDER BY indexname;

