-- ============================================================
-- FIX PRODUCTS TABLE POLICIES FOR ADMIN PANEL
-- Run this in your Supabase SQL Editor
-- ============================================================
-- This allows the admin panel to create/update/delete products
-- without authentication (since admin panel has no login)
-- ============================================================

-- Step 1: Drop all existing restrictive policies on products table
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated can update products" ON products;
DROP POLICY IF EXISTS "Authenticated can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

-- Step 2: Create new PUBLIC policies (no authentication required)
-- This allows admin panel to work without login

-- Allow ANYONE to read products (public access for shop pages)
CREATE POLICY "Anyone can read products"
ON products FOR SELECT
USING (true);

-- Allow ANYONE to insert products (for admin panel)
CREATE POLICY "Anyone can insert products"
ON products FOR INSERT
WITH CHECK (true);

-- Allow ANYONE to update products (for admin panel)
CREATE POLICY "Anyone can update products"
ON products FOR UPDATE
USING (true);

-- Allow ANYONE to delete products (for admin panel)
CREATE POLICY "Anyone can delete products"
ON products FOR DELETE
USING (true);

-- ============================================================
-- DONE! Products table policies are now set for public access
-- ============================================================

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

-- You should see 4 policies:
-- 1. Anyone can read products (SELECT)
-- 2. Anyone can insert products (INSERT)
-- 3. Anyone can update products (UPDATE)
-- 4. Anyone can delete products (DELETE)
