/**
 * Add more PHO items to menu
 * Run: node database/add-more-pho-items.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

const phoItems = [
  {
    name: 'Phở Bò Tái Chín',
    description: 'Phở with both rare and well-done beef',
    price: 70000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-chin.jpg'
  },
  {
    name: 'Phở Bò Nạm Gân',
    description: 'Phở with flank and tendon',
    price: 75000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-nam-gan.jpg'
  },
  {
    name: 'Phở Bò Chín Nạm',
    description: 'Phở with well-done beef and flank',
    price: 70000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-chin-nam.jpg'
  },
  {
    name: 'Phở Bò Tái Gầu',
    description: 'Phở with rare beef and fatty brisket',
    price: 75000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-gau.jpg'
  },
  {
    name: 'Phở Bò Gân Sách',
    description: 'Phở with tendon and tripe',
    price: 75000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-gan-sach.jpg'
  },
  {
    name: 'Phở Bò Tái Nạm Gân',
    description: 'Phở with rare beef, flank, and tendon',
    price: 80000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-nam-gan.jpg'
  },
  {
    name: 'Phở Bò Tái Nạm Sách',
    description: 'Phở with rare beef, flank, and tripe',
    price: 80000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-nam-sach.jpg'
  },
  {
    name: 'Phở Bò Chín Gân Sách',
    description: 'Phở with well-done beef, tendon, and tripe',
    price: 80000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-chin-gan-sach.jpg'
  },
  {
    name: 'Phở Bò Tái Gân Sách',
    description: 'Phở with rare beef, tendon, and tripe',
    price: 80000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-gan-sach.jpg'
  },
  {
    name: 'Phở Bò Tái Nạm Gân Sách',
    description: 'Phở with rare beef, flank, tendon, and tripe',
    price: 85000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-nam-gan-sach.jpg'
  },
  {
    name: 'Phở Bò Viên Tái',
    description: 'Phở with beef meatballs and rare beef',
    price: 70000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-bo-vien-tai.jpg'
  },
  {
    name: 'Phở Bò Viên Chín',
    description: 'Phở with beef meatballs and well-done beef',
    price: 70000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-bo-vien-chin.jpg'
  },
  {
    name: 'Phở Gà Đùi',
    description: 'Chicken phở with chicken thigh',
    price: 65000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-ga-dui.jpg'
  },
  {
    name: 'Phở Gà Lườn',
    description: 'Chicken phở with chicken breast',
    price: 65000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-ga-luon.jpg'
  },
  {
    name: 'Phở Gà Trộn',
    description: 'Chicken phở with mixed chicken parts',
    price: 70000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-ga-tron.jpg'
  }
];

async function addMorePho() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    const restaurant = await db.collection('restaurants').findOne({});
    console.log(`📍 Restaurant: ${restaurant.name}\n`);
    
    // Find Phở category
    const phoCategory = await db.collection('categories').findOne({
      restaurant_id: restaurant._id,
      name: 'Phở',
      deleted_at: null
    });
    
    if (!phoCategory) {
      console.error('❌ Category "Phở" not found!');
      return;
    }
    
    // Check current count
    const currentCount = await db.collection('menu_items').countDocuments({
      category_id: phoCategory._id,
      deleted_at: null
    });
    
    console.log(`📁 Category: Phở (currently ${currentCount} items)\n`);
    console.log('➕ Adding new phở items...\n');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const item of phoItems) {
      // Check if exists
      const existing = await db.collection('menu_items').findOne({
        category_id: phoCategory._id,
        name: item.name,
        deleted_at: null
      });
      
      if (existing) {
        console.log(`⏭️  ${item.name} (already exists)`);
        skippedCount++;
        continue;
      }
      
      // Insert
      await db.collection('menu_items').insertOne({
        _id: new ObjectId(),
        category_id: phoCategory._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        available: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      });
      
      console.log(`✅ ${item.name.padEnd(30)} ${item.price.toLocaleString('vi-VN').padStart(7)}đ`);
      addedCount++;
    }
    
    const finalCount = currentCount + addedCount;
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`Before:  ${currentCount} items`);
    console.log(`Added:   ${addedCount} items`);
    console.log(`Skipped: ${skippedCount} items`);
    console.log(`After:   ${finalCount} items`);
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

addMorePho();
