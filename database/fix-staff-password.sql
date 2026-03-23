-- Fix staff password
-- Password: staff123

UPDATE users 
SET password_hash = '$2a$12$CydHziTUtPb9LoGq73Jr7u9pfDqPrOO99Lqxs3CWAfwAc0vAGLffi'
WHERE email = 'phulam123@gmail.com';

-- Verify
SELECT 
  email, 
  full_name, 
  role, 
  status,
  LEFT(password_hash, 20) as password_preview
FROM users 
WHERE email = 'phulam123@gmail.com';
