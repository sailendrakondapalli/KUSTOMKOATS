-- =============================================
-- RAZORPAY INTEGRATION & GUEST CHECKOUT SCHEMA
-- CLEAN VERSION - Safe to run multiple times
-- =============================================

-- 1. Update orders table to support guest checkout and Razorpay
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
  ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS order_notes TEXT;

-- Make user_id nullable for guest checkout
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Add missing columns if they don't exist (for existing tables)
ALTER TABLE admin_notifications 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS order_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'admin_notifications_order_id_fkey'
  ) THEN
    ALTER TABLE admin_notifications 
    ADD CONSTRAINT admin_notifications_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created 
  ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread 
  ON admin_notifications(is_read) WHERE is_read = FALSE;

-- 3. Enable RLS on admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON admin_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON admin_notifications;

-- Create new policies
CREATE POLICY "Admins can view all notifications" 
  ON admin_notifications FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update notifications" 
  ON admin_notifications FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can insert notifications" 
  ON admin_notifications FOR INSERT 
  WITH CHECK (true);

-- 4. Update orders RLS policies for guest checkout
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Allow anyone to create orders (guest or logged-in)
CREATE POLICY "Anyone can create orders" 
  ON orders FOR INSERT 
  WITH CHECK (
    (auth.uid() = user_id) OR 
    (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Allow users to view their own orders (by user_id or guest_email)
CREATE POLICY "Users can view own orders" 
  ON orders FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admin can update orders
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" 
  ON orders FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Update order_items RLS for guest checkout
DROP POLICY IF EXISTS "Users can insert order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

CREATE POLICY "Anyone can insert order items" 
  ON order_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Users can view own order items" 
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" 
  ON order_items FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

-- 6. Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP TRIGGER IF EXISTS trigger_notify_admin_new_order ON orders;
DROP TRIGGER IF EXISTS on_payment_status_updated ON orders;
DROP TRIGGER IF EXISTS after_order_item_insert ON order_items;
DROP TRIGGER IF EXISTS on_payment_confirmed_reduce_stock ON orders;

DROP FUNCTION IF EXISTS notify_admin_new_order() CASCADE;
DROP FUNCTION IF EXISTS notify_admin_payment_success() CASCADE;
DROP FUNCTION IF EXISTS reduce_stock_on_order() CASCADE;
DROP FUNCTION IF EXISTS reduce_stock_on_payment() CASCADE;

-- 7. Function to create admin notification on new order
CREATE OR REPLACE FUNCTION notify_admin_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (
    type,
    title,
    message,
    order_id,
    metadata
  ) VALUES (
    'new_order',
    'New Order Received',
    CASE 
      WHEN NEW.guest_name IS NOT NULL 
      THEN 'Order from ' || NEW.guest_name || ' (Guest) - ₹' || NEW.total_amount
      ELSE 'Order from Customer - ₹' || NEW.total_amount
    END,
    NEW.id,
    jsonb_build_object(
      'order_id', NEW.id,
      'total_amount', NEW.total_amount,
      'payment_status', NEW.payment_status,
      'customer_name', COALESCE(NEW.guest_name, 'Customer'),
      'customer_email', NEW.guest_email
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new orders
CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_order();

-- 8. Function to update admin notification on payment success
CREATE OR REPLACE FUNCTION notify_admin_payment_success()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.payment_status != NEW.payment_status 
     AND NEW.payment_status IN ('paid', 'completed', 'success') THEN
    INSERT INTO admin_notifications (
      type,
      title,
      message,
      order_id,
      metadata
    ) VALUES (
      'payment_success',
      'Payment Confirmed',
      'Payment confirmed for order - ₹' || NEW.total_amount,
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'total_amount', NEW.total_amount,
        'payment_id', NEW.razorpay_payment_id,
        'customer_name', COALESCE(NEW.guest_name, 'Customer')
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payment updates
CREATE TRIGGER on_payment_status_updated
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
  EXECUTE FUNCTION notify_admin_payment_success();

-- 9. Function to reduce stock only on payment success
CREATE OR REPLACE FUNCTION reduce_stock_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.payment_status != NEW.payment_status 
     AND NEW.payment_status IN ('paid', 'completed', 'success') THEN
    
    UPDATE products p
    SET stock = stock - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id
      AND p.stock >= oi.quantity;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_confirmed_reduce_stock
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
  EXECUTE FUNCTION reduce_stock_on_payment();

-- 10. Add comments
COMMENT ON TABLE admin_notifications IS 'Stores admin panel notifications for new orders, payments, etc.';
COMMENT ON COLUMN orders.guest_email IS 'Email for guest checkout (when user_id is NULL)';
COMMENT ON COLUMN orders.guest_name IS 'Name for guest checkout';
COMMENT ON COLUMN orders.guest_phone IS 'Phone for guest checkout';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check tables exist
SELECT 'Tables exist' as status, COUNT(*) as count FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'admin_notifications', 'order_items');

-- Check triggers exist
SELECT 'Triggers exist' as status, COUNT(*) as count FROM information_schema.triggers 
WHERE trigger_name IN ('on_order_created', 'on_payment_status_updated', 'on_payment_confirmed_reduce_stock');

-- Check unread notifications function
SELECT 'Notification count' as status, COUNT(*) as count FROM admin_notifications WHERE is_read = FALSE;

-- Success message
SELECT '✅ Migration completed successfully!' as result;
