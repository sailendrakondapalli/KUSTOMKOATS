-- Fix RLS policies for promo_codes - simplified version

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Users can view active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Users can view their own usage" ON promo_code_uses;
DROP POLICY IF EXISTS "System can insert usage" ON promo_code_uses;

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow service role to manage everything (for admin operations)
CREATE POLICY "Service role can manage promo codes" ON promo_codes
  FOR ALL
  USING (true);

-- Allow all authenticated users to read active promo codes
CREATE POLICY "Anyone can view active promo codes" ON promo_codes
  FOR SELECT
  USING (is_active = TRUE);

-- Allow users to view their own promo code usage
CREATE POLICY "Users can view their own usage" ON promo_code_uses
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Allow inserting usage records (for tracking)
CREATE POLICY "Anyone can insert usage" ON promo_code_uses
  FOR INSERT
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON promo_codes TO authenticated;
GRANT ALL ON promo_codes TO anon;
GRANT ALL ON promo_code_uses TO authenticated;
GRANT ALL ON promo_code_uses TO anon;
