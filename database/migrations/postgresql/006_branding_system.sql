-- =====================================================
-- Branding System Migration
-- Adds comprehensive branding features for restaurants
-- =====================================================

-- 1. Package Types Enum
CREATE TYPE package_type_enum AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- 2. Layout Types Enum  
CREATE TYPE layout_type_enum AS ENUM (
  'DEFAULT',           -- Hero + Menu Grid
  'GRADIENT',          -- Free Package (Gradient + About Blocks)
  'CENTERED',          -- Centered Content
  'SIDEBAR',           -- Sidebar Menu
  'MASONRY',           -- Masonry Gallery
  'GALLERY'            -- Gallery Focus
);

-- 3. Theme Categories Enum
CREATE TYPE theme_category_enum AS ENUM ('LIGHT', 'DARK', 'COLORFUL', 'MINIMAL');

-- 4. Predefined Themes Table
CREATE TABLE branding_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category theme_category_enum NOT NULL,
    description TEXT,
    
    -- Color Palette
    primary_color VARCHAR(7) NOT NULL,      -- #FF6B35
    secondary_color VARCHAR(7) NOT NULL,    -- #2ECC71
    accent_color VARCHAR(7) NOT NULL,       -- #3498DB
    background_color VARCHAR(7) NOT NULL,   -- #FFFFFF
    text_color VARCHAR(7) NOT NULL,         -- #2C3E50
    text_secondary VARCHAR(7) NOT NULL,     -- #7F8C8D
    
    -- Additional Colors
    success_color VARCHAR(7) DEFAULT '#27AE60',
    warning_color VARCHAR(7) DEFAULT '#F39C12',
    error_color VARCHAR(7) DEFAULT '#E74C3C',
    info_color VARCHAR(7) DEFAULT '#3498DB',
    
    -- Typography
    font_family VARCHAR(100) DEFAULT 'Inter, sans-serif',
    heading_font VARCHAR(100),
    
    -- Layout Properties
    border_radius INTEGER DEFAULT 8,        -- px
    shadow_intensity VARCHAR(20) DEFAULT 'medium',
    
    -- Package Requirements
    required_package package_type_enum DEFAULT 'FREE',
    
    -- Preview
    preview_image_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 5. Restaurant Branding Settings
CREATE TABLE restaurant_branding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    -- Basic Info
    brand_name VARCHAR(255),
    tagline VARCHAR(500),
    description TEXT,
    
    -- Contact Info
    public_email VARCHAR(255),
    public_phone VARCHAR(20),
    website_url VARCHAR(255),
    
    -- Media
    logo_url TEXT,
    banner_url TEXT,
    favicon_url TEXT,
    
    -- Theme & Layout
    selected_theme_id UUID REFERENCES branding_themes(id),
    custom_theme_colors JSONB,              -- Override theme colors
    layout_type layout_type_enum DEFAULT 'DEFAULT',
    
    -- Gallery & Media
    gallery_images JSONB DEFAULT '[]',      -- Array of image URLs
    slider_images JSONB DEFAULT '[]',       -- Array of slider images (Enterprise only)
    
    -- About Sections
    about_section_1 JSONB,                  -- {title, content, image_url, image_position}
    about_section_2 JSONB,                  -- {title, content, image_url, image_position}
    
    -- Social Links
    social_links JSONB DEFAULT '{}',        -- {facebook, instagram, twitter, etc}
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    
    -- Settings
    is_published BOOLEAN DEFAULT false,
    custom_domain VARCHAR(255),
    
    -- Package Info
    current_package package_type_enum DEFAULT 'FREE',
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(restaurant_id)
);

-- 6. Branch Branding Overrides
CREATE TABLE branch_branding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    -- Override restaurant branding for specific branch
    brand_name VARCHAR(255),
    tagline VARCHAR(500),
    description TEXT,
    
    -- Branch-specific media
    logo_url TEXT,
    banner_url TEXT,
    
    -- Theme overrides
    selected_theme_id UUID REFERENCES branding_themes(id),
    custom_theme_colors JSONB,
    layout_type layout_type_enum,
    
    -- Branch-specific gallery
    gallery_images JSONB DEFAULT '[]',
    slider_images JSONB DEFAULT '[]',
    
    -- Branch-specific about sections
    about_section_1 JSONB,
    about_section_2 JSONB,
    
    -- Branch settings
    is_published BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(branch_id)
);

-- 7. Landing Page Analytics
CREATE TABLE landing_page_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    
    -- Visitor Info
    visitor_ip VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    
    -- Page Info
    page_url TEXT NOT NULL,
    page_title VARCHAR(255),
    
    -- Engagement
    session_duration INTEGER,              -- seconds
    pages_viewed INTEGER DEFAULT 1,
    bounce_rate BOOLEAN DEFAULT true,
    
    -- Actions
    clicked_menu BOOLEAN DEFAULT false,
    clicked_contact BOOLEAN DEFAULT false,
    clicked_social BOOLEAN DEFAULT false,
    made_reservation BOOLEAN DEFAULT false,
    
    -- Timestamp
    visited_at TIMESTAMP DEFAULT now(),
    
    -- Indexes for analytics
    INDEX idx_landing_analytics_restaurant (restaurant_id, visited_at),
    INDEX idx_landing_analytics_branch (branch_id, visited_at)
);

-- 8. Insert Default Themes

-- Light Themes
INSERT INTO branding_themes (name, category, description, primary_color, secondary_color, accent_color, background_color, text_color, text_secondary, required_package, preview_image_url) VALUES
('Clean White', 'LIGHT', 'Minimalist white theme with blue accents', '#3498DB', '#2ECC71', '#E74C3C', '#FFFFFF', '#2C3E50', '#7F8C8D', 'FREE', '/themes/clean-white.jpg'),
('Warm Beige', 'LIGHT', 'Warm and welcoming beige theme', '#D4A574', '#8FBC8F', '#CD853F', '#F5F5DC', '#8B4513', '#A0522D', 'FREE', '/themes/warm-beige.jpg'),
('Fresh Green', 'LIGHT', 'Nature-inspired green theme', '#27AE60', '#2ECC71', '#F39C12', '#F8F9FA', '#2C3E50', '#6C757D', 'PRO', '/themes/fresh-green.jpg'),
('Ocean Blue', 'LIGHT', 'Calming ocean blue theme', '#3498DB', '#5DADE2', '#F39C12', '#EBF5FB', '#1B4F72', '#5D6D7E', 'PRO', '/themes/ocean-blue.jpg');

-- Dark Themes  
INSERT INTO branding_themes (name, category, description, primary_color, secondary_color, accent_color, background_color, text_color, text_secondary, required_package, preview_image_url) VALUES
('Midnight Black', 'DARK', 'Elegant dark theme with gold accents', '#F1C40F', '#E67E22', '#E74C3C', '#1C1C1C', '#FFFFFF', '#BDC3C7', 'PRO', '/themes/midnight-black.jpg'),
('Deep Purple', 'DARK', 'Luxurious purple dark theme', '#9B59B6', '#8E44AD', '#F39C12', '#2C1810', '#FFFFFF', '#D5DBDB', 'PRO', '/themes/deep-purple.jpg'),
('Forest Night', 'DARK', 'Dark forest green theme', '#27AE60', '#229954', '#F4D03F', '#0D2818', '#FFFFFF', '#CACFD2', 'ENTERPRISE', '/themes/forest-night.jpg');

-- Colorful Themes
INSERT INTO branding_themes (name, category, description, primary_color, secondary_color, accent_color, background_color, text_color, text_secondary, required_package, preview_image_url) VALUES
('Vibrant Sunset', 'COLORFUL', 'Energetic sunset gradient theme', '#FF6B35', '#F7931E', '#FFD23F', '#FFF8F0', '#2C3E50', '#5D6D7E', 'PRO', '/themes/vibrant-sunset.jpg'),
('Tropical Paradise', 'COLORFUL', 'Bright tropical theme', '#1ABC9C', '#16A085', '#F39C12', '#E8F8F5', '#0E6655', '#45B7D1', 'ENTERPRISE', '/themes/tropical-paradise.jpg');

-- Minimal Themes
INSERT INTO branding_themes (name, category, description, primary_color, secondary_color, accent_color, background_color, text_color, text_secondary, required_package, preview_image_url) VALUES
('Pure Minimal', 'MINIMAL', 'Ultra-clean minimal design', '#2C3E50', '#34495E', '#3498DB', '#FFFFFF', '#2C3E50', '#95A5A6', 'FREE', '/themes/pure-minimal.jpg'),
('Monochrome', 'MINIMAL', 'Black and white minimal theme', '#000000', '#2C3E50', '#7F8C8D', '#FFFFFF', '#000000', '#7F8C8D', 'PRO', '/themes/monochrome.jpg');

-- 9. Add branding columns to existing tables if not exists

-- Add package info to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS current_package package_type_enum DEFAULT 'FREE';
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMP;

-- Add branding fields to branches table if not exists
ALTER TABLE branches ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_branding_themes_category ON branding_themes(category, required_package);
CREATE INDEX IF NOT EXISTS idx_branding_themes_package ON branding_themes(required_package);
CREATE INDEX IF NOT EXISTS idx_restaurant_branding_published ON restaurant_branding(is_published);
CREATE INDEX IF NOT EXISTS idx_branch_branding_published ON branch_branding(is_published);

-- 11. Create function to generate branch slug
CREATE OR REPLACE FUNCTION generate_branch_slug(branch_name TEXT, restaurant_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from branch name
    base_slug := lower(regexp_replace(branch_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'branch';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM branches WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 12. Update existing branches with slugs
UPDATE branches 
SET slug = generate_branch_slug(name, restaurant_id) 
WHERE slug IS NULL;

COMMIT;