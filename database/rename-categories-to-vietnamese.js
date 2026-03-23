/**
 * Rename categories to Vietnamese
 * Run: node database/rename-categories-to-vietnamese.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

async function renameCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    const restaurant = await db.collection('restaurants').findOne({});
    console.log(`📍 Restaurant: ${restaurant.name}\n`);
    
    // Mapping from English to Vietnamese
    const renameMappings = [
      { from: 'Main Course', to: 'Món Chính' },
      { from: 'Appetizers', to: 'Khai Vị' },
      { from: 'Soups', to: 'Súp & Canh' },
      { from: 'Beverages', to: 'Đồ Uống' },
      { from: 'Desserts', to: 'Tráng Miệng' }
    ];
    
    console.log('🔄 Renaming categories...\n');
    
    let renamedCount = 0;
    
    for (const mapping of renameMappings) {
      // Check if old category exists
      const oldCategory = await db.collection('categories').findOne({
        restaurant_id: restaurant._id,
        name: mapping.from
      });
      
      if (!oldCategory) {
        console.log(`⏭️  Skip: "${mapping.from}" not found`);
        continue;
      }
      
      // Check if new name already exists
      const existingNew = await db.collection('categories').findOne({
        restaurant_id: restaurant._id,
        name: mapping.to
      });
      
      if (existingNew && existingNew._id.toString() !== oldCategory._id.toString()) {
        console.log(`⚠️  "${mapping.from}": Target name "${mapping.to}" already exists, merging items...`);
        
        // Move items from old to new category
        const itemCount = await db.collection('menu_items').countDocuments({
          category_id: oldCategory._id,
          deleted_at: null
        });
        
        if (itemCount > 0) {
          await db.collection('menu_items').updateMany(
            {
              category_id: oldCategory._id,
              deleted_at: null
            },
            {
              $set: {
                category_id: existingNew._id,
                updated_at: new Date()
              }
            }
          );
          console.log(`   ✅ Moved ${itemCount} items to existing "${mapping.to}"`);
        }
        
        // Delete old category
        await db.collection('categories').updateOne(
          { _id: oldCategory._id },
          { $set: { deleted_at: new Date() } }
        );
        console.log(`   ✅ Deleted old category "${mapping.from}"`);
        
        renamedCount++;
        continue;
      }
      
      // Rename category
      const result = await db.collection('categories').updateOne(
        {
          _id: oldCategory._id
        },
        {
          $set: {
            name: mapping.to,
            updated_at: new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        const itemCount = await db.collection('menu_items').countDocuments({
          category_id: oldCategory._id,
          deleted_at: null
        });
        console.log(`✅ "${mapping.from}" → "${mapping.to}" (${itemCount} items)`);
        renamedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`📊 Total renamed: ${renamedCount} categories`);
    console.log('='.repeat(70));
    
    // Show all categories
    console.log('\n📋 All categories:');
    const allCategories = await db.collection('categories').find({
      restaurant_id: restaurant._id,
      deleted_at: null
    }).sort({ sort_order: 1, name: 1 }).toArray();
    
    for (const cat of allCategories) {
      const itemCount = await db.collection('menu_items').countDocuments({
        category_id: cat._id,
        deleted_at: null
      });
      console.log(`   ${cat.name}: ${itemCount} items`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

renameCategories();
