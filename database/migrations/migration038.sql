-- Migration 038: Category Banners Table
-- Adds hero banner support for main categories (Kustom Kolors, Kustom Wrap, Accessories, etc.)

CREATE TABLE IF NOT EXISTS category_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_category_banners_category_id ON category_banners(category_id);
CREATE INDEX IF NOT EXISTS idx_category_banners_is_active ON category_banners(is_active);

-- RLS: public read, admin write
ALTER TABLE category_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active category banners"
  ON category_banners FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage category banners"
  ON category_banners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
    OR auth.email() = 'sailendrakondapalli@gmail.com'
  );

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_category_banners_updated_at ON category_banners;
CREATE TRIGGER update_category_banners_updated_at
  BEFORE UPDATE ON category_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
  RAISE NOTICE 'Migration 038 complete: category_banners table created';
END $$;
