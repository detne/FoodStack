/**
 * Script to add more menu items to restaurant
 * Run: node database/add-more-menu-items.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;

const menuItems = [
  // Vietnamese Dishes
  {
    name: 'Phở Bò',
    description: 'Traditional Vietnamese beef noodle soup with rice noodles, beef slices, and aromatic herbs',
    price: 85000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/pho-bo.jpg',
    category: 'Main Course'
  },
  {
    name: 'Bún Chả Hà Nội',
    description: 'Grilled pork with vermicelli noodles, fresh herbs, and dipping sauce',
    price: 75000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/bun-cha.jpg',
    category: 'Main Course'
  },
  {
    name: 'Cơm Tấm Sườn Bì',
    description: 'Broken rice with grilled pork chop, shredded pork skin, and fried egg',
    price: 65000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/com-tam.jpg',
    category: 'Main Course'
  },
  {
    name: 'Bánh Mì Thịt Nướng',
    description: 'Vietnamese baguette with grilled pork, pate, pickled vegetables, and herbs',
    price: 35000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/banh-mi.jpg',
    category: 'Appetizers'
  },
  {
    name: 'Gỏi Cuốn',
    description: 'Fresh spring rolls with shrimp, pork, vegetables, and peanut sauce',
    price: 45000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/goi-cuon.jpg',
    category: 'Appetizers'
  },
  {
    name: 'Chả Giò',
    description: 'Crispy fried spring rolls with pork, vegetables, and glass noodles',
    price: 50000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/cha-gio.jpg',
    category: 'Appetizers'
  },
  
  // Seafood
  {
    name: 'Cá Lóc Kho Tộ',
    description: 'Caramelized snakehead fish in clay pot with coconut water',
    price: 120000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/ca-kho-to.jpg',
    category: 'Main Course'
  },
  {
    name: 'Tôm Rang Muối',
    description: 'Salt and pepper shrimp with crispy garlic',
    price: 150000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/tom-rang-muoi.jpg',
    category: 'Main Course'
  },
  {
    name: 'Mực Xào Sa Tế',
    description: 'Stir-fried squid with lemongrass and chili',
    price: 95000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/muc-xao-sate.jpg',
    category: 'Main Course'
  },
  
  // Chicken & Meat
  {
    name: 'Gà Nướng Mật Ong',
    description: 'Honey grilled chicken with herbs',
    price: 85000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/ga-nuong.jpg',
    category: 'Main Course'
  },
  {
    name: 'Bò Lúc Lắc',
    description: 'Shaking beef - cubed beef stir-fried with garlic and black pepper',
    price: 110000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/bo-luc-lac.jpg',
    category: 'Main Course'
  },
  {
    name: 'Thịt Kho Tàu',
    description: 'Braised pork belly with eggs in caramel sauce',
    price: 70000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/thit-kho.jpg',
    category: 'Main Course'
  },
  
  // Vegetarian
  {
    name: 'Đậu Hũ Sốt Cà Chua',
    description: 'Tofu in tomato sauce with vegetables',
    price: 55000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/dau-hu.jpg',
    category: 'Main Course'
  },
  {
    name: 'Rau Xào Thập Cẩm',
    description: 'Mixed stir-fried vegetables',
    price: 45000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/rau-xao.jpg',
    category: 'Main Course'
  },
  
  // Soups
  {
    name: 'Canh Chua Cá',
    description: 'Sweet and sour fish soup with pineapple and tomatoes',
    price: 80000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/canh-chua.jpg',
    category: 'Soups'
  },
  {
    name: 'Súp Hải Sản',
    description: 'Seafood soup with shrimp, squid, and fish',
    price: 90000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/sup-hai-san.jpg',
    category: 'Soups'
  },
  
  // Beverages
  {
    name: 'Cà Phê Sữa Đá',
    description: 'Vietnamese iced coffee with condensed milk',
    price: 25000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/ca-phe.jpg',
    category: 'Beverages'
  },
  {
    name: 'Trà Đá',
    description: 'Iced tea',
    price: 10000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/tra-da.jpg',
    category: 'Beverages'
  },
  {
    name: 'Nước Chanh',
    description: 'Fresh lemonade',
    price: 20000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/nuoc-chanh.jpg',
    category: 'Beverages'
  },
  {
    name: 'Sinh Tố Bơ',
    description: 'Avocado smoothie',
    price: 35000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/sinh-to-bo.jpg',
    category: 'Beverages'
  },
  {
    name: 'Nước Dừa',
    description: 'Fresh coconut water',
    price: 30000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/nuoc-dua.jpg',
    category: 'Beverages'
  },
  
  // Desserts
  {
    name: 'Chè Ba Màu',
    description: 'Three-color dessert with beans, jelly, and coconut milk',
    price: 30000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/che-ba-mau.jpg',
    category: 'Desserts'
  },
  {
    name: 'Bánh Flan',
    description: 'Vietnamese caramel custard',
    price: 25000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/banh-flan.jpg',
    category: 'Desserts'
  },
  {
    name: 'Chè Thái',
    description: 'Thai-style sweet dessert soup with fruits and jelly',
    price: 35000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/che-thai.jpg',
    category: 'Desserts'
  },
  
  // Rice & Noodles
  {
    name: 'Cơm Chiên Dương Châu',
    description: 'Yang Chow fried rice with shrimp, pork, and vegetables',
    price: 60000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/com-chien.jpg',
    category: 'Main Course'
  },
  {
    name: 'Mì Xào Giòn',
    description: 'Crispy fried noodles with seafood and vegetables',
    price: 75000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/mi-xao-gion.jpg',
    category: 'Main Course'
  },
  {
    name: 'Hủ Tiếu Nam Vang',
    description: 'Phnom Penh noodle soup with pork, shrimp, and quail eggs',
    price: 70000,
    image_url: 'https://res.cloudinary.com/dbfgkvdu7/image/upload/v1/qr-service-platform/hu-tieu.jpg',
    category: 'Main Course'
  }
];

async function addMenuItems() {
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
    
    // Get or create categories
    const categoryMap = {};
    const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
    
    for (const categoryName of uniqueCategories) {
      let category = await db.collection('categories').findOne({
        restaurant_id: restaurant._id,
        name: categoryName
      });
      
      if (!category) {
        const result = await db.collection('categories').insertOne({
          _id: new ObjectId(),
          restaurant_id: restaurant._id,
          name: categoryName,
          description: `${categoryName} dishes`,
          sort_order: 0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        });
        category = { _id: result.insertedId, name: categoryName };
        console.log(`✅ Created category: ${categoryName}`);
      }
      
      categoryMap[categoryName] = category._id;
    }
    
    // Insert menu items
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const item of menuItems) {
      // Check if item already exists
      const existing = await db.collection('menu_items').findOne({
        name: item.name,
        category_id: categoryMap[item.category]
      });
      
      if (existing) {
        console.log(`⏭️  Skipped (exists): ${item.name}`);
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
      
      console.log(`✅ Added: ${item.name} - ${item.price.toLocaleString('vi-VN')}đ`);
      insertedCount++;
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Inserted: ${insertedCount} items`);
    console.log(`   ⏭️  Skipped: ${skippedCount} items`);
    console.log(`   📁 Categories: ${Object.keys(categoryMap).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

addMenuItems();
