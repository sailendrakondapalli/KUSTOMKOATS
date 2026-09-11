-- ============================================================
--  KUSTOM KOATS — COMPLETE DATABASE SETUP
--  Run this entire file in your Supabase SQL Editor
--  This will create all tables needed for the website
-- ============================================================

-- ============================================================
-- SECTION 1 — CREATE TABLES
-- ============================================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  price           numeric     NOT NULL,
  category        text        NOT NULL,
  description     text,
  images          text[]      DEFAULT '{}',
  tags            text[]      DEFAULT '{}',
  stock           integer     DEFAULT 0,
  original_price  numeric,
  created_at      timestamptz DEFAULT now()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount            numeric     NOT NULL,
  payment_status          text        DEFAULT 'pending',
  order_status            text        DEFAULT 'confirmed',
  address                 jsonb,
  city                    text,
  state                   text,
  pincode                 text,
  display_order_id        text,
  created_at              timestamptz DEFAULT now()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id  uuid        REFERENCES products(id) ON DELETE SET NULL,
  quantity    integer     NOT NULL,
  price       numeric     NOT NULL
);

-- Testimonials Table (Reviews)
CREATE TABLE IF NOT EXISTS testimonials (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  guest_email text,
  rating      integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review      text        NOT NULL,
  is_approved boolean     DEFAULT false,
  is_active   boolean     DEFAULT true,
  display_order integer   DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id  uuid        REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity    integer     DEFAULT 1,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id  uuid        REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label       text        DEFAULT 'Home',
  full_name   text        NOT NULL,
  phone       text        NOT NULL,
  address1    text        NOT NULL,
  address2    text,
  city        text        NOT NULL,
  state       text        NOT NULL,
  pincode     text        NOT NULL,
  is_default  boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 text        NOT NULL UNIQUE,
  description          text,
  discount_type        text        NOT NULL DEFAULT 'percentage',
  discount_value       numeric     NOT NULL,
  min_order_amount     numeric     DEFAULT 0,
  is_active            boolean     DEFAULT true,
  expires_at           timestamptz DEFAULT NULL,
  created_at           timestamptz DEFAULT now()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  key         text        PRIMARY KEY,
  value       text,
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- SECTION 2 — ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 3 — DROP EXISTING POLICIES (Clean Slate)
-- ============================================================

DO $$ 
DECLARE r RECORD; 
BEGIN
  FOR r IN
    SELECT policyname, tablename FROM pg_policies
    WHERE tablename IN (
      'products','orders','order_items','testimonials',
      'cart','wishlist','addresses','promo_codes','site_settings'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- SECTION 4 — CREATE RLS POLICIES
-- ============================================================

-- Products: Anyone can read, authenticated can manage
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert products"
  ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update products"
  ON products FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete products"
  ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Orders: Users manage their own
CREATE POLICY "Users manage own orders select"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own orders insert"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own orders update"
  ON orders FOR UPDATE USING (auth.uid() = user_id);

-- Order Items: Based on order ownership
CREATE POLICY "Users view own order items"
  ON order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert own order items"
  ON order_items FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Testimonials: Public read approved, users manage own
CREATE POLICY "Anyone can read approved testimonials"
  ON testimonials FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Users insert own testimonials"
  ON testimonials FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Users update own testimonials"
  ON testimonials FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own testimonials"
  ON testimonials FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can manage all testimonials"
  ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- Cart: Users manage their own
CREATE POLICY "Users manage own cart select"
  ON cart FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cart insert"
  ON cart FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own cart update"
  ON cart FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cart delete"
  ON cart FOR DELETE USING (auth.uid() = user_id);

-- Wishlist: Users manage their own
CREATE POLICY "Users manage own wishlist select"
  ON wishlist FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own wishlist insert"
  ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own wishlist delete"
  ON wishlist FOR DELETE USING (auth.uid() = user_id);

-- Addresses: Users manage their own
CREATE POLICY "Users manage own addresses select"
  ON addresses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own addresses insert"
  ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own addresses update"
  ON addresses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own addresses delete"
  ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Promo Codes: Public read active, authenticated manage
CREATE POLICY "Public can read active promo codes"
  ON promo_codes FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated manage promo codes"
  ON promo_codes FOR ALL USING (auth.role() = 'authenticated');

-- Site Settings: Public read, authenticated manage
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage site settings"
  ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SECTION 5 — INSERT DEFAULT SITE SETTINGS
-- ============================================================

INSERT INTO site_settings (key, value)
VALUES
  ('hero_video_url', ''),
  ('offer_banner', ''),
  ('promo_banners', ''),
  ('products_per_page', '12')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SECTION 6 — CREATE STORAGE BUCKETS
-- ============================================================

-- Product Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Create storage policies for product-images
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ============================================================
-- DONE! Your Kustom Koats database is ready!
-- ============================================================

-- Next Steps:
-- 1. Go to http://localhost:5173/admin
-- 2. Add your first product
-- 3. Products will appear on your website instantly!
