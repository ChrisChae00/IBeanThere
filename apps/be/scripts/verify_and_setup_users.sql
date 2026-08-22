-- =========================================================
-- Verify and Setup Users Table Script
-- =========================================================
-- This script:
-- 1. Checks if public.users table exists and creates it if needed
-- 2. Adds role column if missing
-- 3. Migrates ALL existing users from auth.users to public.users
-- 4. Sets up auto-sync trigger for future signups

BEGIN;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'cafe_owner', 'guest'))
);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Add role column if users table exists but role column doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) THEN
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'role'
    ) THEN
      ALTER TABLE public.users 
      ADD COLUMN role VARCHAR NOT NULL DEFAULT 'user';
      
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'cafe_owner', 'guest'));
      
      CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
    END IF;
  END IF;
END$$;

-- =========================================================
-- Migrate ALL existing users from auth.users to public.users
-- =========================================================
-- This ensures all existing auth.users are synced to public.users
-- with default role='user' (admin can be set later via create_admin_user.sql)

INSERT INTO public.users (id, email, role, created_at)
SELECT 
  au.id,
  au.email,
  'user' AS role, -- Default role, will be updated to 'admin' by create_admin_user.sql if needed
  COALESCE(au.created_at, NOW()) AS created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu 
  WHERE pu.id = au.id
)
ON CONFLICT (id) DO UPDATE
SET 
  -- Only update email if it changed (skip if already exists)
  email = COALESCE(EXCLUDED.email, public.users.email);

-- Verify migration results
DO $$
DECLARE
  auth_count INTEGER;
  public_count INTEGER;
  migrated_count INTEGER;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO public_count FROM public.users;
  SELECT COUNT(*) INTO migrated_count 
  FROM auth.users au
  WHERE EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id);
  
  -- Log results
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  - Total users in auth.users: %', auth_count;
  RAISE NOTICE '  - Total users in public.users: %', public_count;
  RAISE NOTICE '  - Successfully migrated: %', migrated_count;
  
  IF migrated_count < auth_count THEN
    RAISE WARNING 'Some users were not migrated. Check for errors.';
  END IF;
END$$;

-- =========================================================
-- Auto-sync trigger: auth.users -> public.users
-- =========================================================
-- This trigger automatically creates a public.users record
-- when a new user is created in auth.users

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

-- Verify current state
SELECT 
  'Current users in public.users:' as info,
  COUNT(*) as total_users
FROM public.users;

SELECT 
  id,
  email,
  username,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC;

COMMIT;

