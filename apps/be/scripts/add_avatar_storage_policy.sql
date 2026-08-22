-- =========================================================
-- Avatar Storage Setup Script
-- =========================================================
-- This script sets up RLS policies for the 'avatars' bucket
-- 
-- PREREQUISITE: Create the 'avatars' bucket in Supabase Dashboard:
-- 1. Go to Storage > New Bucket
-- 2. Name: avatars
-- 3. Public bucket: Yes
-- 4. File size limit: 2MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp

-- =========================================================
-- Storage Policies for 'avatars' bucket
-- =========================================================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =========================================================
-- Verification
-- =========================================================
-- After running this script, verify policies with:
-- SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
