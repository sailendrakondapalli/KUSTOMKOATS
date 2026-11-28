-- Migration 039: ACID Transaction RPC Functions
-- Creates PostgreSQL functions called via supabase.rpc() for atomic operations.
-- These run inside a single transaction — partial failures automatically ROLLBACK.

-- ─────────────────────────────────────────────────────────────
-- 1. create_order_atomic
--    Creates order row + order_items in one transaction.
--    Decrements product stock atomically.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_user_id          UUID,
  p_items            JSONB,       -- [{ product_id, quantity, price, name }]
  p_total_amount     NUMERIC,
  p_discount_amount  NUMERIC DEFAULT 0,
  p_shipping_address JSONB   DEFAULT NULL,
  p_payment_method   TEXT    DEFAULT 'razorpay',
  p_promo_code       TEXT    DEFAULT NULL,
  p_display_order_id TEXT    DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order        orders%ROWTYPE;
  v_item         JSONB;
  v_product_id   UUID;
  v_quantity     INT;
  v_price        NUMERIC;
  v_stock        INT;
BEGIN
  -- Validate stock for all items first (fail fast before writing anything)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    SELECT stock INTO v_stock
    FROM products
    WHERE id = v_product_id AND status = 'Active'
    FOR UPDATE;  -- lock the row

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found or inactive', v_product_id;
    END IF;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %',
        v_product_id, v_stock, v_quantity;
    END IF;
  END LOOP;

  -- Insert order
  INSERT INTO orders (
    user_id, total_amount, discount_amount,
    shipping_address, payment_method,
    promo_code, display_order_id,
    order_status, payment_status
  )
  VALUES (
    p_user_id, p_total_amount, p_discount_amount,
    p_shipping_address, p_payment_method,
    p_promo_code, COALESCE(p_display_order_id, 'KK-' || upper(to_hex(extract(epoch from now())::int))),
    'pending', 'pending'
  )
  RETURNING * INTO v_order;

  -- Insert order_items and decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;
    v_price      := (v_item->>'price')::NUMERIC;

    INSERT INTO order_items (order_id, product_id, quantity, price, name)
    VALUES (
      v_order.id,
      v_product_id,
      v_quantity,
      v_price,
      v_item->>'name'
    );

    UPDATE products
    SET stock = stock - v_quantity,
        updated_at = NOW()
    WHERE id = v_product_id;
  END LOOP;

  RETURN row_to_json(v_order)::JSONB;

EXCEPTION
  WHEN OTHERS THEN
    -- Transaction auto-rolls back; re-raise for caller
    RAISE;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 2. apply_promo_code
--    Validates promo, enforces usage limit, increments counter —
--    all in a single transaction to prevent race conditions.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION apply_promo_code(
  p_code        TEXT,
  p_user_id     UUID,
  p_order_total NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo        promo_codes%ROWTYPE;
  v_discount     NUMERIC := 0;
  v_final_total  NUMERIC;
BEGIN
  -- Lock the promo row to prevent concurrent double-use
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = upper(trim(p_code))
    AND is_active = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'discount_amount', 0,
      'final_total', p_order_total,
      'error', 'Invalid or inactive promo code'
    );
  END IF;

  -- Expiry check
  IF v_promo.valid_until IS NOT NULL AND NOW() > v_promo.valid_until THEN
    RETURN jsonb_build_object(
      'discount_amount', 0,
      'final_total', p_order_total,
      'error', 'Promo code has expired'
    );
  END IF;

  -- Minimum order check
  IF v_promo.min_order_amount IS NOT NULL AND p_order_total < v_promo.min_order_amount THEN
    RETURN jsonb_build_object(
      'discount_amount', 0,
      'final_total', p_order_total,
      'error', format('Minimum order amount is ₹%s', v_promo.min_order_amount)
    );
  END IF;

  -- Usage limit check
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN jsonb_build_object(
      'discount_amount', 0,
      'final_total', p_order_total,
      'error', 'Promo code usage limit reached'
    );
  END IF;

  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_discount := (p_order_total * v_promo.discount_value) / 100;
    IF v_promo.max_discount IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_promo.max_discount);
    END IF;
  ELSE
    v_discount := v_promo.discount_value;
  END IF;

  v_discount    := LEAST(v_discount, p_order_total); -- can't discount more than total
  v_final_total := GREATEST(0, p_order_total - v_discount);

  -- Increment usage atomically
  UPDATE promo_codes
  SET usage_count = usage_count + 1,
      updated_at  = NOW()
  WHERE id = v_promo.id;

  RETURN jsonb_build_object(
    'discount_amount', v_discount,
    'final_total',     v_final_total,
    'promo_id',        v_promo.id
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Grant execution to authenticated role
GRANT EXECUTE ON FUNCTION create_order_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION apply_promo_code    TO authenticated, service_role;

DO $$
BEGIN
  RAISE NOTICE 'Migration 039 complete: ACID RPC functions created (create_order_atomic, apply_promo_code)';
END $$;
