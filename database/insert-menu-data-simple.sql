-- =====================================================
-- INSERT MENU DATA FOR USER: quyenptnde180559@fpt.edu.vn
-- Simple version with fixed IDs
-- =====================================================

-- First, check existing user data
SELECT 
    u.id as user_id,
    u.email,
    r.id as restaurant_id,
    b.id as branch_id
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
LEFT JOIN branches b ON r.id = b.restaurant_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn';

-- =====================================================
-- INSERT CATEGORIES (Replace with actual branch_id)
-- =====================================================

-- You need to replace 'YOUR_BRANCH_ID' with the actual branch_id from above query
INSERT INTO categories (
    id,
    branch_id,
    name,
    description,
    sort_order,
    created_at,
    updated_at
) VALUES 
('cat-main-001', 'YOUR_BRANCH_ID', 'Main Courses', 'Hearty main dishes', 1, NOW(), NOW()),
('cat-salad-002', 'YOUR_BRANCH_ID', 'Salads', 'Fresh and healthy salads', 2, NOW(), NOW()),
('cat-dessert-003', 'YOUR_BRANCH_ID', 'Desserts', 'Sweet treats', 3, NOW(), NOW()),
('cat-appetizer-004', 'YOUR_BRANCH_ID', 'Appetizers', 'Light starters', 4, NOW(), NOW()),
('cat-beverage-005', 'YOUR_BRANCH_ID', 'Beverages', 'Drinks', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;-- 
=====================================================
-- INSERT MENU ITEMS
-- =====================================================

-- Main Courses
INSERT INTO menu_items (
    id, category_id, name, description, price, image_url, available, created_at, updated_at
) VALUES 
('menu-main-001', 'cat-main-001', 'Grilled Salmon', 'Fresh Atlantic salmon grilled to perfection', 24.99, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', false, NOW(), NOW()),
('menu-main-002', 'cat-main-001', 'Beef Burger', 'Juicy beef patty with cheese and lettuce', 16.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', false, NOW(), NOW()),
('menu-main-003', 'cat-main-001', 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 18.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', false, NOW(), NOW()),

-- Salads
('menu-salad-001', 'cat-salad-002', 'Caesar Salad', 'Crisp romaine with caesar dressing', 12.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true, NOW(), NOW()),
('menu-salad-002', 'cat-salad-002', 'Greek Salad', 'Fresh vegetables with feta cheese', 14.99, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', true, NOW(), NOW()),

-- Desserts
('menu-dessert-001', 'cat-dessert-003', 'Chocolate Cake', 'Rich chocolate cake with frosting', 8.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', true, NOW(), NOW()),
('menu-dessert-002', 'cat-dessert-003', 'Tiramisu', 'Classic Italian dessert', 9.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', true, NOW(), NOW()),

-- Appetizers
('menu-app-001', 'cat-appetizer-004', 'Bruschetta', 'Toasted bread with tomatoes and basil', 7.99, 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400', true, NOW(), NOW()),
('menu-app-002', 'cat-appetizer-004', 'Chicken Wings', 'Spicy buffalo wings with ranch', 11.99, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', true, NOW(), NOW()),

-- Beverages
('menu-bev-001', 'cat-beverage-005', 'Orange Juice', 'Freshly squeezed orange juice', 4.99, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', true, NOW(), NOW()),
('menu-bev-002', 'cat-beverage-005', 'Iced Coffee', 'Cold brew coffee with milk', 3.99, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;-- ==
===================================================
-- VERIFY DATA
-- =====================================================

-- Check categories
SELECT id, name, sort_order FROM categories WHERE branch_id = 'YOUR_BRANCH_ID' ORDER BY sort_order;

-- Check menu items by category
SELECT 
    c.name as category,
    m.name as item,
    m.price,
    m.available
FROM categories c
JOIN menu_items m ON c.id = m.category_id
WHERE c.branch_id = 'YOUR_BRANCH_ID'
ORDER BY c.sort_order, m.name;

-- =====================================================
-- INSTRUCTIONS:
-- 1. Run the first SELECT to get your branch_id
-- 2. Replace 'YOUR_BRANCH_ID' with the actual branch_id
-- 3. Run the INSERT statements
-- 4. Run the verification queries
-- =====================================================