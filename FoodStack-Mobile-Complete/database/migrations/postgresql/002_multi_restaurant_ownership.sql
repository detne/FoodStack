-- Migration: Support multi-restaurant ownership
-- Description: Allow one user (OWNER) to own multiple restaurants

BEGIN;

-- Step 1: Add owner_id to restaurants table (nullable first)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_id TEXT;

-- Step 2: Create user_restaurants junction table
CREATE TABLE IF NOT EXISTS user_restaurants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    restaurant_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_restaurant UNIQUE (user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_restaurants_user_id ON user_restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restaurants_restaurant_id ON user_restaurants(restaurant_id);

-- Step 3: Populate user_restaurants with existing relationships
INSERT INTO user_restaurants (id, user_id, restaurant_id, created_at)
SELECT 
    gen_random_uuid()::text,
    u.id,
    u.restaurant_id,
    u.created_at
FROM users u
WHERE u.restaurant_id IS NOT NULL
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Step 4: Set owner_id for each restaurant from users with role='OWNER'
UPDATE restaurants r
SET owner_id = (
    SELECT u.id 
    FROM users u 
    WHERE u.restaurant_id = r.id 
      AND u.role = 'OWNER'
    ORDER BY u.created_at ASC 
    LIMIT 1
)
WHERE r.owner_id IS NULL;

-- Step 5: For restaurants without OWNER, use first MANAGER
UPDATE restaurants r
SET owner_id = (
    SELECT u.id 
    FROM users u 
    WHERE u.restaurant_id = r.id 
      AND u.role = 'MANAGER'
    ORDER BY u.created_at ASC 
    LIMIT 1
)
WHERE r.owner_id IS NULL;

-- Step 6: For restaurants still without owner, use any first user
UPDATE restaurants r
SET owner_id = (
    SELECT u.id 
    FROM users u 
    WHERE u.restaurant_id = r.id 
    ORDER BY u.created_at ASC 
    LIMIT 1
)
WHERE r.owner_id IS NULL;

-- Step 7: Only set NOT NULL if all restaurants have owners
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM restaurants WHERE owner_id IS NULL) THEN
        ALTER TABLE restaurants ALTER COLUMN owner_id SET NOT NULL;
    ELSE
        RAISE EXCEPTION 'Cannot set owner_id NOT NULL: Some restaurants still have NULL owner_id';
    END IF;
END $$;

-- Step 8: Make restaurant_id nullable in users table
ALTER TABLE users ALTER COLUMN restaurant_id DROP NOT NULL;

-- Step 9: Set restaurant_id to NULL for users with role='OWNER'
UPDATE users 
SET restaurant_id = NULL 
WHERE role = 'OWNER';

-- Step 10: Add owner relationships to user_restaurants
INSERT INTO user_restaurants (id, user_id, restaurant_id, created_at)
SELECT 
    gen_random_uuid()::text,
    r.owner_id,
    r.id,
    r.created_at
FROM restaurants r
WHERE r.owner_id IS NOT NULL
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Step 11: Add foreign key constraints
ALTER TABLE restaurants 
ADD CONSTRAINT fk_restaurants_owner 
FOREIGN KEY (owner_id) REFERENCES users(id);

ALTER TABLE user_restaurants 
ADD CONSTRAINT fk_user_restaurants_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_restaurants 
ADD CONSTRAINT fk_user_restaurants_restaurant 
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

-- Step 12: Create index for owner_id
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);

COMMIT;
