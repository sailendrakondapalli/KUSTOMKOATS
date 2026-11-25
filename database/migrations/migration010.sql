-- Fix POS Transactions to Show in All Transactions Page
-- Run this in Supabase SQL Editor

-- Step 1: Add order_type column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'online';

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);

-- Step 3: Update existing orders to mark them as 'online' if null
UPDATE orders 
SET order_type = 'online' 
WHERE order_type IS NULL;

-- Step 4: IMPORTANT - If you have old POS sales in a 'pos_sales' table, migrate them
-- Skip this if you don't have a pos_sales table
DO $$
BEGIN
  -- Check if pos_sales table exists
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'pos_sales'
  ) THEN
    -- Migrate old pos_sales to orders table
    INSERT INTO orders (
      total_amount,
      payment_method,
      payment_status,
      order_status,
      guest_name,
      guest_phone,
      guest_email,
      address,
      order_type,
      razorpay_payment_id,
      razorpay_order_id,
      created_at,
      updated_at
    )
    SELECT 
      total_amount,
      payment_method,
      payment_status,
      order_status,
      guest_name,
      guest_phone,
      guest_email,
      address,
      'pos_sale' as order_type,
      razorpay_payment_id,
      razorpay_order_id,
      created_at,
      updated_at
    FROM pos_sales
    WHERE NOT EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.created_at = pos_sales.created_at 
      AND o.guest_name = pos_sales.guest_name
      AND o.total_amount = pos_sales.total_amount
    );
    
    RAISE NOTICE 'Migrated POS sales to orders table';
  ELSE
    RAISE NOTICE 'No pos_sales table found, skipping migration';
  END IF;
END $$;

-- Step 5: Verify the setup
SELECT 
  order_type,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders
GROUP BY order_type
ORDER BY order_type;

-- You should see:
-- order_type | count | total_revenue
-- -----------+-------+--------------
-- online     | XX    | XXXX
-- pos_sale   | XX    | XXXX (if you have POS sales)
