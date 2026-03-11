-- STEP 1: Check current user data
SELECT 
    u.email,
    u.id as user_id,
    r.id as restaurant_id,
    b.id as branch_id
FROM users u
LEFT JOIN restaurants r ON u.restaurant_id = r.id
LEFT JOIN branches b ON r.id = b.restaurant_id
WHERE u.email = 'quyenptnde180559@fpt.edu.vn';