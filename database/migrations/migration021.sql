-- POS Sales Setup
-- This allows the orders table to handle both online and POS sales

-- Add order_type column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'online';

-- Add index for faster POS queries
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);

-- Create a view for POS sales (makes it easier to query)
CREATE OR REPLACE VIEW pos_sales AS
SELECT 
  id,
  display_order_id,
  guest_name AS customer_name,
  guest_phone AS customer_phone,
  total_amount,
  payment_method,
  payment_status,
  order_status,
  created_at
FROM orders
WHERE order_type = 'pos_sale';

-- Update existing orders to mark them as 'online'
UPDATE orders 
SET order_type = 'online' 
WHERE order_type IS NULL;

-- Comment: POS sales will be inserted directly into orders table with order_type='pos_sale'
