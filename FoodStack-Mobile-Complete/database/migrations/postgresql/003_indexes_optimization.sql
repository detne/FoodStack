-- =====================================================
-- QR Service Platform - Performance Indexes
-- Migration: 003_indexes_optimization
-- Description: Additional indexes for query optimization
-- =====================================================

-- 1️⃣ COMPOSITE INDEXES FOR COMMON QUERIES

-- Dashboard queries (most frequent)
CREATE INDEX idx_orders_restaurant_date_status 
    ON orders(restaurant_id, created_at DESC, status)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_orders_branch_date_paid 
    ON orders(branch_id, created_at DESC)
    WHERE status = 'Paid';

-- Menu browsing (customer-facing)
CREATE INDEX idx_menu_items_branch_available 
    ON menu_items(branch_id, category_id, sort_order)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_menu_availability_branch_available 
    ON menu_item_availability(branch_id, is_available);

-- Real-time order tracking
CREATE INDEX idx_orders_table_active 
    ON orders(table_id, status, created_at DESC)
    WHERE status IN ('Pending', 'Preparing', 'Ready', 'Served');

-- Staff assignment queries
CREATE INDEX idx_users_branch_role_active 
    ON users(branch_id, role, status)
    WHERE deleted_at IS NULL AND status = 'active';

-- 2️⃣ PARTIAL INDEXES (For specific conditions)

-- Active sessions only
CREATE INDEX idx_sessions_table_active_only 
    ON order_sessions(table_id, started_at DESC)
    WHERE is_active = TRUE;

-- Unpaid orders
CREATE INDEX idx_orders_unpaid 
    ON orders(restaurant_id, table_id, created_at DESC)
    WHERE payment_status = 'Pending';

-- Pending reservations
CREATE INDEX idx_reservations_pending 
    ON reservations(branch_id, reservation_time)
    WHERE status IN ('Pending', 'Confirmed');

-- Active subscriptions
CREATE INDEX idx_subscriptions_active_only 
    ON subscriptions(restaurant_id, end_date)
    WHERE status = 'active';

-- Unread notifications
CREATE INDEX idx_notifications_unread_user 
    ON notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;

-- 3️⃣ COVERING INDEXES (Include frequently accessed columns)

-- Order list with totals
CREATE INDEX idx_orders_list_covering 
    ON orders(branch_id, created_at DESC)
    INCLUDE (status, total_amount, payment_status, table_id);

-- Menu items with price
CREATE INDEX idx_menu_items_list_covering 
    ON menu_items(category_id, sort_order)
    INCLUDE (name, price, image_url)
    WHERE deleted_at IS NULL;

-- 4️⃣ JSONB INDEXES (For metadata queries)

-- Payment metadata search
CREATE INDEX idx_payments_payos_data 
    ON payments USING gin(payos_data);

-- Notification metadata
CREATE INDEX idx_notifications_metadata 
    ON notifications USING gin(metadata);

-- 5️⃣ TEXT SEARCH INDEXES

-- Menu item search
CREATE INDEX idx_menu_items_search 
    ON menu_items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Restaurant search
CREATE INDEX idx_restaurants_search 
    ON restaurants USING gin(to_tsvector('english', name));

-- Customer search in reservations
CREATE INDEX idx_reservations_customer_search 
    ON reservations USING gin(to_tsvector('english', customer_name || ' ' || customer_phone));

-- 6️⃣ FOREIGN KEY INDEXES (If not already created)

-- Ensure all foreign keys have indexes for JOIN performance
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item 
    ON order_items(menu_item_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order 
    ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_customization_options_group 
    ON customization_options(group_id);

CREATE INDEX IF NOT EXISTS idx_item_customizations_menu_item 
    ON item_customizations(menu_item_id);

CREATE INDEX IF NOT EXISTS idx_item_customizations_group 
    ON item_customizations(group_id);

-- 7️⃣ TIME-BASED INDEXES (For reporting)

-- Daily revenue reports
CREATE INDEX idx_orders_date_trunc_day 
    ON orders(restaurant_id, date_trunc('day', created_at))
    WHERE status = 'Paid';

-- Monthly subscription tracking
CREATE INDEX idx_subscriptions_month 
    ON subscriptions(restaurant_id, date_trunc('month', start_date));

-- Hourly order volume (peak hours analysis)
CREATE INDEX idx_orders_hour 
    ON orders(branch_id, date_trunc('hour', created_at))
    WHERE status = 'Paid';

-- 8️⃣ UNIQUE CONSTRAINTS (Data integrity)

-- Prevent duplicate active sessions per table
CREATE UNIQUE INDEX idx_unique_active_session_per_table 
    ON order_sessions(table_id)
    WHERE is_active = TRUE;

-- Prevent duplicate QR tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_qr_token 
    ON tables(qr_code_token)
    WHERE deleted_at IS NULL;

-- One active subscription per restaurant
CREATE UNIQUE INDEX idx_unique_active_subscription 
    ON subscriptions(restaurant_id)
    WHERE status = 'active';

-- 9️⃣ STATISTICS UPDATE (For query planner)

-- Analyze tables for better query planning
ANALYZE restaurants;
ANALYZE branches;
ANALYZE users;
ANALYZE tables;
ANALYZE areas;
ANALYZE categories;
ANALYZE menu_items;
ANALYZE orders;
ANALYZE order_items;
ANALYZE payments;
ANALYZE reservations;
ANALYZE subscriptions;

-- 🔟 INDEX MAINTENANCE QUERIES (For monitoring)

-- View to check index usage
CREATE OR REPLACE VIEW v_index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- View to check table sizes
CREATE OR REPLACE VIEW v_table_sizes AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

COMMENT ON VIEW v_index_usage IS 'Monitor index usage to identify unused indexes';
COMMENT ON VIEW v_table_sizes IS 'Monitor table and index sizes for capacity planning';
