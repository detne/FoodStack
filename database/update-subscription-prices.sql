-- Update subscription plan prices
-- Pro: 4,000 VND
-- VIP: 9,000 VND

UPDATE subscription_plans 
SET price = 4000, updated_at = CURRENT_TIMESTAMP 
WHERE name = 'pro';

UPDATE subscription_plans 
SET price = 9000, updated_at = CURRENT_TIMESTAMP 
WHERE name = 'vip';

-- Verify the changes
SELECT name, display_name, price, billing_period 
FROM subscription_plans 
ORDER BY price ASC;
