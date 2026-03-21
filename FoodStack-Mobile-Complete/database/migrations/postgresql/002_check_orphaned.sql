-- Check which restaurant is still orphaned
SELECT r.id, r.name, r.email
FROM restaurants r
LEFT JOIN users u ON u.restaurant_id = r.id
WHERE u.id IS NULL;

-- Check if there's email conflict
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
