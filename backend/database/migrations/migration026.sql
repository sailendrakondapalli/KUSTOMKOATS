-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC DEFAULT 0,
  applicable_category TEXT,
  is_one_time BOOLEAN DEFAULT FALSE,
  max_uses INTEGER,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create promo_code_uses table to track usage
CREATE TABLE IF NOT EXISTS promo_code_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID,
  order_id UUID,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_user ON promo_code_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_code ON promo_code_uses(code_id);

-- Add RLS policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage promo codes
CREATE POLICY "Admins can manage promo codes" ON promo_codes
  FOR ALL
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Allow all authenticated users to read active promo codes
CREATE POLICY "Users can view active promo codes" ON promo_codes
  FOR SELECT
  USING (is_active = TRUE);

-- Allow users to view their own promo code usage
CREATE POLICY "Users can view their own usage" ON promo_code_uses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow system to insert usage records
CREATE POLICY "System can insert usage" ON promo_code_uses
  FOR INSERT
  WITH CHECK (TRUE);

-- Add updated_at trigger for promo_codes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_promo_codes_updated_at 
  BEFORE UPDATE ON promo_codes 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample promo codes (optional - for testing)
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, description, is_active)
VALUES 
  ('WELCOME10', 'percentage', 10, 0, 'Welcome discount - 10% off', TRUE),
  ('SAVE100', 'fixed', 100, 1000, 'Get ₹100 off on orders above ₹1000', TRUE),
  ('FIRSTBUY', 'percentage', 15, 0, 'First purchase discount - 15% off', TRUE)
ON CONFLICT (code) DO NOTHING;
