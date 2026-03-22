-- Fix staff password for ngocquyentcv95@gmail.com
-- Password: staff123

UPDATE users 
SET password_hash = '$2a$12$4ZF7Lcrg.3M3slXg.wY4Y.V.5KOApDSGZQTD5QbOrAKYCNlGSFEbS',
    updated_at = NOW()
WHERE email = 'ngocquyentcv95@gmail.com';

-- Verify
SELECT 
  email, 
  full_name, 
  role, 
  status,
  restaurant_id,
  branch_id,
  LEFT(password_hash, 30) as password_preview
FROM users 
WHERE email = 'ngocquyentcv95@gmail.com';
