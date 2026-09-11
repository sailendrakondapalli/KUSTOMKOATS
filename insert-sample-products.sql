-- ============================================================
-- INSERT SAMPLE PRODUCTS FOR KUSTOM KOATS
-- Run this in your Supabase SQL Editor to add test products
-- ============================================================

-- Clear existing products (optional - remove this if you want to keep existing data)
-- DELETE FROM products;

-- Insert Xtreme Wrap Products
INSERT INTO products (name, description, price, original_price, category, stock, images, tags) VALUES
(
  'Pearl White Xtreme Wrap',
  'Premium pearl white vinyl wrap with stunning depth and shine. Perfect for complete vehicle transformations.',
  5999,
  6999,
  'Xtreme Wrap',
  50,
  ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
  ARRAY['new', 'bestseller']
),
(
  'Matte Black Xtreme Wrap',
  'Deep matte black finish that turns heads. UV resistant and weather-proof protection for your vehicle.',
  4999,
  NULL,
  'Xtreme Wrap',
  35,
  ARRAY['https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800'],
  ARRAY['popular']
),
(
  'Chrome Red Xtreme Wrap',
  'Eye-catching chrome red vinyl wrap with mirror-like finish. Makes your vehicle stand out from the crowd.',
  7999,
  8999,
  'Xtreme Wrap',
  20,
  ARRAY['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'],
  ARRAY['new', 'premium']
),
(
  'Carbon Fiber Xtreme Wrap',
  'Authentic carbon fiber texture vinyl wrap. Lightweight look with maximum protection.',
  6499,
  NULL,
  'Xtreme Wrap',
  40,
  ARRAY['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'],
  ARRAY['bestseller']
);

-- Insert Xtreme Kolorz Products
INSERT INTO products (name, description, price, original_price, category, stock, images, tags) VALUES
(
  'Candy Red Pearl Kolorz',
  'Deep candy red automotive pearl paint. Creates stunning depth and brilliant shine under any light.',
  3999,
  4499,
  'Xtreme Kolorz',
  100,
  ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'],
  ARRAY['new', 'bestseller']
),
(
  'Ocean Blue Pearl Kolorz',
  'Vibrant ocean blue pearl with color-shifting properties. Perfect for custom paint jobs.',
  3499,
  NULL,
  'Xtreme Kolorz',
  75,
  ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'],
  ARRAY['popular']
),
(
  'Sunset Orange Pearl Kolorz',
  'Explosive sunset orange pearl that changes from orange to gold in different lighting.',
  4299,
  4999,
  'Xtreme Kolorz',
  60,
  ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'],
  ARRAY['new', 'rare']
),
(
  'Midnight Purple Pearl Kolorz',
  'Mysterious midnight purple pearl with deep metallic flakes. Premium automotive paint.',
  4499,
  NULL,
  'Xtreme Kolorz',
  85,
  ARRAY['https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800'],
  ARRAY['bestseller', 'premium']
);

-- Insert Accessories
INSERT INTO products (name, description, price, original_price, category, stock, images, tags) VALUES
(
  'Professional Spray Gun Kit',
  'Complete professional spray gun kit for automotive painting. Includes multiple nozzles and pressure regulator.',
  8999,
  10999,
  'Accessories',
  30,
  ARRAY['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
  ARRAY['new', 'professional']
),
(
  'Paint Mixing Cups Set',
  'Set of 50 graduated mixing cups with lids. Essential for accurate paint mixing ratios.',
  599,
  NULL,
  'Accessories',
  200,
  ARRAY['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'],
  ARRAY['bestseller']
),
(
  'Masking Tape Professional Grade',
  'High-quality automotive masking tape. Clean removal without residue. 24mm x 50m roll.',
  299,
  399,
  'Accessories',
  150,
  ARRAY['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
  ARRAY['essential']
),
(
  'Paint Filter Strainers Pack',
  'Pack of 100 paint filter strainers. Ensures smooth, contamination-free paint application.',
  799,
  NULL,
  'Accessories',
  120,
  ARRAY['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'],
  ARRAY['popular']
);

-- ============================================================
-- DONE! Sample products have been added to your database.
-- Go to http://localhost:5173/admin to see them!
-- ============================================================
