-- Create test staff account
-- Password: staff123

-- First, get a branch_id from existing branches
DO $$
DECLARE
    v_branch_id TEXT;
    v_restaurant_id TEXT;
    v_staff_id TEXT;
BEGIN
    -- Get first available branch
    SELECT id, restaurant_id INTO v_branch_id, v_restaurant_id
    FROM branches
    LIMIT 1;
    
    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branches found. Please create a branch first.';
    END IF;
    
    -- Check if staff already exists
    SELECT id INTO v_staff_id
    FROM users
    WHERE email = 'staff@test.com';
    
    IF v_staff_id IS NOT NULL THEN
        -- Update existing staff
        UPDATE users
        SET 
            password_hash = '$2b$10$YourHashedPasswordHere', -- staff123
            branch_id = v_branch_id,
            restaurant_id = v_restaurant_id,
            role = 'STAFF',
            status = 'ACTIVE'
        WHERE id = v_staff_id;
        
        RAISE NOTICE 'Updated existing staff account: staff@test.com';
    ELSE
        -- Create new staff
        INSERT INTO users (
            id,
            email,
            password_hash,
            full_name,
            role,
            restaurant_id,
            branch_id,
            status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid()::text,
            'staff@test.com',
            '$2b$10$YourHashedPasswordHere', -- staff123
            'Test Staff',
            'STAFF',
            v_restaurant_id,
            v_branch_id,
            'ACTIVE',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created new staff account: staff@test.com';
    END IF;
    
    RAISE NOTICE 'Branch ID: %', v_branch_id;
    RAISE NOTICE 'Restaurant ID: %', v_restaurant_id;
END $$;

-- Verify the staff account
SELECT 
    id,
    email,
    full_name,
    role,
    restaurant_id,
    branch_id,
    status
FROM users
WHERE email = 'staff@test.com';
