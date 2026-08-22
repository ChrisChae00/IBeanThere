BEGIN;

-- Add slug column to cafes table
ALTER TABLE cafes
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_cafes_slug ON cafes(slug) WHERE slug IS NOT NULL;

-- Create function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_text TEXT;
  counter INTEGER := 0;
  base_slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(trim(name_text));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  
  slug_text := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM cafes WHERE slug = slug_text) LOOP
    counter := counter + 1;
    slug_text := base_slug || '-' || counter;
  END LOOP;
  
  RETURN slug_text;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing cafes
UPDATE cafes
SET slug = generate_slug(name)
WHERE slug IS NULL OR slug = '';

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_cafe_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_cafe_slug ON cafes;
CREATE TRIGGER trigger_set_cafe_slug
  BEFORE INSERT OR UPDATE OF name ON cafes
  FOR EACH ROW
  EXECUTE FUNCTION set_cafe_slug();

COMMIT;

