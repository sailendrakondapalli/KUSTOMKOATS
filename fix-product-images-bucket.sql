-- ============================================================
-- FIX PRODUCT-IMAGES STORAGE BUCKET POLICIES
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Step 1: Drop all existing policies for this bucket (if they exist)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

-- Step 2: Create new policies with PUBLIC access for uploading
-- (No authentication required - for easy admin use)

-- Allow ANYONE to read images (public access)
CREATE POLICY "Anyone can read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow ANYONE to upload images (simplified for admin panel)
CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow ANYONE to update images
CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Allow ANYONE to delete images
CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- ============================================================
-- DONE! Storage policies are set
-- ============================================================

-- Now you need to create the bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. If "product-images" bucket doesn't exist:
--    - Click "New bucket"
--    - Name: product-images
--    - Public: YES (enable)
--    - Click "Create"
-- 3. Then try uploading in admin panel!
