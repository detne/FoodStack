-- =====================================================
-- ADD CUSTOMER TEST ACCOUNT
-- Description: Thêm tài khoản customer để test mobile app
-- Usage: psql -U postgres -d foodstack -f database/add-customer-account.sql
-- =====================================================

-- Tạo customer user (không cần restaurant_id)
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
    'user-customer-001',
    NULL,  -- Customer không thuộc restaurant nào
    'customer@test.com',
    '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6', -- password123
    'Test Customer',
    '0987654321',
    'CUSTOMER',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6',
    full_name = 'Test Customer',
    phone = '0987654321',
    role = 'CUSTOMER',
    status = 'ACTIVE',
    updated_at = NOW();

-- Thêm thêm một customer nữa
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
    'user-customer-002',
    NULL,
    'user@foodstack.com',
    '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6', -- password123
    'John Doe',
    '0123456789',
    'CUSTOMER',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = '$2a$12$ulMCYlhFG/Vcgm18QGKatuZq.ZorRgYDbg5dhu3S5AU2IhRE0sAg6',
    full_name = 'John Doe',
    phone = '0123456789',
    role = 'CUSTOMER',
    status = 'ACTIVE',
    updated_at = NOW();

-- Verify tài khoản đã được tạo
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    restaurant_id
FROM users 
WHERE role = 'CUSTOMER'
ORDER BY created_at DESC;

-- =====================================================
-- TEST CREDENTIALS SUMMARY
-- =====================================================
-- 
-- RESTAURANT OWNER:
-- Email: owner@restaurant.com
-- Password: password123
-- 
-- CUSTOMERS:
-- Email: customer@test.com
-- Password: password123
-- 
-- Email: user@foodstack.com  
-- Password: password123
-- 
-- =====================================================