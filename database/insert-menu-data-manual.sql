-- =====================================================
-- INSERT MENU DATA MANUALLY FOR EXISTING USER
-- User: quyenptnde180559@fpt.edu.vn
-- =====================================================

-- First, let's check the existing user and restaurant data
SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    r.id as restaurant_id,
    r.name as restaurant_name,
    b.id as branch_id,
    b.name as branch_name
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
LEFT JOIN branches b ON r.id = b.restaurant_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn';

-- =====================================================
-- INSERT CATEGORIES
-- =====================================================

-- Get the branch_id for the user (assuming first branch)
WITH user_branch AS (
    SELECT b.id as branch_id
    FROM users u
    JOIN restaurants r ON u.restaurant_id = r.id
    JOIN branches b ON r.id = b.restaurant_id
    WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
    LIMIT 1
)
INSERT INTO categories (
    id,
    branch_id,
    name,
    description,
    sort_order,
    created_at,
    updated_at
)
SELECT 
    'cat-' || generate_random_uuid()::text,
    ub.branch_id,
    category_name,
    category_desc,
    sort_order,
    NOW(),
    NOW()
FROM user_branch ub,
(VALUES 
    ('Main Courses', 'Hearty main dishes and entrees', 1),
    ('Salads', 'Fresh and healthy salads', 2),
    ('Desserts', 'Sweet treats and desserts', 3),
    ('Appetizers', 'Light starters and appetizers', 4),
    ('Beverages', 'Drinks and beverages', 5)
) AS categories_data(category_name, category_desc, sort_order)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INSERT MENU ITEMS
-- =====================================================

-- Insert menu items for each category
WITH user_categories AS (
    SELECT 
        c.id as category_id,
        c.name as category_name
    FROM users u
    JOIN restaurants r ON u.restaurant_id = r.id
    JOIN branches b ON r.id = b.restaurant_id
    JOIN categories c ON b.id = c.branch_id
    WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
)
INSERT INTO menu_items (
    id,
    category_id,
    name,
    description,
    price,
    image_url,
    available,
    created_at,
    updated_at
)
-- Main Courses
SELECT 
    'menu-' || generate_random_uuid()::text,
    uc.category_id,
    item_name,
    item_desc,
    item_price,
    item_image,
    item_available,
    NOW(),
    NOW()
FROM user_categories uc,
(VALUES 
    ('Grilled Salmon', 'Fresh Atlantic salmon grilled to perfection with herbs and lemon', 24.99, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', false),
    ('Beef Burger', 'Juicy beef patty with cheese, lettuce, tomato, and special sauce', 16.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', false),
    ('Pasta Carbonara', 'Creamy pasta with bacon, egg, and parmesan', 18.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop', false),
    ('Chicken Teriyaki', 'Grilled chicken with teriyaki sauce and steamed rice', 19.99, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop', true),
    ('Fish and Chips', 'Beer-battered fish with crispy fries and tartar sauce', 17.99, 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&h=300&fit=crop', true)
) AS items_data(item_name, item_desc, item_price, item_image, item_available)
WHERE uc.category_name = 'Main Courses'

UNION ALL

-- Salads
SELECT 
    'menu-' || generate_random_uuid()::text,
    uc.category_id,
    item_name,
    item_desc,
    item_price,
    item_image,
    item_available,
    NOW(),
    NOW()
FROM user_categories uc,
(VALUES 
    ('Caesar Salad', 'Crisp romaine lettuce with caesar dressing and croutons', 12.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', true),
    ('Greek Salad', 'Fresh vegetables with feta cheese and olive oil', 14.99, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', true),
    ('Garden Salad', 'Mixed greens with seasonal vegetables', 10.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', true)
) AS items_data(item_name, item_desc, item_price, item_image, item_available)
WHERE uc.category_name = 'Salads'

UNION ALL

-- Desserts
SELECT 
    'menu-' || generate_random_uuid()::text,
    uc.category_id,
    item_name,
    item_desc,
    item_price,
    item_image,
    item_available,
    NOW(),
    NOW()
FROM user_categories uc,
(VALUES 
    ('Chocolate Cake', 'Rich chocolate cake with chocolate frosting', 8.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', true),
    ('Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 9.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', true),
    ('Cheesecake', 'New York style cheesecake with berry compote', 7.99, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop', true),
    ('Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce and nuts', 6.99, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', true)
) AS items_data(item_name, item_desc, item_price, item_image, item_available)
WHERE uc.category_name = 'Desserts'

UNION ALL

-- Appetizers
SELECT 
    'menu-' || generate_random_uuid()::text,
    uc.category_id,
    item_name,
    item_desc,
    item_price,
    item_image,
    item_available,
    NOW(),
    NOW()
FROM user_categories uc,
(VALUES 
    ('Bruschetta', 'Toasted bread with tomatoes, basil, and garlic', 7.99, 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop', true),
    ('Chicken Wings', 'Spicy buffalo chicken wings with ranch dressing', 11.99, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop', true),
    ('Mozzarella Sticks', 'Crispy breaded mozzarella with marinara sauce', 8.99, 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400&h=300&fit=crop', true),
    ('Nachos', 'Tortilla chips with cheese, jalapeños, and salsa', 9.99, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop', true)
) AS items_data(item_name, item_desc, item_price, item_image, item_available)
WHERE uc.category_name = 'Appetizers'

UNION ALL

-- Beverages
SELECT 
    'menu-' || generate_random_uuid()::text,
    uc.category_id,
    item_name,
    item_desc,
    item_price,
    item_image,
    item_available,
    NOW(),
    NOW()
FROM user_categories uc,
(VALUES 
    ('Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop', true),
    ('Iced Coffee', 'Cold brew coffee with ice and milk', 3.99, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', true),
    ('Coca Cola', 'Classic Coca Cola soft drink', 2.99, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', true),
    ('Green Tea', 'Traditional green tea', 2.49, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop', true),
    ('Lemonade', 'Fresh homemade lemonade', 3.49, 'https://images.unsplash.com/photo-1523371683702-af5cd0c22e62?w=400&h=300&fit=crop', true)
) AS items_data(item_name, item_desc, item_price, item_image, item_available)
WHERE uc.category_name = 'Beverages'

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFY THE INSERTED DATA
-- =====================================================

-- Check categories for the user
SELECT 
    c.id,
    c.name,
    c.description,
    c.sort_order,
    COUNT(m.id) as menu_items_count
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
JOIN branches b ON r.id = b.restaurant_id
JOIN categories c ON b.id = c.branch_id
LEFT JOIN menu_items m ON c.id = m.category_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
GROUP BY c.id, c.name, c.description, c.sort_order
ORDER BY c.sort_order;

-- Check menu items by category
SELECT 
    c.name as category_name,
    m.name as menu_item_name,
    m.price,
    m.available,
    m.description
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
JOIN branches b ON r.id = b.restaurant_id
JOIN categories c ON b.id = c.branch_id
JOIN menu_items m ON c.id = m.category_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
ORDER BY c.sort_order, m.name;

-- Summary count
SELECT 
    'Total Categories' as type,
    COUNT(DISTINCT c.id) as count
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
JOIN branches b ON r.id = b.restaurant_id
JOIN categories c ON b.id = c.branch_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn'

UNION ALL

SELECT 
    'Total Menu Items' as type,
    COUNT(m.id) as count
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
JOIN branches b ON r.id = b.restaurant_id
JOIN categories c ON b.id = c.branch_id
JOIN menu_items m ON c.id = m.category_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn';

-- =====================================================
-- DATA SUMMARY
-- =====================================================
-- Categories: 5 (Main Courses, Salads, Desserts, Appetizers, Beverages)
-- Menu Items: 21 total
-- - Main Courses: 5 items (2 unavailable, 3 available)
-- - Salads: 3 items (all available)
-- - Desserts: 4 items (all available)
-- - Appetizers: 4 items (all available)
-- - Beverages: 5 items (all available)
-- =====================================================