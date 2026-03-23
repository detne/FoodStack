/**
 * Script to add PHO restaurant menu items
 * Run: node database/add-pho-menu-items.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

const menuItems = [
  // PHO (Main dishes)
  {
    name: 'Phở Bò Tái',
    description: 'Phở with rare beef slices',
    price: 65000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-bo-tai.jpg',
    category: 'Phở'
  },
  {
    name: 'Phở Bò Chín',
    description: 'Phở with well-done beef brisket',
    price: 65000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-bo-chin.jpg',
    category: 'Phở'
  },
  {
    name: 'Phở Bò Tái Nạm',
    description: 'Phở with rare beef and flank',
    price: 70000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-nam.jpg',
    category: 'Phở'
  },
  {
    name: 'Phở Bò Tái Gân',
    description: 'Phở with rare beef and tendon',
    price: 75000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-gan.jpg',
    category: 'Phở'
  },
  {
    name: 'Phở Bò Tái Sách',
    description: 'Phở with rare beef and tripe',
    price: 75000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-tai-sach.jpg',
    category: 'Phở'
  },
  {
    name: 'Phở Bò Đặc Biệt',
    description: 'Special phở with all beef parts (rare beef, brisket, flank, tendon, tripe)',
    price: 85000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-dac-biet.jpg',
    category: 'Phở'
  },
  {
    name: 'Phở Gà',
    description: 'Chicken phở with tender chicken meat',
    price: 60000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-ga.jpg',
    category: 'Phở'
  },
  {
    name: 'Phở Bò Viên',
    description: 'Phở with beef meatballs',
    price: 60000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-bo-vien.jpg',
    category: 'Phở'
  },
  {
    name: 'Phở Không',
    description: 'Plain phở noodle soup without meat',
    price: 40000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-khong.jpg',
    category: 'Phở'
  },
  
  // Side dishes
  {
    name: 'Bò Viên',
    description: 'Beef meatballs (side order)',
    price: 25000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/bo-vien.jpg',
    category: 'Món Thêm'
  },
  {
    name: 'Thêm Thịt Bò',
    description: 'Extra beef slices',
    price: 30000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/them-thit-bo.jpg',
    category: 'Món Thêm'
  },
  {
    name: 'Thêm Bánh Phở',
    description: 'Extra rice noodles',
    price: 15000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/them-banh-pho.jpg',
    category: 'Món Thêm'
  },
  {
    name: 'Chả Quế',
    description: 'Cinnamon pork sausage',
    price: 20000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/cha-que.jpg',
    category: 'Món Thêm'
  },
  {
    name: 'Trứng Gà Lòng Đào',
    description: 'Soft-boiled egg',
    price: 10000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/trung-long-dao.jpg',
    category: 'Món Thêm'
  },
  
  // Appetizers
  {
    name: 'Gỏi Cuốn',
    description: 'Fresh spring rolls (2 rolls)',
    price: 35000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/goi-cuon.jpg',
    category: 'Khai Vị'
  },
  {
    name: 'Chả Giò',
    description: 'Fried spring rolls (3 rolls)',
    price: 40000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/cha-gio.jpg',
    category: 'Khai Vị'
  },
  {
    name: 'Nem Chua Rán',
    description: 'Fried fermented pork rolls',
    price: 35000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/nem-chua-ran.jpg',
    category: 'Khai Vị'
  },
  
  // Beverages
  {
    name: 'Trà Đá',
    description: 'Iced tea',
    price: 5000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/tra-da.jpg',
    category: 'Đồ Uống'
  },
  {
    name: 'Nước Ngọt',
    description: 'Soft drinks (Coca, Pepsi, Sprite, 7Up)',
    price: 15000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/nuoc-ngot.jpg',
    category: 'Đồ Uống'
  },
  {
    name: 'Nước Suối',
    description: 'Bottled water',
    price: 10000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/nuoc-suoi.jpg',
    category: 'Đồ Uống'
  },
  {
    name: 'Cà Phê Sữa Đá',
    description: 'Vietnamese iced coffee with condensed milk',
    price: 25000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/ca-phe-sua-da.jpg',
    category: 'Đồ Uống'
  },
  {
    name: 'Cà Phê Đen Đá',
    description: 'Vietnamese iced black coffee',
    price: 20000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/ca-phe-den-da.jpg',
    category: 'Đồ Uống'
  },
  {
    name: 'Nước Chanh',
    description: 'Fresh lemonade',
    price: 20000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/nuoc-chanh.jpg',
    category: 'Đồ Uống'
  },
  {
    name: 'Sinh Tố Bơ',
    description: 'Avocado smoothie',
    price: 35000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/sinh-to-bo.jpg',
    category: 'Đồ Uống'
  },
  {
    name: 'Nước Dừa',
    description: 'Fresh coconut water',
    price: 30000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/nuoc-dua.jpg',
    category: 'Đồ Uống'
  }
];

async function addPhoMenuItems() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Get first restaurant
    const restaurant = await db.collection('restaurants').findOne({});
    if (!restaurant) {
      console.error('❌ No restaurant found. Please create a restaurant first.');
      return;
    }
    console.log(`📍 Restaurant: ${restaurant.name} (${restaurant._id})`);
    
    // Get existing categories
    const existingCategories = await db.collection('categories').find({
      restaurant_id: restaurant._id
    }).toArray();
    
    console.log(`\n📁 Existing categories: ${existingCategories.map(c => c.name).join(', ')}`);
    
    // Get or create categories for pho restaurant
    const categoryMap = {};
    const phoCategories = ['Phở', 'Món Thêm', 'Khai Vị', 'Đồ Uống'];
    
    for (const categoryName of phoCategories) {
      let category = await db.collection('categories').findOne({
        restaurant_id: restaurant._id,
        name: categoryName
      });
      
      if (!category) {
        const result = await db.collection('categories').insertOne({
          _id: new ObjectId(),
          restaurant_id: restaurant._id,
          name: categoryName,
          description: `${categoryName}`,
          sort_order: phoCategories.indexOf(categoryName),
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        });
        category = { _id: result.insertedId, name: categoryName };
        console.log(`✅ Created category: ${categoryName}`);
      } else {
        console.log(`✓ Found category: ${categoryName}`);
      }
      
      categoryMap[categoryName] = category._id;
    }
    
    // Insert menu items
    let insertedCount = 0;
    let skippedCount = 0;
    
    console.log('\n📝 Adding menu items...\n');
    
    for (const item of menuItems) {
      // Check if item already exists
      const existing = await db.collection('menu_items').findOne({
        name: item.name,
        category_id: categoryMap[item.category]
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${item.name} (already exists)`);
        skippedCount++;
        continue;
      }
      
      await db.collection('menu_items').insertOne({
        _id: new ObjectId(),
        category_id: categoryMap[item.category],
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        available: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      });
      
      console.log(`✅ ${item.category.padEnd(12)} | ${item.name.padEnd(25)} | ${item.price.toLocaleString('vi-VN').padStart(7)}đ`);
      insertedCount++;
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Inserted: ${insertedCount} items`);
    console.log(`⏭️  Skipped:  ${skippedCount} items`);
    console.log(`📁 Categories: ${Object.keys(categoryMap).length}`);
    console.log('='.repeat(70));
    
    // Show category breakdown
    console.log('\n📋 Menu breakdown:');
    for (const [categoryName, categoryId] of Object.entries(categoryMap)) {
      const count = await db.collection('menu_items').countDocuments({
        category_id: categoryId,
        deleted_at: null
      });
      console.log(`   ${categoryName}: ${count} items`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

addPhoMenuItems();
