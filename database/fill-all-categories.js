/**
 * Fill all categories with menu items (3-4 items each)
 * Run: node database/fill-all-categories.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

const menuItemsByCategory = {
  'Món Chính': [
    { name: 'Cơm Tấm Sườn Bì', description: 'Broken rice with grilled pork chop and shredded pork skin', price: 65000 },
    { name: 'Bún Bò Huế', description: 'Spicy beef noodle soup from Hue', price: 70000 },
    { name: 'Mì Xào Giòn Hải Sản', description: 'Crispy fried noodles with seafood', price: 75000 },
    { name: 'Cơm Chiên Dương Châu', description: 'Yang Chow fried rice', price: 60000 }
  ],
  
  'Súp & Canh': [
    { name: 'Canh Chua Cá', description: 'Sweet and sour fish soup', price: 80000 },
    { name: 'Súp Hải Sản', description: 'Seafood soup', price: 90000 },
    { name: 'Canh Rau Củ', description: 'Vegetable soup', price: 45000 },
    { name: 'Súp Gà Nấm', description: 'Chicken and mushroom soup', price: 65000 }
  ],
  
  'Tráng Miệng': [
    { name: 'Chè Ba Màu', description: 'Three-color dessert with beans and coconut milk', price: 30000 },
    { name: 'Bánh Flan', description: 'Vietnamese caramel custard', price: 25000 },
    { name: 'Chè Thái', description: 'Thai-style sweet dessert soup', price: 35000 },
    { name: 'Yaourt Dẻo', description: 'Vietnamese yogurt', price: 20000 }
  ]
};

async function fillCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    const restaurant = await db.collection('restaurants').findOne({});
    console.log(`📍 Restaurant: ${restaurant.name}\n`);
    
    let totalAdded = 0;
    
    for (const [categoryName, items] of Object.entries(menuItemsByCategory)) {
      console.log(`\n📁 Category: ${categoryName}`);
      console.log('-'.repeat(70));
      
      // Find category
      const category = await db.collection('categories').findOne({
        restaurant_id: restaurant._id,
        name: categoryName,
        deleted_at: null
      });
      
      if (!category) {
        console.log(`⚠️  Category "${categoryName}" not found, skipping...`);
        continue;
      }
      
      // Check current item count
      const currentCount = await db.collection('menu_items').countDocuments({
        category_id: category._id,
        deleted_at: null
      });
      
      console.log(`Current items: ${currentCount}`);
      
      // Add items
      let addedCount = 0;
      for (const item of items) {
        // Check if item already exists
        const existing = await db.collection('menu_items').findOne({
          category_id: category._id,
          name: item.name,
          deleted_at: null
        });
        
        if (existing) {
          console.log(`⏭️  ${item.name} (already exists)`);
          continue;
        }
        
        // Insert item
        await db.collection('menu_items').insertOne({
          _id: new ObjectId(),
          category_id: category._id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: `https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          available: true,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        });
        
        console.log(`✅ ${item.name} - ${item.price.toLocaleString('vi-VN')}đ`);
        addedCount++;
        totalAdded++;
      }
      
      const finalCount = currentCount + addedCount;
      console.log(`Final count: ${finalCount} items (added ${addedCount})`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`📊 Total added: ${totalAdded} items`);
    console.log('='.repeat(70));
    
    // Show all categories with counts
    console.log('\n📋 All categories:');
    const allCategories = await db.collection('categories').find({
      restaurant_id: restaurant._id,
      deleted_at: null
    }).sort({ name: 1 }).toArray();
    
    for (const cat of allCategories) {
      const count = await db.collection('menu_items').countDocuments({
        category_id: cat._id,
        deleted_at: null
      });
      console.log(`   ${cat.name}: ${count} items`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fillCategories();
