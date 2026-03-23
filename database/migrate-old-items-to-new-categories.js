/**
 * Migrate old menu items to new categories
 * Run: node database/migrate-old-items-to-new-categories.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

async function migrateItems() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    const restaurant = await db.collection('restaurants').findOne({});
    console.log(`📍 Restaurant: ${restaurant.name}\n`);
    
    // Get all categories
    const categories = await db.collection('categories').find({
      restaurant_id: restaurant._id
    }).toArray();
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    
    console.log('📁 Available categories:');
    Object.keys(categoryMap).forEach(name => {
      console.log(`   - ${name}`);
    });
    console.log('');
    
    // Migration mapping
    const migrations = [
      { from: 'Phở Bò', to: 'Phở' },
      { from: 'Phở Gà', to: 'Phở' },
      { from: 'Phở Đặc Biệt', to: 'Phở' },
      { from: 'Món Ăn Kèm', to: 'Món Thêm' }
    ];
    
    let totalMigrated = 0;
    
    for (const migration of migrations) {
      const fromCategoryId = categoryMap[migration.from];
      const toCategoryId = categoryMap[migration.to];
      
      if (!fromCategoryId) {
        console.log(`⏭️  Skip: Category "${migration.from}" not found`);
        continue;
      }
      
      if (!toCategoryId) {
        console.log(`⏭️  Skip: Target category "${migration.to}" not found`);
        continue;
      }
      
      // Find items in old category
      const items = await db.collection('menu_items').find({
        category_id: fromCategoryId,
        deleted_at: null
      }).toArray();
      
      if (items.length === 0) {
        console.log(`⏭️  "${migration.from}" → "${migration.to}": No items to migrate`);
        continue;
      }
      
      // Update items to new category
      const result = await db.collection('menu_items').updateMany(
        {
          category_id: fromCategoryId,
          deleted_at: null
        },
        {
          $set: {
            category_id: toCategoryId,
            updated_at: new Date()
          }
        }
      );
      
      console.log(`✅ "${migration.from}" → "${migration.to}": Migrated ${result.modifiedCount} items`);
      items.forEach(item => {
        console.log(`   - ${item.name}`);
      });
      
      totalMigrated += result.modifiedCount;
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`📊 Total migrated: ${totalMigrated} items`);
    console.log('='.repeat(70));
    
    // Show final count
    console.log('\n📋 Final menu breakdown:');
    const finalCategories = ['Phở', 'Món Thêm', 'Khai Vị', 'Đồ Uống'];
    for (const catName of finalCategories) {
      const catId = categoryMap[catName];
      if (catId) {
        const count = await db.collection('menu_items').countDocuments({
          category_id: catId,
          deleted_at: null
        });
        console.log(`   ${catName}: ${count} items`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrateItems();
