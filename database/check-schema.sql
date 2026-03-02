-- =====================================================
-- CHECK DATABASE SCHEMA
-- Run this first to see actual column names
-- =====================================================

-- Check restaurants table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'restaurants'
ORDER BY ordinal_position;

-- Check users table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check branches table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'branches'
ORDER BY ordinal_position;

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
