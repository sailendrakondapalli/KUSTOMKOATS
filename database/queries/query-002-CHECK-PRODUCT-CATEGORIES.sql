-- Check what category names exist in products table
SELECT DISTINCT category, COUNT(*) as product_count
FROM products
GROUP BY category
ORDER BY category;

-- Also check if there are any products at all
SELECT COUNT(*) as total_products FROM products;
