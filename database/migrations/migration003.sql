-- Check Pending Payments
-- Run this in Supabase SQL Editor to find orders stuck in pending status

-- 1. Find all pending orders created in last 24 hours
SELECT 
  id,
  display_order_id,
  created_at,
  total_amount,
  payment_status,
  payment_method,
  razorpay_order_id,
  razorpay_payment_id,
  guest_email,
  guest_name
FROM orders
WHERE payment_status = 'pending'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 2. Count pending orders by time
SELECT 
  CASE 
    WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 'Last 1 hour'
    WHEN created_at >= NOW() - INTERVAL '6 hours' THEN 'Last 6 hours'
    WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 'Last 24 hours'
    ELSE 'Older than 24 hours'
  END as time_range,
  COUNT(*) as pending_count,
  SUM(total_amount) as total_amount_pending
FROM orders
WHERE payment_status = 'pending'
GROUP BY time_range
ORDER BY 
  CASE time_range
    WHEN 'Last 1 hour' THEN 1
    WHEN 'Last 6 hours' THEN 2
    WHEN 'Last 24 hours' THEN 3
    ELSE 4
  END;

-- 3. Find orders that might have been paid (have razorpay_payment_id but still pending)
SELECT 
  id,
  display_order_id,
  created_at,
  total_amount,
  payment_status,
  razorpay_order_id,
  razorpay_payment_id
FROM orders
WHERE payment_status = 'pending'
  AND razorpay_payment_id IS NOT NULL
ORDER BY created_at DESC;

-- 4. MANUAL FIX: Update a specific order to paid (use with caution!)
-- Uncomment and replace 'order_xxx' with actual razorpay_order_id
/*
UPDATE orders 
SET 
  payment_status = 'paid', 
  order_status = 'confirmed',
  updated_at = NOW()
WHERE razorpay_order_id = 'order_xxx'
RETURNING id, display_order_id, payment_status, order_status;
*/
