-- =====================================================
-- QR Service Platform - Triggers & Functions
-- Migration: 002_triggers_and_functions
-- Description: Auto-update timestamps, audit logs, business logic
-- =====================================================

-- 1️⃣ AUTO UPDATE TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at 
    BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at 
    BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2️⃣ AUTO CALCULATE ORDER TOTALS
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
    v_sub_total NUMERIC(14,2);
    v_tax_rate NUMERIC(5,4) := 0.10; -- 10% VAT
    v_service_rate NUMERIC(5,4) := 0.05; -- 5% service charge
BEGIN
    -- Calculate subtotal from order_items
    SELECT COALESCE(SUM(
        (oi.base_price * oi.quantity) - oi.discount_amount +
        COALESCE((
            SELECT SUM(oic.price_delta)
            FROM order_item_customizations oic
            WHERE oic.order_item_id = oi.id
        ), 0)
    ), 0)
    INTO v_sub_total
    FROM order_items oi
    WHERE oi.order_id = NEW.id;

    -- Update order totals
    NEW.sub_total := v_sub_total;
    NEW.tax_amount := v_sub_total * v_tax_rate;
    NEW.service_charge_amount := v_sub_total * v_service_rate;
    NEW.total_amount := v_sub_total + NEW.tax_amount + NEW.service_charge_amount - COALESCE(NEW.discount_amount, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_order_total_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION calculate_order_total();

-- 3️⃣ AUTO UPDATE TABLE STATUS WHEN ORDER CREATED
CREATE OR REPLACE FUNCTION update_table_status_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Set table to Occupied when new order created
        UPDATE tables 
        SET status = 'Occupied'
        WHERE id = NEW.table_id AND status = 'Available';
    ELSIF TG_OP = 'UPDATE' THEN
        -- Set table to Available when order is paid
        IF NEW.status = 'Paid' AND OLD.status != 'Paid' THEN
            UPDATE tables 
            SET status = 'Available'
            WHERE id = NEW.table_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_table_status_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_table_status_on_order();

-- 4️⃣ AUTO CLOSE ORDER SESSION WHEN ORDER PAID
CREATE OR REPLACE FUNCTION close_session_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Paid' AND OLD.status != 'Paid' THEN
        UPDATE order_sessions
        SET ended_at = now(),
            is_active = FALSE
        WHERE id = NEW.session_id AND is_active = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER close_session_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION close_session_on_payment();

-- 5️⃣ VALIDATE SUBSCRIPTION LIMITS
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS TRIGGER AS $$
DECLARE
    v_restaurant_id UUID;
    v_current_plan VARCHAR(50);
    v_max_tables INT;
    v_current_tables INT;
BEGIN
    -- Get restaurant_id based on table type
    IF TG_TABLE_NAME = 'tables' THEN
        v_restaurant_id := NEW.restaurant_id;
    ELSIF TG_TABLE_NAME = 'branches' THEN
        v_restaurant_id := NEW.restaurant_id;
    END IF;

    -- Get current subscription plan
    SELECT s.plan_type, sfl.max_tables
    INTO v_current_plan, v_max_tables
    FROM subscriptions s
    JOIN subscription_feature_limits sfl ON s.plan_type = sfl.plan_type
    WHERE s.restaurant_id = v_restaurant_id
        AND s.status = 'active'
        AND s.end_date > now()
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- Check table limit
    IF TG_TABLE_NAME = 'tables' THEN
        SELECT COUNT(*)
        INTO v_current_tables
        FROM tables
        WHERE restaurant_id = v_restaurant_id
            AND deleted_at IS NULL;

        IF v_current_tables >= v_max_tables THEN
            RAISE EXCEPTION 'Table limit exceeded for plan %. Current: %, Max: %', 
                v_current_plan, v_current_tables, v_max_tables;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_table_limit_trigger
    BEFORE INSERT ON tables
    FOR EACH ROW EXECUTE FUNCTION check_subscription_limits();

-- 6️⃣ AUTO INCREMENT PROMOTION USAGE
CREATE OR REPLACE FUNCTION increment_promotion_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.discount_amount > 0 THEN
        -- Assuming promotion code is stored in order notes or metadata
        -- This is a simplified version
        UPDATE promotions
        SET current_uses = current_uses + 1
        WHERE restaurant_id = NEW.restaurant_id
            AND is_active = TRUE
            AND current_uses < max_uses;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7️⃣ PREVENT DOUBLE BOOKING
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_conflict_count INT;
BEGIN
    -- Check for overlapping reservations (within 2 hours window)
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM reservations
    WHERE branch_id = NEW.branch_id
        AND table_id = NEW.table_id
        AND status IN ('Pending', 'Confirmed')
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND (
            (reservation_time BETWEEN NEW.reservation_time - INTERVAL '2 hours' 
                AND NEW.reservation_time + INTERVAL '2 hours')
        );

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Table already reserved for this time slot';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_double_booking_trigger
    BEFORE INSERT OR UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();

-- 8️⃣ AUTO EXPIRE SUBSCRIPTIONS (Run via cron job)
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET status = 'expired'
    WHERE status = 'active'
        AND end_date < now();
END;
$$ LANGUAGE plpgsql;

-- 9️⃣ GENERATE QR TOKEN FOR TABLE
CREATE OR REPLACE FUNCTION generate_qr_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qr_code_token IS NULL OR NEW.qr_code_token = '' THEN
        NEW.qr_code_token := encode(gen_random_bytes(16), 'hex');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_qr_token_trigger
    BEFORE INSERT ON tables
    FOR EACH ROW EXECUTE FUNCTION generate_qr_token();

-- 🔟 SOFT DELETE CASCADE (Optional - for audit trail)
CREATE OR REPLACE FUNCTION soft_delete_cascade_menu()
RETURNS TRIGGER AS $$
BEGIN
    -- When category is soft deleted, soft delete all menu items
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        UPDATE menu_items
        SET deleted_at = NEW.deleted_at
        WHERE category_id = NEW.id
            AND deleted_at IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER soft_delete_category_trigger
    AFTER UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION soft_delete_cascade_menu();

-- 1️⃣1️⃣ UTILITY FUNCTIONS

-- Get active subscription for restaurant
CREATE OR REPLACE FUNCTION get_active_subscription(p_restaurant_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_type VARCHAR(50),
    plan_name VARCHAR(100),
    end_date TIMESTAMP,
    max_tables INT,
    has_split_bill BOOLEAN,
    has_feedback BOOLEAN,
    has_analytics BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_type,
        sfl.plan_name,
        s.end_date,
        sfl.max_tables,
        sfl.has_split_bill,
        sfl.has_feedback,
        sfl.has_analytics
    FROM subscriptions s
    JOIN subscription_feature_limits sfl ON s.plan_type = sfl.plan_type
    WHERE s.restaurant_id = p_restaurant_id
        AND s.status = 'active'
        AND s.end_date > now()
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get table availability
CREATE OR REPLACE FUNCTION get_available_tables(
    p_branch_id UUID,
    p_party_size INT DEFAULT 1
)
RETURNS TABLE (
    table_id UUID,
    table_name VARCHAR(100),
    capacity INT,
    area_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.capacity,
        a.name
    FROM tables t
    LEFT JOIN areas a ON t.area_id = a.id
    WHERE t.branch_id = p_branch_id
        AND t.status = 'Available'
        AND t.capacity >= p_party_size
        AND t.deleted_at IS NULL
    ORDER BY t.capacity ASC, t.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Get restaurant statistics
CREATE OR REPLACE FUNCTION get_restaurant_stats(
    p_restaurant_id UUID,
    p_start_date TIMESTAMP DEFAULT now() - INTERVAL '30 days',
    p_end_date TIMESTAMP DEFAULT now()
)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue NUMERIC(14,2),
    avg_order_value NUMERIC(14,2),
    total_customers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT o.id)::BIGINT,
        COALESCE(SUM(o.total_amount), 0),
        COALESCE(AVG(o.total_amount), 0),
        COUNT(DISTINCT o.session_id)::BIGINT
    FROM orders o
    WHERE o.restaurant_id = p_restaurant_id
        AND o.status = 'Paid'
        AND o.created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_restaurant_stats IS 'Get restaurant performance statistics for dashboard';
