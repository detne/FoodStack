-- Create a staff user for testing Staff Acknowledge Request functionality
-- Password: password123
-- Properly hashed with bcrypt rounds=12

-- First, ensure we have the test restaurant and branch
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

-- Create staff user with proper password hash
-- Email: staff@restaurant.com
-- Password: password123
-- Hash generated with bcrypt rounds=12
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
    'user-staff-001',
    'rest-test-001',
    'staff@restaurant.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmu3VG',
    'Test Staff Member',
    '0901234568',
    'STAFF',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE 
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmu3VG',
    role = 'STAFF',
    restaurant_id = 'rest-test-001';

-- Create a test table for service requests
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
    'qr-token-simple-001',
    'https://example.com/qr/table-test-001.png',
    'AVAILABLE',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT 'Users created:' as info;
SELECT id, email, full_name, role, status, restaurant_id 
FROM users 
WHERE email IN ('owner@restaurant.com', 'staff@restaurant.com');

SELECT 'Restaurant and branch:' as info;
SELECT r.id as restaurant_id, r.name as restaurant_name, 
       b.id as branch_id, b.name as branch_name
FROM restaurants r
JOIN branches b ON b.restaurant_id = r.id
WHERE r.id = 'rest-test-001';

SELECT 'Table for testing:' as info;
SELECT t.id, t.table_number, t.qr_token, a.name as area_name
FROM tables t
JOIN areas a ON a.id = t.area_id
WHERE t.qr_token = 'qr-token-simple-001';