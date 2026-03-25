-- Subscription System Migration
-- Add subscription tracking for restaurants

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'free', 'pro', 'vip'
  display_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurant_subscriptions table
CREATE TABLE IF NOT EXISTS restaurant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'pending'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, started_at)
);

-- Create subscription_payments table
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES restaurant_subscriptions(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  amount DECIMAL(10, 2) NOT NULL,
  vat_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'card', 'momo', 'zalopay'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payos_order_code VARCHAR(50) UNIQUE,
  payos_data JSONB,
  transaction_ref VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, price, features, limits) VALUES
('free', 'Free', 0, 
  '{"upload_photos": true, "analytics": true, "branch_landing": false, "theme_selection": false, "gallery_images": false, "image_slider": false}'::jsonb,
  '{"branches": 3, "menu_items": 50, "customizations_per_category": 5, "layouts": 1, "themes": 1}'::jsonb
),
('pro', 'Pro', 4000,
  '{"upload_photos": true, "analytics": true, "branch_landing": true, "theme_selection": true, "gallery_images": true, "image_slider": false}'::jsonb,
  '{"branches": -1, "menu_items": -1, "customizations_per_category": -1, "layouts": 8, "themes": 8}'::jsonb
),
('vip', 'VIP', 9000,
  '{"upload_photos": true, "analytics": true, "branch_landing": true, "theme_selection": true, "gallery_images": true, "image_slider": true, "custom_domain": true, "api_integration": true}'::jsonb,
  '{"branches": -1, "menu_items": -1, "customizations_per_category": -1, "layouts": 12, "themes": 12}'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_restaurant ON restaurant_subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_status ON restaurant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_expires ON restaurant_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_restaurant ON subscription_payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_payos_order ON subscription_payments(payos_order_code);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_subscriptions_updated_at
  BEFORE UPDATE ON restaurant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER update_subscription_payments_updated_at
  BEFORE UPDATE ON subscription_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Assign all existing restaurants to free plan
INSERT INTO restaurant_subscriptions (restaurant_id, plan_id, status, started_at, expires_at)
SELECT 
  r.id,
  (SELECT id FROM subscription_plans WHERE name = 'free'),
  'active',
  CURRENT_TIMESTAMP,
  NULL -- Free plan never expires
FROM restaurants r
WHERE NOT EXISTS (
  SELECT 1 FROM restaurant_subscriptions rs WHERE rs.restaurant_id = r.id
);
