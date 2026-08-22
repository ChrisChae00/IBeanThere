BEGIN;

-- =========================================================
-- Add role column to users table
-- =========================================================
-- Note: This assumes a users table exists in public schema
-- If using Supabase auth.users only, role might be stored in a separate profile table
-- Adjust the table name based on your schema

-- Add role column if users table exists in public schema
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) THEN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'role'
    ) THEN
      ALTER TABLE public.users 
      ADD COLUMN role VARCHAR NOT NULL DEFAULT 'user';
      
      -- Add constraint
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'cafe_owner', 'guest'));
      
      -- Create index
      CREATE INDEX idx_users_role ON public.users(role);
    END IF;
  END IF;
END$$;

-- =========================================================
-- Add admin_verified column to cafes table
-- =========================================================
-- Add admin_verified column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cafes' 
    AND column_name = 'admin_verified'
  ) THEN
    ALTER TABLE public.cafes 
    ADD COLUMN admin_verified BOOLEAN NOT NULL DEFAULT FALSE;
    
    -- Create index for admin verification queries
    CREATE INDEX IF NOT EXISTS idx_cafes_admin_verified ON public.cafes(admin_verified);
  END IF;
END$$;

-- =========================================================
-- Ensure auto-sync trigger exists for auth.users -> public.users
-- =========================================================
-- This ensures that when auth.users gets a new user,
-- public.users automatically gets a record with role='user'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

