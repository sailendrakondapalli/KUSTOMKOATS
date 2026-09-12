-- ============================================================
-- DELETE SAMPLE PRODUCTS FROM KUSTOM KOATS DATABASE
-- Run this in your Supabase SQL Editor to remove test products
-- ============================================================

-- OPTION 1: Delete all products (use with caution!)
DELETE FROM products;

-- OPTION 2: Delete only the sample products by name (safer option)
-- Uncomment the lines below if you want to delete specific products instead

/*
DELETE FROM products 
WHERE name IN (
  'Pearl White Xtreme Wrap',
  'Matte Black Xtreme Wrap',
  'Chrome Red Xtreme Wrap',
  'Carbon Fiber Xtreme Wrap',
  'Candy Red Pearl Kolorz',
  'Ocean Blue Pearl Kolorz',
  'Sunset Orange Pearl Kolorz',
  'Midnight Purple Pearl Kolorz',
  'Professional Spray Gun Kit',
  'Paint Mixing Cups Set',
  'Masking Tape Professional Grade',
  'Paint Filter Strainers Pack'
);
*/

-- OPTION 3: Delete products by category
-- Uncomment the category you want to delete

/*
-- Delete only Xtreme Wrap products
DELETE FROM products WHERE category = 'Xtreme Wrap';

-- Delete only Xtreme Kolorz products
DELETE FROM products WHERE category = 'Xtreme Kolorz';

-- Delete only Accessories products
DELETE FROM products WHERE category = 'Accessories';
*/

-- ============================================================
-- DONE! Products have been deleted from your database.
-- ============================================================
