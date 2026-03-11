-- Quick insert menu data for current user
-- Step 1: Find your branch_id
SELECT 
    u.email,
    b.id as branch_id,
    b.name as branch_name
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
JOIN branches b ON r.id = b.restaurant_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn';

-- Step 2: Copy the branch_id from above and use it below
-- Replace 'PASTE_BRANCH_ID_HERE' with your actual branch_id

-- Insert categories
INSERT INTO categories (id, branch_id, name, description, sort_order, created_at, updated_at) VALUES 
('cat-001', 'PASTE_BRANCH_ID_HERE', 'Main Courses', 'Main dishes', 1, NOW(), NOW()),
('cat-002', 'PASTE_BRANCH_ID_HERE', 'Salads', 'Fresh salads', 2, NOW(), NOW()),
('cat-003', 'PASTE_BRANCH_ID_HERE', 'Desserts', 'Sweet treats', 3, NOW(), NOW()),
('cat-004', 'PASTE_BRANCH_ID_HERE', 'Appetizers', 'Starters', 4, NOW(), NOW()),
('cat-005', 'PASTE_BRANCH_ID_HERE', 'Beverages', 'Drinks', 5, NOW(), NOW());

-- Insert menu items
INSERT INTO menu_items (id, category_id, name, description, price, available, created_at, updated_at) VALUES 
-- Main Courses
('item-001', 'cat-001', 'Grilled Salmon', 'Fresh salmon with herbs', 24.99, false, NOW(), NOW()),
('item-002', 'cat-001', 'Beef Burger', 'Juicy beef burger', 16.99, false, NOW(), NOW()),
('item-003', 'cat-001', 'Pasta Carbonara', 'Creamy pasta', 18.99, false, NOW(), NOW()),
-- Salads  
('item-004', 'cat-002', 'Caesar Salad', 'Classic caesar', 12.99, true, NOW(), NOW()),
('item-005', 'cat-002', 'Greek Salad', 'Fresh greek salad', 14.99, true, NOW(), NOW()),
-- Desserts
('item-006', 'cat-003', 'Chocolate Cake', 'Rich chocolate cake', 8.99, true, NOW(), NOW()),
('item-007', 'cat-003', 'Tiramisu', 'Italian tiramisu', 9.99, true, NOW(), NOW()),
-- Appetizers
('item-008', 'cat-004', 'Bruschetta', 'Tomato bruschetta', 7.99, true, NOW(), NOW()),
('item-009', 'cat-004', 'Chicken Wings', 'Spicy wings', 11.99, true, NOW(), NOW()),
-- Beverages
('item-010', 'cat-005', 'Orange Juice', 'Fresh orange juice', 4.99, true, NOW(), NOW()),
('item-011', 'cat-005', 'Iced Coffee', 'Cold coffee', 3.99, true, NOW(), NOW());