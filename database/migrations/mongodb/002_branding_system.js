// database/migrations/mongodb/002_branding_system.js
// MongoDB Branding System Migration

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/foodstack_db';

async function up() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();

    console.log('🚀 Starting branding system migration...');

    // 1. Create branding_themes collection
    console.log('📝 Creating branding_themes collection...');
    const themesCollection = db.collection('branding_themes');
    
    // Create indexes
    await themesCollection.createIndex({ category: 1, required_package: 1 });
    await themesCollection.createIndex({ is_active: 1 });
    await themesCollection.createIndex({ required_package: 1 });

    // Insert default themes
    const defaultThemes = [
      // Light Themes
      {
        name: 'Clean White',
        category: 'LIGHT',
        description: 'Minimalist white theme with blue accents',
        primary_color: '#3498DB',
        secondary_color: '#2ECC71',
        accent_color: '#E74C3C',
        background_color: '#FFFFFF',
        text_color: '#2C3E50',
        text_secondary: '#7F8C8D',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'FREE',
        preview_image_url: '/themes/clean-white.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Warm Beige',
        category: 'LIGHT',
        description: 'Warm and welcoming beige theme',
        primary_color: '#D4A574',
        secondary_color: '#8FBC8F',
        accent_color: '#CD853F',
        background_color: '#F5F5DC',
        text_color: '#8B4513',
        text_secondary: '#A0522D',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'FREE',
        preview_image_url: '/themes/warm-beige.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Fresh Green',
        category: 'LIGHT',
        description: 'Nature-inspired green theme',
        primary_color: '#27AE60',
        secondary_color: '#2ECC71',
        accent_color: '#F39C12',
        background_color: '#F8F9FA',
        text_color: '#2C3E50',
        text_secondary: '#6C757D',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'PRO',
        preview_image_url: '/themes/fresh-green.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ocean Blue',
        category: 'LIGHT',
        description: 'Calming ocean blue theme',
        primary_color: '#3498DB',
        secondary_color: '#5DADE2',
        accent_color: '#F39C12',
        background_color: '#EBF5FB',
        text_color: '#1B4F72',
        text_secondary: '#5D6D7E',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'PRO',
        preview_image_url: '/themes/ocean-blue.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Dark Themes
      {
        name: 'Midnight Black',
        category: 'DARK',
        description: 'Elegant dark theme with gold accents',
        primary_color: '#F1C40F',
        secondary_color: '#E67E22',
        accent_color: '#E74C3C',
        background_color: '#1C1C1C',
        text_color: '#FFFFFF',
        text_secondary: '#BDC3C7',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'PRO',
        preview_image_url: '/themes/midnight-black.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Deep Purple',
        category: 'DARK',
        description: 'Luxurious purple dark theme',
        primary_color: '#9B59B6',
        secondary_color: '#8E44AD',
        accent_color: '#F39C12',
        background_color: '#2C1810',
        text_color: '#FFFFFF',
        text_secondary: '#D5DBDB',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'PRO',
        preview_image_url: '/themes/deep-purple.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Forest Night',
        category: 'DARK',
        description: 'Dark forest green theme',
        primary_color: '#27AE60',
        secondary_color: '#229954',
        accent_color: '#F4D03F',
        background_color: '#0D2818',
        text_color: '#FFFFFF',
        text_secondary: '#CACFD2',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'ENTERPRISE',
        preview_image_url: '/themes/forest-night.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Colorful Themes
      {
        name: 'Vibrant Sunset',
        category: 'COLORFUL',
        description: 'Energetic sunset gradient theme',
        primary_color: '#FF6B35',
        secondary_color: '#F7931E',
        accent_color: '#FFD23F',
        background_color: '#FFF8F0',
        text_color: '#2C3E50',
        text_secondary: '#5D6D7E',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'PRO',
        preview_image_url: '/themes/vibrant-sunset.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Tropical Paradise',
        category: 'COLORFUL',
        description: 'Bright tropical theme',
        primary_color: '#1ABC9C',
        secondary_color: '#16A085',
        accent_color: '#F39C12',
        background_color: '#E8F8F5',
        text_color: '#0E6655',
        text_secondary: '#45B7D1',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'ENTERPRISE',
        preview_image_url: '/themes/tropical-paradise.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Minimal Themes
      {
        name: 'Pure Minimal',
        category: 'MINIMAL',
        description: 'Ultra-clean minimal design',
        primary_color: '#2C3E50',
        secondary_color: '#34495E',
        accent_color: '#3498DB',
        background_color: '#FFFFFF',
        text_color: '#2C3E50',
        text_secondary: '#95A5A6',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'FREE',
        preview_image_url: '/themes/pure-minimal.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Monochrome',
        category: 'MINIMAL',
        description: 'Black and white minimal theme',
        primary_color: '#000000',
        secondary_color: '#2C3E50',
        accent_color: '#7F8C8D',
        background_color: '#FFFFFF',
        text_color: '#000000',
        text_secondary: '#7F8C8D',
        success_color: '#27AE60',
        warning_color: '#F39C12',
        error_color: '#E74C3C',
        info_color: '#3498DB',
        font_family: 'Inter, sans-serif',
        heading_font: null,
        border_radius: 8,
        shadow_intensity: 'medium',
        required_package: 'PRO',
        preview_image_url: '/themes/monochrome.jpg',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await themesCollection.insertMany(defaultThemes);
    console.log(`✅ Inserted ${defaultThemes.length} default themes`);

    // 2. Create restaurant_branding collection
    console.log('📝 Creating restaurant_branding collection...');
    const restaurantBrandingCollection = db.collection('restaurant_branding');
    
    // Create indexes
    await restaurantBrandingCollection.createIndex({ restaurant_id: 1 }, { unique: true });
    await restaurantBrandingCollection.createIndex({ is_published: 1 });
    await restaurantBrandingCollection.createIndex({ custom_domain: 1 }, { sparse: true });

    // 3. Create branch_branding collection
    console.log('📝 Creating branch_branding collection...');
    const branchBrandingCollection = db.collection('branch_branding');
    
    // Create indexes
    await branchBrandingCollection.createIndex({ branch_id: 1 }, { unique: true });
    await branchBrandingCollection.createIndex({ restaurant_id: 1 });
    await branchBrandingCollection.createIndex({ is_published: 1 });

    // 4. Create landing_page_analytics collection
    console.log('📝 Creating landing_page_analytics collection...');
    const analyticsCollection = db.collection('landing_page_analytics');
    
    // Create indexes
    await analyticsCollection.createIndex({ restaurant_id: 1, visited_at: -1 });
    await analyticsCollection.createIndex({ branch_id: 1, visited_at: -1 });
    await analyticsCollection.createIndex({ visited_at: -1 });
    await analyticsCollection.createIndex({ visitor_ip: 1, visited_at: -1 });

    // 5. Update restaurants collection to add package info
    console.log('📝 Updating restaurants collection...');
    const restaurantsCollection = db.collection('restaurants');
    
    // Add current_package and package_expires_at fields to existing restaurants
    await restaurantsCollection.updateMany(
      { current_package: { $exists: false } },
      { 
        $set: { 
          current_package: 'FREE',
          package_expires_at: null,
          updated_at: new Date()
        } 
      }
    );

    // 6. Update branches collection to ensure branding fields exist
    console.log('📝 Updating branches collection...');
    const branchesCollection = db.collection('branches');
    
    // Ensure all branches have branding fields
    await branchesCollection.updateMany(
      {},
      { 
        $set: { 
          updated_at: new Date()
        },
        $setOnInsert: {
          logo_url: null,
          banner_url: null,
          tagline: null,
          selected_theme_id: null,
          theme_colors: null,
          layout_type: 'DEFAULT',
          gallery_images: [],
          slider_images: [],
          operating_hours: null,
          social_links: {},
          is_published: false,
          custom_domain: null,
          seo_title: null,
          seo_description: null,
          seo_keywords: null
        }
      },
      { upsert: false }
    );

    console.log('✅ Branding system migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function down() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();

    console.log('🔄 Rolling back branding system migration...');

    // Drop collections
    await db.collection('branding_themes').drop().catch(() => {});
    await db.collection('restaurant_branding').drop().catch(() => {});
    await db.collection('branch_branding').drop().catch(() => {});
    await db.collection('landing_page_analytics').drop().catch(() => {});

    // Remove package fields from restaurants
    await db.collection('restaurants').updateMany(
      {},
      { 
        $unset: { 
          current_package: '',
          package_expires_at: ''
        },
        $set: { updated_at: new Date() }
      }
    );

    console.log('✅ Rollback completed successfully!');

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

module.exports = { up, down };

// Run migration if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'up') {
    up().catch(console.error);
  } else if (command === 'down') {
    down().catch(console.error);
  } else {
    console.log('Usage: node 002_branding_system.js [up|down]');
  }
}