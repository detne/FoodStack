/**
 * Clean up duplicate and empty categories
 * Run: node database/cleanup-duplicate-empty-categories.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

async function cleanupDuplicates() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    const restaurant = await db.collection('restaurants').findOne({});
    console.log(`📍 Restaurant: ${restaurant.name}\n`);
    
    // Get all active categories
    const activeCategories = await db.collection('categories').find({
      restaurant_id: restaurant._id,
      deleted_at: null
    }).toArray();
    
    console.log('🔍 Checking for duplicates and empty categories...\n');
    
    const categoryNames = {};
    const toDelete = [];
    
    for (const cat of activeCategories) {
      const itemCount = await db.collection('menu_items').countDocuments({
        category_id: cat._id,
        deleted_at: null
      });
      
      const normalizedName = cat.name.toLowerCase().trim();
      
      // Check if empty
      if (itemCount === 0) {
        console.log(`🗑️  Empty: "${cat.name}" (${itemCount} items) - will delete`);
        toDelete.push(cat._id);
        continue;
      }
      
      // Check if duplicate
      if (categoryNames[normalizedName]) {
        console.log(`🗑️  Duplicate: "${cat.name}" (${itemCount} items) - will delete`);
        toDelete.push(cat._id);
      } else {
        categoryNames[normalizedName] = cat;
        console.log(`✅ Keep: "${cat.name}" (${itemCount} items)`);
      }
    }
    
    if (toDelete.length === 0) {
      console.log('\n✅ No duplicates or empty categories found!');
    } else {
      console.log(`\n⚠️  Found ${toDelete.length} categories to delete`);
      console.log('Deleting...\n');
      
      for (const catId of toDelete) {
        await db.collection('categories').updateOne(
          { _id: catId },
          { 
            $set: { 
              deleted_at: new Date(),
              updated_at: new Date()
            } 
          }
        );
        console.log(`✅ Deleted category: ${catId}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL RESULT');
    console.log('='.repeat(70));
    
    // Show remaining categories
    const finalCategories = await db.collection('categories').find({
      restaurant_id: restaurant._id,
      deleted_at: null
    }).sort({ name: 1 }).toArray();
    
    let totalItems = 0;
    for (const cat of finalCategories) {
      const count = await db.collection('menu_items').countDocuments({
        category_id: cat._id,
        deleted_at: null
      });
      console.log(`   ${cat.name}: ${count} items`);
      totalItems += count;
    }
    
    console.log(`\n   Total: ${finalCategories.length} categories, ${totalItems} items`);
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupDuplicates();
