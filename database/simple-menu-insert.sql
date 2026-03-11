-- Simple menu insert without UUID functions
-- Step 1: Check current user data
SELECT 
    u.email,
    u.id as user_id,
    r.id as restaurant_id,
    b.id as branch_id
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
LEFT JOIN branches b ON r.id = b.restaurant_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn';

-- Step 2: Create restaurant and branch if needed
DO $$
DECLARE
    user_id_var text;
    restaurant_id_var text;
    branch_id_var text;
BEGIN
    -- Get user_id
    SELECT id INTO user_id_var FROM users WHERE email = 'quyenptnde180559@fpt.edu.vn';
    
    -- Create restaurant if not exists
    SELECT id INTO restaurant_id_var FROM restaurants WHERE owner_id = user_id_var;
    
    IF restaurant_id_var IS NULL THEN
        restaurant_id_var := 'rest-' || user_id_var;
        INSERT INTO restaurants (
            id, owner_id, name, email, phone, address, email_verified, created_at, updated_at
        ) VALUES (
            restaurant_id_var, user_id_var, 'Pho Royale Restaurant', 'quyenptnde180559@fpt.edu.vn', 
            '0123456789', 'Ho Chi Minh City, Vietnam', true, NOW(), NOW()
        );
        
        -- Update user's restaurant_id
        UPDATE users SET restaurant_id = restaurant_id_var WHERE id = user_id_var;
    END IF;
    
    -- Create branch if not exists
    SELECT id INTO branch_id_var FROM branches WHERE restaurant_id = restaurant_id_var;
    
    IF branch_id_var IS NULL THEN
        branch_id_var := 'branch-' || restaurant_id_var;
        INSERT INTO branches (
            id, restaurant_id, name, address, phone, status, created_at, updated_at
        ) VALUES (
            branch_id_var, restaurant_id_var, 'Main Branch', 'Ho Chi Minh City, Vietnam', 
            '0123456789', 'ACTIVE', NOW(), NOW()
        );
    END IF;
    
    RAISE NOTICE 'User ID: %, Restaurant ID: %, Branch ID: %', user_id_var, restaurant_id_var, branch_id_var;
END $$;-- Step 3: 
Insert categories with fixed IDs
INSERT INTO categories (id, branch_id, name, description, sort_order, created_at, updated_at)
SELECT 
    category_data.id,
    b.id,
    category_data.name,
    category_data.description,
    category_data.sort_order,
    NOW(),
    NOW()
FROM (
    SELECT b.id
    FROM users u
    JOIN restaurants r ON u.restaurant_id = r.id
    JOIN branches b ON r.id = b.restaurant_id
    WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
    LIMIT 1
) b
CROSS JOIN (
    VALUES 
        ('cat-main-001', 'Main Courses', 'Hearty main dishes', 1),
        ('cat-salad-002', 'Salads', 'Fresh and healthy salads', 2),
        ('cat-dessert-003', 'Desserts', 'Sweet treats', 3),
        ('cat-app-004', 'Appetizers', 'Light starters', 4),
        ('cat-bev-005', 'Beverages', 'Drinks and beverages', 5)
) AS category_data(id, name, description, sort_order)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Insert menu items with fixed IDs
INSERT INTO menu_items (id, category_id, name, description, price, image_url, available, created_at, updated_at)
VALUES 
-- Main Courses
('item-main-001', 'cat-main-001', 'Grilled Salmon', 'Fresh Atlantic salmon grilled to perfection', 24.99, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', false, NOW(), NOW()),
('item-main-002', 'cat-main-001', 'Beef Burger', 'Juicy beef patty with cheese and lettuce', 16.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', false, NOW(), NOW()),
('item-main-003', 'cat-main-001', 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 18.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', false, NOW(), NOW()),

-- Salads
('item-salad-001', 'cat-salad-002', 'Caesar Salad', 'Crisp romaine with caesar dressing', 12.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true, NOW(), NOW()),
('item-salad-002', 'cat-salad-002', 'Greek Salad', 'Fresh vegetables with feta cheese', 14.99, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', true, NOW(), NOW()),

-- Desserts
('item-dessert-001', 'cat-dessert-003', 'Chocolate Cake', 'Rich chocolate cake with frosting', 8.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', true, NOW(), NOW()),
('item-dessert-002', 'cat-dessert-003', 'Tiramisu', 'Classic Italian dessert', 9.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', true, NOW(), NOW()),

-- Appetizers
('item-app-001', 'cat-app-004', 'Bruschetta', 'Toasted bread with tomatoes and basil', 7.99, 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400', true, NOW(), NOW()),
('item-app-002', 'cat-app-004', 'Chicken Wings', 'Spicy buffalo wings with ranch', 11.99, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', true, NOW(), NOW()),

-- Beverages
('item-bev-001', 'cat-bev-005', 'Orange Juice', 'Freshly squeezed orange juice', 4.99, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', true, NOW(), NOW()),
('item-bev-002', 'cat-bev-005', 'Iced Coffee', 'Cold brew coffee with milk', 3.99, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', true, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify results
SELECT 
    c.name as category,
    COUNT(m.id) as item_count
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
JOIN branches b ON r.id = b.restaurant_id
JOIN categories c ON b.id = c.branch_id
LEFT JOIN menu_items m ON c.id = m.category_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;