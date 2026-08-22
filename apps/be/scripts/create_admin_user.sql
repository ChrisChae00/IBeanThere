-- =========================================================
-- Create Admin User Script
-- =========================================================
-- This script updates an existing user's role to 'admin'
-- 
-- Prerequisites:
-- 1. The user must exist in auth.users (created via Supabase Auth signup)
-- 2. The user must exist in public.users (created by trigger or verify_and_setup_users.sql)
-- 
-- Usage:
-- Run this script after verify_and_setup_users.sql and add_admin_system.sql
--
-- NOTE: This script assumes public.users table and role column already exist.
--       If they don't exist, run verify_and_setup_users.sql first.

BEGIN;

-- =========================================================
-- Step 1: Ensure user exists in public.users
-- =========================================================
-- If user doesn't exist in public.users, create a basic profile
-- (This should rarely happen if trigger is set up correctly)
INSERT INTO public.users (id, email, role)
SELECT 
  au.id,
  au.email,
  'user' -- Default role, will be updated to 'admin' in next step
FROM auth.users au
WHERE au.email = 'ibeanthere.app@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.users pu 
  WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- Step 2: Update user role to admin
-- =========================================================
UPDATE public.users
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'ibeanthere.app@gmail.com'
AND EXISTS (
  SELECT 1 FROM auth.users 
  WHERE auth.users.email = public.users.email
);

-- =========================================================
-- Step 3: Verify the update
-- =========================================================
DO $$
DECLARE
  admin_count INTEGER;
  updated_user RECORD;
BEGIN
  -- Count admin users
  SELECT COUNT(*) INTO admin_count
  FROM public.users
  WHERE role = 'admin';
  
  -- Get the updated user details
  SELECT id, email, username, role, created_at, updated_at
  INTO updated_user
  FROM public.users
  WHERE email = 'ibeanthere.app@gmail.com';
  
  -- Log results
  RAISE NOTICE 'Admin User Update Summary:';
  RAISE NOTICE '  - Total admin users: %', admin_count;
  
  IF updated_user.id IS NOT NULL THEN
    RAISE NOTICE '  - Updated user:';
    RAISE NOTICE '    * Email: %', updated_user.email;
    RAISE NOTICE '    * Username: %', COALESCE(updated_user.username, 'NULL');
    RAISE NOTICE '    * Role: %', updated_user.role;
    RAISE NOTICE '    * Created: %', updated_user.created_at;
    RAISE NOTICE '    * Updated: %', updated_user.updated_at;
    
    IF updated_user.role != 'admin' THEN
      RAISE WARNING 'User role was NOT updated to admin! Current role: %', updated_user.role;
    ELSE
      RAISE NOTICE '  - ✅ Successfully updated to admin role';
    END IF;
  ELSE
    RAISE WARNING 'User with email ibeanthere.app@gmail.com not found in public.users!';
  END IF;
END$$;

-- Return the updated user for verification
SELECT 
  id,
  email,
  username,
  role,
  created_at,
  updated_at
FROM public.users
WHERE email = 'ibeanthere.app@gmail.com';

COMMIT;

