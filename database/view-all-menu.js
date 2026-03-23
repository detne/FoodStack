/**
 * Script to view all menu items in database
 * Run: node database/view-all-menu.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

async function viewAllMenu() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // Get restaurant
    const restaurant = await db.collection('restaurants').findOne({});
    console.log(`📍 Restaurant: ${restaurant.name}\n`);
    
    // Get all categories
    const categories = await db.collection('categories').find({
      restaurant_id: restaurant._id,
      deleted_at: null
    }).sort({ sort_order: 1, name: 1 }).toArray();
    
    console.log('=' .repeat(80));
    console.log('📋 FULL MENU');
    console.log('='.repeat(80));
    
    let totalItems = 0;
    
    for (const category of categories) {
      const items = await db.collection('menu_items').find({
        category_id: category._id,
        deleted_at: null
      }).sort({ name: 1 }).toArray();
      
      if (items.length > 0) {
        console.log(`\n📁 ${category.name.toUpperCase()} (${items.length} items)`);
        console.log('-'.repeat(80));
        
        items.forEach((item, index) => {
          const price = item.price.toLocaleString('vi-VN').padStart(8);
          const available = item.available ? '✓' : '✗';
          console.log(`${(index + 1).toString().padStart(3)}. ${available} ${item.name.padEnd(35)} ${price}đ`);
        });
        
        totalItems += items.length;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 TOTAL: ${totalItems} items in ${categories.length} categories`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

viewAllMenu();
