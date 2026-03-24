// Seed predefined branding themes to MongoDB
const { MongoClient } = require('mongodb');
require('dotenv').config();

const themes = [
  // Dark Themes
  {
    name: 'Midnight Blue',
    category: 'dark',
    description: 'Xanh đêm sang trọng',
    colors: {
      pageBackground: '220 25% 10%',
      heroBackground: '220 30% 15%',
      heroText: '0 0% 100%',
      heroAccent: '210 100% 60%',
      cardBackground: '220 20% 18%',
      cardBorder: '220 20% 25%',
      buttonPrimary: '210 100% 50%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '220 20% 30%',
      buttonSecondaryText: '0 0% 100%',
      headingColor: '0 0% 95%',
      bodyTextColor: '220 10% 80%'
    },
    package_required: 'PRO',
    is_active: true
  },
  {
    name: 'Forest Night',
    category: 'dark',
    description: 'Xanh rừng tối',
    colors: {
      pageBackground: '150 20% 12%',
      heroBackground: '150 25% 18%',
      heroText: '0 0% 100%',
      heroAccent: '150 60% 50%',
      cardBackground: '150 15% 20%',
      cardBorder: '150 15% 28%',
      buttonPrimary: '150 55% 45%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '150 15% 32%',
      buttonSecondaryText: '0 0% 100%',
      headingColor: '0 0% 95%',
      bodyTextColor: '150 10% 75%'
    },
    package_required: 'PRO',
    is_active: true
  },
  {
    name: 'Sunset Dark',
    category: 'dark',
    description: 'Cam hoàng hôn tối',
    colors: {
      pageBackground: '20 30% 15%',
      heroBackground: '20 40% 20%',
      heroText: '0 0% 100%',
      heroAccent: '30 90% 60%',
      cardBackground: '20 25% 22%',
      cardBorder: '20 25% 30%',
      buttonPrimary: '30 85% 55%',
      buttonPrimaryText: '20 30% 10%',
      buttonSecondary: '20 25% 35%',
      buttonSecondaryText: '0 0% 100%',
      headingColor: '0 0% 95%',
      bodyTextColor: '20 15% 80%'
    },
    package_required: 'PRO',
    is_active: true
  },
  {
    name: 'Royal Purple',
    category: 'dark',
    description: 'Tím hoàng gia',
    colors: {
      pageBackground: '270 30% 12%',
      heroBackground: '270 35% 18%',
      heroText: '0 0% 100%',
      heroAccent: '280 70% 60%',
      cardBackground: '270 25% 20%',
      cardBorder: '270 25% 28%',
      buttonPrimary: '280 65% 55%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '270 25% 32%',
      buttonSecondaryText: '0 0% 100%',
      headingColor: '0 0% 95%',
      bodyTextColor: '270 15% 80%'
    },
    package_required: 'ENTERPRISE',
    is_active: true
  },
  
  // Light Themes
  {
    name: 'Warm Cream',
    category: 'light',
    description: 'Kem ấm áp',
    colors: {
      pageBackground: '40 30% 95%',
      heroBackground: '40 40% 90%',
      heroText: '40 30% 20%',
      heroAccent: '25 80% 50%',
      cardBackground: '0 0% 100%',
      cardBorder: '40 20% 85%',
      buttonPrimary: '25 75% 45%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '40 30% 85%',
      buttonSecondaryText: '40 30% 20%',
      headingColor: '40 30% 15%',
      bodyTextColor: '40 15% 35%'
    },
    package_required: 'FREE',
    is_active: true
  },
  {
    name: 'Ocean Breeze',
    category: 'light',
    description: 'Xanh biển nhẹ nhàng',
    colors: {
      pageBackground: '200 30% 95%',
      heroBackground: '200 40% 88%',
      heroText: '200 40% 20%',
      heroAccent: '195 85% 45%',
      cardBackground: '0 0% 100%',
      cardBorder: '200 25% 85%',
      buttonPrimary: '195 80% 40%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '200 30% 85%',
      buttonSecondaryText: '200 40% 20%',
      headingColor: '200 40% 15%',
      bodyTextColor: '200 20% 30%'
    },
    package_required: 'PRO',
    is_active: true
  },
  {
    name: 'Rose Garden',
    category: 'light',
    description: 'Hồng vườn hoa',
    colors: {
      pageBackground: '350 25% 95%',
      heroBackground: '350 35% 90%',
      heroText: '350 30% 20%',
      heroAccent: '340 75% 55%',
      cardBackground: '0 0% 100%',
      cardBorder: '350 20% 88%',
      buttonPrimary: '340 70% 50%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '350 25% 88%',
      buttonSecondaryText: '350 30% 20%',
      headingColor: '350 30% 15%',
      bodyTextColor: '350 15% 30%'
    },
    package_required: 'PRO',
    is_active: true
  },
  {
    name: 'Fresh Mint',
    category: 'light',
    description: 'Xanh bạc hà tươi mát',
    colors: {
      pageBackground: '160 25% 95%',
      heroBackground: '160 30% 90%',
      heroText: '160 30% 20%',
      heroAccent: '165 65% 45%',
      cardBackground: '0 0% 100%',
      cardBorder: '160 20% 88%',
      buttonPrimary: '165 60% 40%',
      buttonPrimaryText: '0 0% 100%',
      buttonSecondary: '160 25% 88%',
      buttonSecondaryText: '160 30% 20%',
      headingColor: '160 30% 15%',
      bodyTextColor: '160 15% 30%'
    },
    package_required: 'ENTERPRISE',
    is_active: true
  }
];

async function seedThemes() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('branding_themes');
    
    // Clear existing themes
    await collection.deleteMany({});
    console.log('🗑️  Cleared existing themes');
    
    // Insert new themes
    const result = await collection.insertMany(themes);
    console.log(`✅ Inserted ${result.insertedCount} themes`);
    
    // Display inserted themes
    const insertedThemes = await collection.find({}).toArray();
    console.log('\n📋 Themes:');
    insertedThemes.forEach(theme => {
      console.log(`  - ${theme.name} (${theme.category}) [${theme.package_required}]`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding themes:', error);
  } finally {
    await client.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedThemes();
}

module.exports = { seedThemes, themes };
