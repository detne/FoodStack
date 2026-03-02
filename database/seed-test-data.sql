-- =====================================================
-- SEED TEST DATA FOR LOGIN API
-- Compatible with actual Supabase schema
-- =====================================================

-- 1. Create test restaurant
INSERT INTO restaurants (
    id,
    name,
    email,
    phone,
    address,
    email_verified,
    email_verified_at,
    created_at,
    updated_at
) VALUES (
    'rest-test-001',
    'Test Restaurant',
    'contact@testrestaurant.com',
    '0901234567',
    '123 Test Street, Ho Chi Minh City, Vietnam',
    true,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create test user (Owner)
-- Email: owner@restaurant.com
-- Password: password123
-- Hashed: $2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6
INSERT INTO users (
    id,
    restaurant_id,
    email,
    password_hash,
    full_name,
    phone,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    'user-test-001',
    'rest-test-001',
    'owner@restaurant.com',
    '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6',
    'Test Owner',
    '0901234567',
    'OWNER',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6';

-- 3. Create test branch
INSERT INTO branches (
    id,
    restaurant_id,
    name,
    address,
    phone,
    status,
    created_at,
    updated_at
) VALUES (
    'branch-test-001',
    'rest-test-001',
    'Main Branch',
    '123 Test Street, Ho Chi Minh City, Vietnam',
    '0901234567',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Create test area
INSERT INTO areas (
    id,
    branch_id,
    name,
    sort_order,
    created_at,
    updated_at
) VALUES (
    'area-test-001',
    'branch-test-001',
    'Main Floor',
    1,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Create test table
INSERT INTO tables (
    id,
    area_id,
    table_number,
    capacity,
    qr_token,
    qr_code_url,
    status,
    created_at,
    updated_at
) VALUES (
    'table-test-001',
    'area-test-001',
    'T01',
    4,
    'qr-token-test-001',
    'https://example.com/qr/table-test-001.png',
    'AVAILABLE',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFY DATA
-- =====================================================

-- Check restaurant
SELECT id, name, email, email_verified 
FROM restaurants 
WHERE id = 'rest-test-001';

-- Check user
SELECT id, email, full_name, role, status 
FROM users 
WHERE email = 'owner@restaurant.com';

-- Check branch
SELECT id, name, status 
FROM branches 
WHERE id = 'branch-test-001';

-- Check area
SELECT id, name 
FROM areas 
WHERE id = 'area-test-001';

-- Check table
SELECT id, table_number, status 
FROM tables 
WHERE id = 'table-test-001';

-- =====================================================
-- TEST CREDENTIALS
-- =====================================================
-- Email: owner@restaurant.com
-- Password: password123
-- =====================================================
