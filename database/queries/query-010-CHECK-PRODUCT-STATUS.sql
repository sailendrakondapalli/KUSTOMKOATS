SELECT status, COUNT(*) as count
FROM products
GROUP BY status;
