-- E-Way Bill Configuration Table
CREATE TABLE IF NOT EXISTS eway_bill_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_gstin TEXT NOT NULL,
  seller_trade_name TEXT NOT NULL,
  seller_address_1 TEXT NOT NULL,
  seller_address_2 TEXT,
  seller_place TEXT NOT NULL,
  seller_pincode TEXT NOT NULL,
  seller_state_code INTEGER NOT NULL,
  
  -- API Credentials (encrypted in production)
  api_username TEXT NOT NULL,
  api_password TEXT NOT NULL,
  
  -- Default values
  default_hsn_code TEXT DEFAULT '3208',
  cgst_rate DECIMAL(5,2) DEFAULT 9.00,
  sgst_rate DECIMAL(5,2) DEFAULT 9.00,
  transporter_id TEXT,
  transporter_name TEXT,
  trans_mode TEXT DEFAULT '1', -- 1=Road, 2=Rail, 3=Air, 4=Ship
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E-Way Bill Records Table
CREATE TABLE IF NOT EXISTS eway_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- E-Way Bill details
  ewb_no TEXT UNIQUE NOT NULL,
  ewb_date TIMESTAMPTZ NOT NULL,
  valid_upto TIMESTAMPTZ,
  
  -- Document details
  doc_type TEXT DEFAULT 'INV',
  doc_no TEXT NOT NULL,
  doc_date DATE NOT NULL,
  
  -- Parties
  from_gstin TEXT NOT NULL,
  from_trade_name TEXT NOT NULL,
  to_gstin TEXT NOT NULL,
  to_trade_name TEXT NOT NULL,
  
  -- Transport
  transporter_id TEXT,
  transporter_name TEXT,
  vehicle_no TEXT,
  trans_doc_no TEXT,
  trans_mode TEXT,
  
  -- Values
  total_value DECIMAL(12,2) NOT NULL,
  cgst_value DECIMAL(12,2) DEFAULT 0,
  sgst_value DECIMAL(12,2) DEFAULT 0,
  igst_value DECIMAL(12,2) DEFAULT 0,
  total_inv_value DECIMAL(12,2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, cancelled
  cancel_date TIMESTAMPTZ,
  cancel_reason TEXT,
  
  -- API Response
  api_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_eway_bills_order_id ON eway_bills(order_id);
CREATE INDEX idx_eway_bills_ewb_no ON eway_bills(ewb_no);
CREATE INDEX idx_eway_bills_status ON eway_bills(status);
CREATE INDEX idx_eway_bills_created_at ON eway_bills(created_at DESC);

-- RLS Policies (admin only access)
ALTER TABLE eway_bill_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE eway_bills ENABLE ROW LEVEL SECURITY;

-- Only allow admin access (you'll need to implement admin role checking)
CREATE POLICY "Admin can manage e-way bill config"
  ON eway_bill_config
  FOR ALL
  USING (true);

CREATE POLICY "Admin can manage e-way bills"
  ON eway_bills
  FOR ALL
  USING (true);

-- Add e-way bill column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eway_bill_no TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eway_bill_date TIMESTAMPTZ;

-- Comments
COMMENT ON TABLE eway_bill_config IS 'E-Way Bill API configuration and seller details';
COMMENT ON TABLE eway_bills IS 'Generated E-Way Bill records';
COMMENT ON COLUMN eway_bills.status IS 'active, cancelled';
COMMENT ON COLUMN eway_bills.trans_mode IS '1=Road, 2=Rail, 3=Air, 4=Ship';
