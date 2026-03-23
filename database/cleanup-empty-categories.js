/**
 * Clean up empty categories
 * Run: node database/cleanup-empty-categories.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

async function cleanupCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    const restaurant = await db.collection('restaurants').findOne({});
    console.log(`📍 Restaurant: ${restaurant.name}\n`);
    
    // Get all categories
    const allCategories = await db.collection('categories').find({
      restaurant_id: restaurant._id,
      deleted_at: null
    }).toArray();
    
    console.log('🔍 Checking categories...\n');
    
    let deletedCount = 0;
    const emptyCategories = [];
    
    for (const category of allCategories) {
      const itemCount = await db.collection('menu_items').countDocuments({
        category_id: category._id,
        deleted_at: null
      });
      
      if (itemCount === 0) {
        emptyCategories.push(category);
        console.log(`🗑️  Empty category: "${category.name}"`);
      } else {
        console.log(`✓ ${category.name}: ${itemCount} items`);
      }
    }
    
    if (emptyCategories.length === 0) {
      console.log('\n✅ No empty categories found!');
    } else {
      console.log(`\n⚠️  Found ${emptyCategories.length} empty categories`);
      console.log('Deleting empty categories...\n');
      
      for (const category of emptyCategories) {
        await db.collection('categories').updateOne(
          { _id: category._id },
          { 
            $set: { 
              deleted_at: new Date(),
              updated_at: new Date()
            } 
          }
        );
        console.log(`✅ Deleted: "${category.name}"`);
        deletedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`📊 Summary: Deleted ${deletedCount} empty categories`);
    console.log('='.repeat(70));
    
    // Show remaining categories
    console.log('\n📋 Active categories:');
    const activeCategories = await db.collection('categories').find({
      restaurant_id: restaurant._id,
      deleted_at: null
    }).sort({ name: 1 }).toArray();
    
    let totalItems = 0;
    for (const cat of activeCategories) {
      const count = await db.collection('menu_items').countDocuments({
        category_id: cat._id,
        deleted_at: null
      });
      console.log(`   ${cat.name}: ${count} items`);
      totalItems += count;
    }
    
    console.log(`\n   Total: ${activeCategories.length} categories, ${totalItems} items`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupCategories();
