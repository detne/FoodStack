-- Fix orphaned restaurants by creating owner users for them
-- Run this BEFORE 002_multi_restaurant_ownership.sql

BEGIN;

-- Create owner users for restaurants that don't have any users
INSERT INTO users (id, restaurant_id, email, password_hash, full_name, role, status, created_at, updated_at)
SELECT 
    gen_random_uuid()::text,
    r.id,
    r.email,
    '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6', -- password: password123
    CASE 
        WHEN r.name = 'Owner' THEN 'Restaurant Owner'
        ELSE r.name || ' Owner'
    END,
    'OWNER',
    'ACTIVE',
    r.created_at,
    r.updated_at
FROM restaurants r
LEFT JOIN users u ON u.restaurant_id = r.id
WHERE u.id IS NULL
ON CONFLICT (email) DO NOTHING;

-- Verify: Check if all restaurants now have at least one user
SELECT 
    COUNT(*) as orphaned_count
FROM restaurants r
LEFT JOIN users u ON u.restaurant_id = r.id
WHERE u.id IS NULL;

COMMIT;
