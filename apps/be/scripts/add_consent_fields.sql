-- Add consent tracking fields to users table (GDPR compliance)
-- Run this in Supabase SQL Editor

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_version VARCHAR(20) DEFAULT '1.0.0';

-- Optional: Add index for querying users by consent status
CREATE INDEX IF NOT EXISTS idx_users_terms_accepted ON public.users (terms_accepted_at);

COMMENT ON COLUMN public.users.terms_accepted_at IS 'Timestamp when user accepted Terms of Service';
COMMENT ON COLUMN public.users.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy';
COMMENT ON COLUMN public.users.consent_version IS 'Version of terms/privacy at time of consent';
