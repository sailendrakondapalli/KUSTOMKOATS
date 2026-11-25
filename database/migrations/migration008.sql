-- Fix expired promo codes by removing expiry dates

-- Option 1: Remove expiry dates from all active codes (set to NULL = no expiry)
UPDATE promo_codes 
SET expires_at = NULL 
WHERE is_active = TRUE;

-- Option 2: Or update specific codes to extend expiry to future date (1 year from now)
-- UPDATE promo_codes 
-- SET expires_at = NOW() + INTERVAL '1 year'
-- WHERE is_active = TRUE;

-- View all promo codes with their status
SELECT 
  code,
  discount_type,
  discount_value,
  is_active,
  expires_at,
  CASE 
    WHEN expires_at IS NULL THEN 'Never expires'
    WHEN expires_at > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as expiry_status
FROM promo_codes
ORDER BY created_at DESC;
