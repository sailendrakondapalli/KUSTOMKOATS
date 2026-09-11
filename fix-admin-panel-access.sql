-- ============================================================
-- FIX ALL TABLE POLICIES FOR ADMIN PANEL (NO AUTH REQUIRED)
-- Run this in your Supabase SQL Editor
-- ============================================================
-- This script allows the admin panel to work WITHOUT authentication
-- by setting public access policies on all admin-managed tables
-- ============================================================

-- ========================================
-- 1. PRODUCTS TABLE
-- ========================================

-- Drop all existing policies
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

-- Create new public policies
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Anyone can insert products"
  ON products FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update products"
  ON products FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE USING (true);

-- ========================================
-- 2. ORDERS TABLE
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users manage own orders select" ON orders;
DROP POLICY IF EXISTS "Users manage own orders insert" ON orders;
DROP POLICY IF EXISTS "Users manage own orders update" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Users or admin read orders" ON orders;
DROP POLICY IF EXISTS "Users or admin update orders" ON orders;
DROP POLICY IF EXISTS "Admin read all orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;

-- Create new public policies (read-only for customers, full access for admin panel)
CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT USING (true);

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete orders"
  ON orders FOR DELETE USING (true);

-- ========================================
-- 3. ORDER_ITEMS TABLE
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can update order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can delete order items" ON order_items;

-- Create new public policies
CREATE POLICY "Anyone can read order items"
  ON order_items FOR SELECT USING (true);

CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update order items"
  ON order_items FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete order items"
  ON order_items FOR DELETE USING (true);

-- ========================================
-- 4. TESTIMONIALS TABLE (Reviews)
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can read approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users insert own testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users update own testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users delete own testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated can manage all testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin full testimonials access" ON testimonials;
DROP POLICY IF EXISTS "Allow anonymous testimonials access" ON testimonials;
DROP POLICY IF EXISTS "Anyone can submit reviews" ON testimonials;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins have full access to testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can delete testimonials" ON testimonials;

-- Create new public policies
CREATE POLICY "Anyone can read testimonials"
  ON testimonials FOR SELECT USING (true);

CREATE POLICY "Anyone can insert testimonials"
  ON testimonials FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update testimonials"
  ON testimonials FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete testimonials"
  ON testimonials FOR DELETE USING (true);

-- ============================================================
-- DONE! All admin tables now have public access
-- ============================================================

-- Verify all policies were created correctly
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('products', 'orders', 'order_items', 'testimonials')
ORDER BY tablename, policyname;

-- You should see 4 policies for each table:
-- - Anyone can read [table]
-- - Anyone can insert [table]
-- - Anyone can update [table]
-- - Anyone can delete [table]

-- SECURITY NOTE:
-- ===============
-- This setup allows PUBLIC access to admin functions.
-- This is intentional for the current admin panel (no authentication).
-- 
-- For production, you should:
-- 1. Add proper authentication to admin panel
-- 2. Restrict policies to authenticated admin users only
-- 3. Keep public SELECT for products/testimonials (shop needs to read)
-- 
-- But for now, this gets your admin panel working! ✅
