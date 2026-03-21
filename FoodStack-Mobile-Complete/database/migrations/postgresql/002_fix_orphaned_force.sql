-- Force fix orphaned restaurants with unique emails
BEGIN;

-- Create owner users for orphaned restaurants with unique email
INSERT INTO users (id, restaurant_id, email, password_hash, full_name, role, status, created_at, updated_at)
SELECT 
    gen_random_uuid()::text,
    r.id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM users WHERE email = r.email) 
        THEN 'owner+' || SUBSTRING(r.id, 1, 8) || '@' || SPLIT_PART(r.email, '@', 2)
        ELSE r.email
    END,
    '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6',
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
WHERE u.id IS NULL;

-- Verify
SELECT 
    COUNT(*) as remaining_orphaned
FROM restaurants r
LEFT JOIN users u ON u.restaurant_id = r.id
WHERE u.id IS NULL;

COMMIT;
