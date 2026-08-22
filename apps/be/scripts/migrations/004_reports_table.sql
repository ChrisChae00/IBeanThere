-- ============================================================================
-- Report Feature Migration
-- Creates reports table for user submissions (feedback, bug reports, etc.)
-- ============================================================================

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    report_type text NOT NULL,
    target_type text NOT NULL CHECK (target_type IN ('user', 'cafe', 'review', 'website')),
    target_id text,
    target_url text,
    description text NOT NULL,
    image_urls text[] DEFAULT '{}',
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    report_date date NOT NULL DEFAULT CURRENT_DATE,
    resolved_at timestamptz
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);

-- Unique index to prevent duplicate reports on the same day
-- For non-null target_id (cafe, user, review reports)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_unique_daily 
    ON public.reports(reporter_id, target_type, target_id, report_date)
    WHERE target_id IS NOT NULL;

-- For null target_id (website feedback without specific target)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_unique_daily_null 
    ON public.reports(reporter_id, target_type, report_date)
    WHERE target_id IS NULL;

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can create their own reports
CREATE POLICY "Users can create reports"
    ON public.reports
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = reporter_id);

-- RLS Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON public.reports
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = reporter_id);

-- RLS Policy: Admins can view all reports
CREATE POLICY "Admins can view all reports"
    ON public.reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = (SELECT auth.uid())
            AND role = 'admin'
        )
    );

-- RLS Policy: Admins can update any report
CREATE POLICY "Admins can update reports"
    ON public.reports
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = (SELECT auth.uid())
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = (SELECT auth.uid())
            AND role = 'admin'
        )
    );

-- ============================================================================
-- Storage Bucket for Report Images
-- Run this in the Supabase Dashboard > Storage > Create new bucket
-- Bucket name: reports
-- Public bucket: true (so images can be viewed)
-- ============================================================================

-- Note: Storage bucket policies need to be created via Supabase Dashboard or API:
-- 1. Create bucket named "reports" with public access
-- 2. Add policy for authenticated users to upload:
--    - Name: "Authenticated users can upload"
--    - Operation: INSERT
--    - Target roles: authenticated
--    - WITH CHECK: bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text
-- 3. Add policy for public read:
--    - Name: "Public can view"
--    - Operation: SELECT
--    - Target roles: public, authenticated
--    - USING: bucket_id = 'reports'

COMMENT ON TABLE public.reports IS 'User-submitted reports for feedback, bugs, inappropriate content, etc.';
