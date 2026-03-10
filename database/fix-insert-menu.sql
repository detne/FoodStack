-- Step 1: Find the actual branch_id for your user
SELECT 
    u.email,
    u.id as user_id,
    r.id as restaurant_id,
    r.name as restaurant_name,
    b.id as branch_id,
    b.name as branch_name
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
LEFT JOIN branches b ON r.id = b.restaurant_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn';

-- If no branch exists, create one first:
-- (Only run this if the above query shows no branch_id)

-- Create restaurant if not exists
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
)
SELECT 
    'rest-' || u.id,
    u.id,
    'Pho Royale Restaurant',
    u.email,
    '0123456789',
    'Ho Chi Minh City, Vietnam',
    true,
    NOW(),
    NOW()
FROM users u 
WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
AND NOT EXISTS (
    SELECT 1 FROM restaurants r WHERE r.owner_id = u.id
);

-- Update user's restaurant_id
UPDATE users 
SET restaurant_id = (
    SELECT r.id FROM restaurants r WHERE r.owner_id = users.id LIMIT 1
)
WHERE email = 'quyenptnde180559@fpt.edu.vn' 
AND restaurant_id IS NULL;

-- Create branch if not exists
INSERT INTO branches (
    id,
    restaurant_id,
    name,
    address,
    phone,
    status,
    created_at,
    updated_at
)
SELECT 
    'branch-' || r.id,
    r.id,
    'Main Branch',
    'Ho Chi Minh City, Vietnam',
    '0123456789',
    'ACTIVE',
    NOW(),
    NOW()
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
AND NOT EXISTS (
    SELECT 1 FROM branches b WHERE b.restaurant_id = r.id
);-
- Step 2: Now insert categories using the actual branch_id
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
    b.id,
    category_data.name,
    category_data.description,
    category_data.sort_order,
    NOW(),
    NOW()
FROM (
    SELECT u.email, b.id
    FROM users u
    JOIN restaurants r ON u.restaurant_id = r.id
    JOIN branches b ON r.id = b.restaurant_id
    WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
    LIMIT 1
) b
CROSS JOIN (
    VALUES 
        ('Main Courses', 'Hearty main dishes', 1),
        ('Salads', 'Fresh and healthy salads', 2),
        ('Desserts', 'Sweet treats', 3),
        ('Appetizers', 'Light starters', 4),
        ('Beverages', 'Drinks and beverages', 5)
) AS category_data(name, description, sort_order)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert menu items
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
SELECT 
    'menu-' || generate_random_uuid()::text,
    c.id,
    item_data.name,
    item_data.description,
    item_data.price,
    item_data.image_url,
    item_data.available,
    NOW(),
    NOW()
FROM (
    SELECT c.id, c.name as category_name
    FROM users u
    JOIN restaurants r ON u.restaurant_id = r.id
    JOIN branches b ON r.id = b.restaurant_id
    JOIN categories c ON b.id = c.branch_id
    WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
) c
CROSS JOIN (
    VALUES 
        -- Main Courses
        ('Main Courses', 'Grilled Salmon', 'Fresh Atlantic salmon grilled to perfection', 24.99, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', false),
        ('Main Courses', 'Beef Burger', 'Juicy beef patty with cheese and lettuce', 16.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', false),
        ('Main Courses', 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 18.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', false),
        -- Salads
        ('Salads', 'Caesar Salad', 'Crisp romaine with caesar dressing', 12.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', true),
        ('Salads', 'Greek Salad', 'Fresh vegetables with feta cheese', 14.99, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', true),
        -- Desserts
        ('Desserts', 'Chocolate Cake', 'Rich chocolate cake with frosting', 8.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', true),
        ('Desserts', 'Tiramisu', 'Classic Italian dessert', 9.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', true),
        -- Appetizers
        ('Appetizers', 'Bruschetta', 'Toasted bread with tomatoes and basil', 7.99, 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400', true),
        ('Appetizers', 'Chicken Wings', 'Spicy buffalo wings with ranch', 11.99, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', true),
        -- Beverages
        ('Beverages', 'Orange Juice', 'Freshly squeezed orange juice', 4.99, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', true),
        ('Beverages', 'Iced Coffee', 'Cold brew coffee with milk', 3.99, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', true)
) AS item_data(category_name, name, description, price, image_url, available)
WHERE c.category_name = item_data.category_name
ON CONFLICT (id) DO NOTHING;-- 
Step 4: Verify the data
SELECT 
    'User Info' as type,
    u.email,
    r.name as restaurant_name,
    b.name as branch_name
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
JOIN branches b ON r.id = b.restaurant_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn'

UNION ALL

SELECT 
    'Categories' as type,
    c.name,
    NULL,
    COUNT(m.id)::text || ' items'
FROM users u
JOIN restaurants r ON u.restaurant_id = r.id
JOIN branches b ON r.id = b.restaurant_id
JOIN categories c ON b.id = c.branch_id
LEFT JOIN menu_items m ON c.id = m.category_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn'
GROUP BY c.name, c.sort_order
ORDER BY type, c.sort_order;