-- Update all products to have 'active' status if they're NULL or empty
UPDATE products
SET status = 'active'
WHERE status IS NULL OR status = '';

-- Verify the update
SELECT status, COUNT(*) as count
FROM products
GROUP BY status;
