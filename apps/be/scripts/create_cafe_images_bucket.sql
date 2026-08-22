-- =========================================================
-- Create Cafe Images Storage Bucket and RLS Policies
-- =========================================================
-- Run this in Supabase SQL Editor
-- This creates the 'cafe-images' bucket for cafe photos
-- =========================================================

-- Note: The bucket must be created manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New bucket"
-- 3. Name: cafe-images
-- 4. Public bucket: ON

-- After creating the bucket, run these policies:

-- Allow authenticated users to upload cafe images
CREATE POLICY "Users can upload cafe images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cafe-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own cafe images
CREATE POLICY "Users can update own cafe images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'cafe-images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'cafe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own cafe images
CREATE POLICY "Users can delete own cafe images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cafe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access for cafe images
CREATE POLICY "Public read for cafe images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'cafe-images');
