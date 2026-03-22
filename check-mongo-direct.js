const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkMongo() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // Check categories
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`=== Categories (${categories.length}) ===`);
    categories.forEach(cat => {
      console.log(`- ${cat.name}`);
      console.log(`  restaurant_id: ${cat.restaurant_id}`);
      console.log(`  branch_id: ${cat.branch_id || 'N/A'}`);
    });
    
    // Check menu items
    const menuItems = await db.collection('menu_items').find({}).toArray();
    console.log(`\n=== Menu Items (${menuItems.length}) ===`);
    menuItems.forEach(item => {
      console.log(`- ${item.name} - ${item.price}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkMongo();
