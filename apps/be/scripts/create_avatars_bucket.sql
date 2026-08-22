-- =========================================================
-- Create Avatars Storage Bucket and RLS Policies
-- =========================================================
-- Run this in Supabase SQL Editor
-- This creates the 'avatars' bucket for user profile images
-- =========================================================

-- Note: The bucket must be created manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New bucket"
-- 3. Name: avatars
-- 4. Public bucket: ON

-- After creating the bucket, run these policies:

-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access for avatars
CREATE POLICY "Public read for avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
