-- =====================================================
-- QR Service Platform - PostgreSQL Complete Schema
-- =====================================================

-- 1️⃣ EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2️⃣ ENUM TYPES

-- Restaurant
CREATE TYPE restaurant_status_enum AS ENUM ('active','suspended','churned');

-- User
CREATE TYPE user_role_enum AS ENUM ('Owner','Manager','Staff');
CREATE TYPE user_status_enum AS ENUM ('active','inactive','suspended');

-- Branch
CREATE TYPE branch_status_enum AS ENUM ('active','inactive');

-- Table
CREATE TYPE table_status_enum AS ENUM ('Available','Occupied','Reserved','OutOfService');

-- Order
CREATE TYPE order_status_enum AS ENUM ('Pending','Preparing','Ready','Served','Paid','Cancelled');
CREATE TYPE payment_status_enum AS ENUM ('Pending','Success','Failed','Refunded');
CREATE TYPE payment_method_enum AS ENUM ('PayOS','Cash','CreditCard','BankTransfer');

-- Reservation
CREATE TYPE reservation_status_enum AS ENUM ('Pending','Confirmed','Cancelled','Seated','Completed','NoShow');

-- Subscription
CREATE TYPE subscription_status_enum AS ENUM ('active','expired','cancelled','trial');

-- Invoice
CREATE TYPE invoice_status_enum AS ENUM ('unpaid','paid','overdue','cancelled');

-- Notification
CREATE TYPE notification_type_enum AS ENUM ('ORDER_PLACED','SERVICE_REQUEST','RESERVATION','PAYMENT_SUCCESS','SYSTEM_ALERT');

-- Service Request
CREATE TYPE service_request_type_enum AS ENUM ('CALL_STAFF','REQUEST_WATER','REQUEST_NAPKIN','REQUEST_UTENSILS','REQUEST_BILL','REQUEST_MENU','COMPLAINT','OTHER');
CREATE TYPE service_request_status_enum AS ENUM ('PENDING','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','CANCELLED');

-- 3️⃣ TENANT & SUBSCRIPTION

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    logo_url TEXT,
    status restaurant_status_enum DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_email ON restaurants(email) WHERE deleted_at IS NULL;

CREATE TABLE subscription_feature_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_type VARCHAR(50) UNIQUE NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    max_branches INT NOT NULL DEFAULT 1,
    max_tables INT NOT NULL,
    has_split_bill BOOLEAN DEFAULT FALSE,
    has_feedback BOOLEAN DEFAULT FALSE,
    has_analytics BOOLEAN DEFAULT FALSE,
    has_reservation BOOLEAN DEFAULT TRUE,
    has_qr_service BOOLEAN DEFAULT TRUE,
    monthly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- Insert default plans
INSERT INTO subscription_feature_limits (plan_type, plan_name, max_branches, max_tables, has_split_bill, has_feedback, has_analytics, monthly_price) VALUES
('BASIC', 'Basic Plan', 1, 10, FALSE, FALSE, FALSE, 0),
('STANDARD', 'Standard Plan', 3, 50, TRUE, TRUE, FALSE, 299000),
('ADVANCED', 'Advanced Plan', 999, 999, TRUE, TRUE, TRUE, 999000);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL REFERENCES subscription_feature_limits(plan_type),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    status subscription_status_enum DEFAULT 'active',
    payos_ref VARCHAR(255),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT check_subscription_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_subscriptions_restaurant ON subscriptions(restaurant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date) WHERE status = 'active';

-- 4️⃣ ORGANIZATION

-- Branches
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    open_time TIME,
    close_time TIME,
    status branch_status_enum DEFAULT 'active',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_branches_restaurant ON branches(restaurant_id);
CREATE INDEX idx_branches_status ON branches(status) WHERE deleted_at IS NULL;

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role_enum NOT NULL,
    status user_status_enum DEFAULT 'active',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_restaurant ON users(restaurant_id);
CREATE INDEX idx_users_branch ON users(branch_id);
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(restaurant_id, role) WHERE status = 'active' AND deleted_at IS NULL;

-- 5️⃣ FACILITIES

-- Areas
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_areas_branch ON areas(branch_id);

-- Tables
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    status table_status_enum DEFAULT 'Available',
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    position_x INT,
    position_y INT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP,
    CONSTRAINT check_capacity_positive CHECK (capacity > 0)
);

CREATE INDEX idx_tables_branch ON tables(branch_id);
CREATE INDEX idx_tables_status ON tables(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tables_branch_status ON tables(branch_id, status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_tables_qr_token ON tables(qr_code_token);

-- 6️⃣ MENU SYSTEM

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_categories_branch ON categories(branch_id) WHERE deleted_at IS NULL;

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    deleted_at TIMESTAMP,
    CONSTRAINT check_price_positive CHECK (price >= 0)
);

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_branch_category ON menu_items(branch_id, category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_items_available ON menu_items(restaurant_id, is_available) WHERE deleted_at IS NULL;

-- Menu Item Availability (Real-time stock)
CREATE TABLE menu_item_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    reason TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(menu_item_id, branch_id)
);

CREATE INDEX idx_item_availability_branch ON menu_item_availability(branch_id);
CREATE INDEX idx_item_availability_item ON menu_item_availability(menu_item_id);

-- Customization System
CREATE TABLE customization_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    min_select INT DEFAULT 0,
    max_select INT DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE TABLE customization_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES customization_groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price_delta NUMERIC(12,2) DEFAULT 0,
    sort_order INT DEFAULT 0,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_customization_options_group ON customization_options(group_id);

CREATE TABLE item_customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES customization_groups(id) ON DELETE CASCADE,
    UNIQUE(menu_item_id, group_id)
);

CREATE INDEX idx_item_customizations_item ON item_customizations(menu_item_id);

-- 7️⃣ ORDER SESSIONS

CREATE TABLE order_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    customer_count INT DEFAULT 1,
    started_at TIMESTAMP DEFAULT now(),
    ended_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_table ON order_sessions(table_id);
CREATE INDEX idx_sessions_active ON order_sessions(table_id, is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX idx_sessions_token ON order_sessions(session_token);

-- 8️⃣ ORDERS (ACID CRITICAL)

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    table_id UUID NOT NULL REFERENCES tables(id),
    session_id UUID REFERENCES order_sessions(id) ON DELETE SET NULL,
    status order_status_enum DEFAULT 'Pending',
    sub_total NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(14,2) DEFAULT 0,
    service_charge_amount NUMERIC(14,2) DEFAULT 0,
    discount_amount NUMERIC(14,2) DEFAULT 0,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    payment_status payment_status_enum DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    closed_at TIMESTAMP,
    CONSTRAINT check_total_positive CHECK (total_amount >= 0)
);

CREATE INDEX idx_orders_branch ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_branch_status_date ON orders(branch_id, status, created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status) WHERE payment_status = 'Pending';

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    session_id VARCHAR(255),
    quantity INT NOT NULL,
    base_price NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    CONSTRAINT check_quantity_positive CHECK (quantity > 0),
    CONSTRAINT check_base_price_positive CHECK (base_price >= 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item ON order_items(menu_item_id);

CREATE TABLE order_item_customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES customization_options(id),
    price_delta NUMERIC(12,2) DEFAULT 0
);

CREATE INDEX idx_order_item_customizations_item ON order_item_customizations(order_item_id);

-- 9️⃣ PAYMENTS & INVOICES

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(14,2) NOT NULL,
    method payment_method_enum NOT NULL,
    status payment_status_enum DEFAULT 'Pending',
    transaction_ref VARCHAR(255),
    payos_data JSONB,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT check_payment_amount_positive CHECK (amount >= 0)
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_ref ON payments(transaction_ref);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(14,2) NOT NULL,
    status invoice_status_enum DEFAULT 'unpaid',
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    issued_at TIMESTAMP DEFAULT now(),
    CONSTRAINT check_invoice_amount_positive CHECK (amount >= 0)
);

CREATE INDEX idx_invoices_restaurant ON invoices(restaurant_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- 🔟 RESERVATIONS

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    reservation_time TIMESTAMP NOT NULL,
    party_size INT NOT NULL,
    status reservation_status_enum DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT check_party_size_positive CHECK (party_size > 0)
);

CREATE INDEX idx_reservations_branch ON reservations(branch_id);
CREATE INDEX idx_reservations_time ON reservations(reservation_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_branch_time ON reservations(branch_id, reservation_time, status);

-- 1️⃣1️⃣ NOTIFICATIONS

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_restaurant ON notifications(restaurant_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- 1️⃣2️⃣ PROMOTIONS

CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_percent NUMERIC(5,2),
    discount_amount NUMERIC(12,2),
    min_order_amount NUMERIC(12,2) DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    max_uses INT,
    current_uses INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now(),
    CONSTRAINT check_promotion_dates CHECK (valid_to > valid_from),
    CONSTRAINT check_discount_valid CHECK (
        (discount_percent IS NOT NULL AND discount_percent > 0 AND discount_percent <= 100) OR
        (discount_amount IS NOT NULL AND discount_amount > 0)
    )
);

CREATE INDEX idx_promotions_restaurant ON promotions(restaurant_id);
CREATE INDEX idx_promotions_code ON promotions(code) WHERE is_active = TRUE;
CREATE INDEX idx_promotions_active ON promotions(restaurant_id, is_active, valid_from, valid_to);

-- 1️⃣3️⃣ TABLE MERGE HISTORY

CREATE TABLE table_merge_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    target_table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    merged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    merged_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_table_merge_source ON table_merge_history(source_table_id);
CREATE INDEX idx_table_merge_target ON table_merge_history(target_table_id);

-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto update table status when order created
CREATE OR REPLACE FUNCTION update_table_status_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tables 
        SET status = 'Occupied'
        WHERE id = NEW.table_id AND status = 'Available';
    ELSIF TG_OP = 'UPDATE' THEN
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

-- Auto close session when order paid
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

-- Generate QR token for table
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

-- Prevent double booking
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_conflict_count INT;
BEGIN
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

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Get active subscription
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

-- Get available tables
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

-- =====================================================
-- COMPLETED
-- =====================================================
