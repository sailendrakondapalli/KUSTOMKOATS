-- Check actual status values in products table
SELECT status, COUNT(*) as count
FROM products
GROUP BY status;

-- Check if any products have 'active' status
SELECT COUNT(*) as active_products
FROM products
WHERE status = 'active';

-- Check products with Xtreme Kolorz category
SELECT id, name, category, status
FROM products
WHERE category = 'Xtreme Kolorz'
LIMIT 5;
