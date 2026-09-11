-- Apply after 022 before deploying account deletion. No accounts are deleted here.
BEGIN;
CREATE TABLE public.account_deletion_requests (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_deletion_requests FROM anon, authenticated;
GRANT ALL ON public.account_deletion_requests TO service_role;

-- 022's restrictive policies already call this function on public tables and Storage.
-- Checking Auth existence also prevents a deleted user's unexpired JWT from writing.
CREATE OR REPLACE FUNCTION public.account_not_blocked() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
 AND NOT EXISTS (SELECT 1 FROM public.user_blacklist WHERE user_id = auth.uid() AND status = 'blocked')
 AND NOT EXISTS (SELECT 1 FROM public.account_deletion_requests WHERE user_id = auth.uid());
$$;

-- Enumerate by ownership AND the app's user-folder convention (including service uploads).
-- Return a bounded page; the server removes it through Storage API then reads again.
CREATE FUNCTION public.account_deletion_files(target uuid)
RETURNS TABLE(bucket_id text, name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT o.bucket_id, o.name FROM storage.objects o
 WHERE o.owner_id = target::text OR
   (o.bucket_id IN ('avatars', 'cafe-images', 'reports') AND split_part(o.name, '/', 1) = target::text)
 ORDER BY o.bucket_id, o.name LIMIT 100;
$$;
REVOKE ALL ON FUNCTION public.account_deletion_files(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.account_deletion_files(uuid) TO service_role;

-- Retained shared cafe listings must not carry the deleted account's crew identifier
-- or a cover URL into its removed uploads. Personal rows follow existing FK cascades.
CREATE FUNCTION public.detach_deleted_account() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 UPDATE public.cafes SET vanguard_ids = vanguard_ids - OLD.id::text
 WHERE vanguard_ids ? OLD.id::text;
 UPDATE public.cafes SET main_image = NULL
 WHERE main_image LIKE '%/storage/v1/object/public/cafe-images/' || OLD.id::text || '/%';
 RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.detach_deleted_account() FROM PUBLIC;
CREATE TRIGGER detach_deleted_account BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.detach_deleted_account();

-- Historical moderation rows may reference a reviewer who later leaves.
DO $$ BEGIN
 IF to_regclass('public.fraud_logs') IS NOT NULL THEN
   ALTER TABLE public.fraud_logs DROP CONSTRAINT IF EXISTS fraud_logs_reviewed_by_fkey;
   ALTER TABLE public.fraud_logs ADD CONSTRAINT fraud_logs_reviewed_by_fkey
     FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
 END IF;
END $$;
COMMIT;
