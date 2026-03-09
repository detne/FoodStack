-- Fix the last orphaned restaurant with unique email
BEGIN;

-- Create owner for the remaining orphaned restaurant with unique email
INSERT INTO users (id, restaurant_id, email, password_hash, full_name, role, status, created_at, updated_at)
VALUES (
    gen_random_uuid()::text,
    '30978285-cda6-457a-a358-2d25396242ab',
    'newrestaurant.owner@gmail.com',
    '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6', -- password: password123
    'New Restaurant Owner',
    'OWNER',
    'ACTIVE',
    NOW(),
    NOW()
);

-- Verify no more orphaned restaurants
SELECT 
    COUNT(*) as remaining_orphaned
FROM restaurants r
LEFT JOIN users u ON u.restaurant_id = r.id
WHERE u.id IS NULL;

COMMIT;