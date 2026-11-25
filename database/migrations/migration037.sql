-- Migration 037: Dynamic Category, Subcategory, Banner & Product System
-- Creates subcategories table, subcategory_banners table, and enhances products table

-- ─────────────────────────────────────────────────────────────
-- 1. Ensure main categories table has all required columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slugs for existing categories that don't have one
UPDATE categories SET slug = LOWER(REGEXP_REPLACE(name, '\s+', '-', 'g')) WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- ─────────────────────────────────────────────────────────────
-- 2. Seed default main categories (Kustom Kolors, Kustom Wrap, Accessories)
--    Uses INSERT ... ON CONFLICT to avoid duplicating existing rows.
-- ─────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, sort_order, is_active)
VALUES
  ('Kustom Kolors',  'kustom-kolors',  'Premium automotive color pigments and pearl powders', 0, TRUE),
  ('Kustom Wrap',    'kustom-wrap',    'Professional-grade vinyl wraps with pearl finishes',  1, TRUE),
  ('Accessories',    'accessories',    'Professional tools and accessories for custom finish', 2, TRUE)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. Create subcategories table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_is_active ON subcategories(is_active);
CREATE INDEX IF NOT EXISTS idx_subcategories_sort_order ON subcategories(sort_order);

-- ─────────────────────────────────────────────────────────────
-- 4. Create subcategory_banners table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subcategory_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  heading TEXT,
  subheading TEXT,
  cta_text TEXT,
  cta_link TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategory_banners_subcategory_id ON subcategory_banners(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_subcategory_banners_is_active ON subcategory_banners(is_active);

-- ─────────────────────────────────────────────────────────────
-- 5. Add subcategory_id column to products table (optional FK)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS discount_price NUMERIC,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- ─────────────────────────────────────────────────────────────
-- 6. Seed example subcategories for Kustom Kolors
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  kolors_id UUID;
BEGIN
  SELECT id INTO kolors_id FROM categories WHERE slug = 'kustom-kolors' LIMIT 1;
  IF kolors_id IS NOT NULL THEN
    INSERT INTO subcategories (category_id, name, slug, description, sort_order, is_active)
    VALUES
      (kolors_id, 'Kustom Signatures', 'kustom-signatures', 'Signature series exclusive color pigments', 0, TRUE),
      (kolors_id, 'Red Candy',         'red-candy',         'Deep red candy color effects',               1, TRUE)
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 7. Enable RLS on new tables
-- ─────────────────────────────────────────────────────────────

-- subcategories: public read, admin write
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active subcategories"
  ON subcategories FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage subcategories"
  ON subcategories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
    OR auth.email() = 'sailendrakondapalli@gmail.com'
  );

-- subcategory_banners: public read, admin write
ALTER TABLE subcategory_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active banners"
  ON subcategory_banners FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage banners"
  ON subcategory_banners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
    OR auth.email() = 'sailendrakondapalli@gmail.com'
  );

-- ─────────────────────────────────────────────────────────────
-- 8. Update timestamp trigger for subcategories and banners
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subcategory_banners_updated_at ON subcategory_banners;
CREATE TRIGGER update_subcategory_banners_updated_at
  BEFORE UPDATE ON subcategory_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  sub_count INTEGER;
  banner_count INTEGER;
  cat_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO sub_count FROM subcategories;
  SELECT COUNT(*) INTO banner_count FROM subcategory_banners;
  RAISE NOTICE 'Migration 037 complete: % categories, % subcategories, % banners', cat_count, sub_count, banner_count;
END $$;
