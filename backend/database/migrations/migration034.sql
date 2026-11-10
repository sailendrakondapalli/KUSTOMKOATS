-- Migration 034: Payment Failures Tracking Table
-- Track all Razorpay payment failures for admin monitoring and analysis

-- Create payment_failures table
CREATE TABLE IF NOT EXISTS payment_failures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Order & Payment Details
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  
  -- Customer Details
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  
  -- Failure Details
  error_code TEXT,
  error_description TEXT,
  error_source TEXT, -- 'customer', 'bank', 'razorpay', etc.
  error_step TEXT, -- 'authentication', 'authorization', 'capture', etc.
  error_reason TEXT, -- 'insufficient_funds', 'card_declined', 'authentication_failed', etc.
  
  -- Payment Attempt Metadata
  payment_method TEXT, -- 'card', 'netbanking', 'upi', 'wallet', etc.
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Additional Context
  metadata JSONB DEFAULT '{}', -- Store full Razorpay error object
  customer_ip TEXT,
  user_agent TEXT,
  
  -- Timestamps
  failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Admin Actions
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_failures_order_id ON payment_failures(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_failures_user_id ON payment_failures(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_failures_razorpay_order_id ON payment_failures(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_failures_failed_at ON payment_failures(failed_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_failures_error_code ON payment_failures(error_code);
CREATE INDEX IF NOT EXISTS idx_payment_failures_reviewed ON payment_failures(reviewed);
CREATE INDEX IF NOT EXISTS idx_payment_failures_customer_email ON payment_failures(customer_email);

-- Enable Row Level Security
ALTER TABLE payment_failures ENABLE ROW LEVEL SECURITY;

-- Admin can see all payment failures
CREATE POLICY "Admins can view all payment failures"
  ON payment_failures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update payment failures (mark as reviewed, add notes)
CREATE POLICY "Admins can update payment failures"
  ON payment_failures FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System can insert payment failures (via service role)
CREATE POLICY "Service role can insert payment failures"
  ON payment_failures FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Verify the table was created
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_failures'
ORDER BY ordinal_position;

