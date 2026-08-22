-- Migration: Add collections_public to users table
-- Controls whether a user's collections are visible on their public profile

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS collections_public BOOLEAN NOT NULL DEFAULT FALSE;
