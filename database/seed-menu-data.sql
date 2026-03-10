-- =====================================================
-- SEED MENU DATA FOR TESTING
-- Categories and Menu Items
-- =====================================================

-- 1. Create test categories
INSERT INTO categories (
    id,
    branch_id,
    name,
    description,
    sort_order,
    created_at,
    updated_at
) VALUES 
(
    'cat-test-001',
    'branch-test-001',
    'Main Courses',
    'Hearty main dishes',
    1,
    NOW(),
    NOW()
),
(
    'cat-test-002',
    'branch-test-001',
    'Salads',
    'Fresh and healthy salads',
    2,
    NOW(),
    NOW()
),
(
    'cat-test-003',
    'branch-test-001',
    'Desserts',
    'Sweet treats and desserts',
    3,
    NOW(),
    NOW()
),
(
    'cat-test-004',
    'branch-test-001',
    'Appetizers',
    'Light starters and appetizers',
    4,
    NOW(),
    NOW()
),
(
    'cat-test-005',
    'branch-test-001',
    'Beverages',
    'Drinks and beverages',
    5,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create test menu items
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
) VALUES 
-- Main Courses
(
    'menu-test-001',
    'cat-test-001',
    'Grilled Salmon',
    'Fresh Atlantic salmon grilled to perfection with herbs and lemon',
    24.99,
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    false,
    NOW(),
    NOW()
),
(
    'menu-test-002',
    'cat-test-001',
    'Beef Burger',
    'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
    16.99,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    false,
    NOW(),
    NOW()
),
(
    'menu-test-003',
    'cat-test-001',
    'Pasta Carbonara',
    'Creamy pasta with bacon, egg, and parmesan',
    18.99,
    'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
    false,
    NOW(),
    NOW()
),
-- Salads
(
    'menu-test-004',
    'cat-test-002',
    'Caesar Salad',
    'Crisp romaine lettuce with caesar dressing and croutons',
    12.99,
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    true,
    NOW(),
    NOW()
),
(
    'menu-test-005',
    'cat-test-002',
    'Greek Salad',
    'Fresh vegetables with feta cheese and olive oil',
    14.99,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    true,
    NOW(),
    NOW()
),
-- Desserts
(
    'menu-test-006',
    'cat-test-003',
    'Chocolate Cake',
    'Rich chocolate cake with chocolate frosting',
    8.99,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    true,
    NOW(),
    NOW()
),
(
    'menu-test-007',
    'cat-test-003',
    'Tiramisu',
    'Classic Italian dessert with coffee and mascarpone',
    9.99,
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    true,
    NOW(),
    NOW()
),
-- Appetizers
(
    'menu-test-008',
    'cat-test-004',
    'Bruschetta',
    'Toasted bread with tomatoes, basil, and garlic',
    7.99,
    'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop',
    true,
    NOW(),
    NOW()
),
(
    'menu-test-009',
    'cat-test-004',
    'Chicken Wings',
    'Spicy buffalo chicken wings with ranch dressing',
    11.99,
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop',
    true,
    NOW(),
    NOW()
),
-- Beverages
(
    'menu-test-010',
    'cat-test-005',
    'Fresh Orange Juice',
    'Freshly squeezed orange juice',
    4.99,
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop',
    true,
    NOW(),
    NOW()
),
(
    'menu-test-011',
    'cat-test-005',
    'Iced Coffee',
    'Cold brew coffee with ice and milk',
    3.99,
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFY MENU DATA
-- =====================================================

-- Check categories
SELECT id, name, sort_order 
FROM categories 
WHERE branch_id = 'branch-test-001'
ORDER BY sort_order;

-- Check menu items by category
SELECT 
    c.name as category_name,
    m.name as menu_item_name,
    m.price,
    m.available
FROM categories c
LEFT JOIN menu_items m ON c.id = m.category_id
WHERE c.branch_id = 'branch-test-001'
ORDER BY c.sort_order, m.name;

-- Count items per category
SELECT 
    c.name as category_name,
    COUNT(m.id) as item_count
FROM categories c
LEFT JOIN menu_items m ON c.id = m.category_id
WHERE c.branch_id = 'branch-test-001'
GROUP BY c.id, c.name
ORDER BY c.sort_order;

-- =====================================================
-- MENU DATA SUMMARY
-- =====================================================
-- Categories: 5 (Main Courses, Salads, Desserts, Appetizers, Beverages)
-- Menu Items: 11 total
-- - Main Courses: 3 items (all unavailable for demo)
-- - Salads: 2 items (available)
-- - Desserts: 2 items (available)
-- - Appetizers: 2 items (available)
-- - Beverages: 2 items (available)
-- =====================================================