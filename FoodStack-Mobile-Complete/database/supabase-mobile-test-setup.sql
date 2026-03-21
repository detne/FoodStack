-- =====================================================
-- SUPABASE MOBILE TEST SETUP
-- Chạy script này trực tiếp trong Supabase SQL Editor
-- =====================================================

-- Xóa dữ liệu test cũ nếu có (theo thứ tự đúng để tránh foreign key constraint)
DELETE FROM menu_items WHERE category_id = 'mobile-test-category';
DELETE FROM categories WHERE id = 'mobile-test-category';
DELETE FROM tables WHERE area_id = 'mobile-test-area';
DELETE FROM areas WHERE id = 'mobile-test-area';
DELETE FROM branches WHERE id = 'mobile-test-branch';
DELETE FROM users WHERE email LIKE '%@mobile.test';
DELETE FROM restaurants WHERE id = 'mobile-test-restaurant';

-- 1. Tạo owner user trước (để làm owner_id cho restaurant)
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    status,
    restaurant_id,
    created_at, 
    updated_at
) VALUES (
    'mobile-owner-001',
    'owner@mobile.test',
    '$2b$12$LQv3c1yqBw2fyuQjSeLf6.9khjGu5oUjG/.H19K8M/r2SanWkTBCe',
    'Mobile Restaurant Owner',
    '+84902222222',
    'RESTAURANT_OWNER',
    'ACTIVE',
    NULL,  -- Sẽ update sau khi tạo restaurant
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 2. Tạo restaurant test với owner_id đã có
INSERT INTO restaurants (
    id, 
    owner_id,
    name, 
    email, 
    phone, 
    address, 
    email_verified,
    created_at, 
    updated_at
) VALUES (
    'mobile-test-restaurant',
    'mobile-owner-001',
    'Mobile Test Restaurant',
    'restaurant@mobile.test',
    '+84901234567',
    '123 Test Street, Ho Chi Minh City',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 3. Update owner user với restaurant_id
UPDATE users 
SET restaurant_id = 'mobile-test-restaurant' 
WHERE id = 'mobile-owner-001';

-- 4. Tạo các users còn lại
-- Admin User
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    status,
    restaurant_id,
    created_at, 
    updated_at
) VALUES (
    'mobile-admin-001',
    'admin@mobile.test',
    '$2b$12$LQv3c1yqBw2fyuQjSeLf6.9khjGu5oUjG/.H19K8M/r2SanWkTBCe',
    'Mobile Admin',
    '+84901111111',
    'ADMIN',
    'ACTIVE',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Manager
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    status,
    restaurant_id,
    created_at, 
    updated_at
) VALUES (
    'mobile-manager-001',
    'manager@mobile.test',
    '$2b$12$LQv3c1yqBw2fyuQjSeLf6.9khjGu5oUjG/.H19K8M/r2SanWkTBCe',
    'Mobile Manager',
    '+84903333333',
    'MANAGER',
    'ACTIVE',
    'mobile-test-restaurant',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Staff
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    status,
    restaurant_id,
    created_at, 
    updated_at
) VALUES (
    'mobile-staff-001',
    'staff@mobile.test',
    '$2b$12$LQv3c1yqBw2fyuQjSeLf6.9khjGu5oUjG/.H19K8M/r2SanWkTBCe',
    'Mobile Staff',
    '+84904444444',
    'STAFF',
    'ACTIVE',
    'mobile-test-restaurant',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Customer
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    status,
    restaurant_id,
    created_at, 
    updated_at
) VALUES (
    'mobile-customer-001',
    'customer@mobile.test',
    '$2b$12$LQv3c1yqBw2fyuQjSeLf6.9khjGu5oUjG/.H19K8M/r2SanWkTBCe',
    'Mobile Customer',
    '+84905555555',
    'CUSTOMER',
    'ACTIVE',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 5. Tạo branch test
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
    'mobile-test-branch',
    'mobile-test-restaurant',
    'Main Branch',
    '123 Test Street, Ho Chi Minh City',
    '+84901234567',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 6. Tạo area test
INSERT INTO areas (
    id,
    branch_id,
    name,
    sort_order,
    created_at,
    updated_at
) VALUES (
    'mobile-test-area',
    'mobile-test-branch',
    'Main Hall',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 7. Tạo table với QR token
INSERT INTO tables (
    id,
    area_id,
    table_number,
    capacity,
    qr_token,
    status,
    created_at,
    updated_at
) VALUES (
    'mobile-test-table-001',
    'mobile-test-area',
    'T01',
    4,
    'mobile-test-qr-123',
    'AVAILABLE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 8. Tạo category test
INSERT INTO categories (
    id,
    branch_id,
    name,
    description,
    sort_order,
    created_at,
    updated_at
) VALUES (
    'mobile-test-category',
    'mobile-test-branch',
    'Mobile Test Dishes',
    'Test dishes for mobile app',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 9. Tạo menu items test
INSERT INTO menu_items (
    id,
    category_id,
    name,
    description,
    price,
    available,
    created_at,
    updated_at
) VALUES 
(
    'mobile-test-item-001',
    'mobile-test-category',
    'Test Pho Bo',
    'Delicious beef noodle soup for testing',
    85000,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'mobile-test-item-002',
    'mobile-test-category',
    'Test Com Tam',
    'Broken rice with grilled pork for testing',
    65000,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Hiển thị users đã tạo
SELECT 
    '=== MOBILE TEST USERS CREATED ===' as info,
    email,
    '123456' as password,
    role,
    status
FROM users 
WHERE email LIKE '%@mobile.test'
ORDER BY 
    CASE role
        WHEN 'ADMIN' THEN 1
        WHEN 'RESTAURANT_OWNER' THEN 2
        WHEN 'MANAGER' THEN 3
        WHEN 'STAFF' THEN 4
        WHEN 'CUSTOMER' THEN 5
    END;

-- Hiển thị QR token test
SELECT 
    '=== QR TOKEN FOR TESTING ===' as info,
    qr_token,
    table_number,
    'Use this token in mobile app QR scanner' as note
FROM tables 
WHERE qr_token = 'mobile-test-qr-123';

-- Hiển thị menu items
SELECT 
    '=== TEST MENU ITEMS ===' as info,
    name,
    price,
    'Available for ordering' as note
FROM menu_items 
WHERE category_id = 'mobile-test-category';

-- Test password hash (để verify)
SELECT 
    '=== PASSWORD VERIFICATION ===' as info,
    email,
    CASE 
        WHEN password_hash = '$2b$12$LQv3c1yqBw2fyuQjSeLf6.9khjGu5oUjG/.H19K8M/r2SanWkTBCe' 
        THEN 'CORRECT HASH' 
        ELSE 'WRONG HASH' 
    END as hash_status
FROM users 
WHERE email = 'admin@mobile.test';