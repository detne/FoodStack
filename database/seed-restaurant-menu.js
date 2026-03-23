/**
 * Seed menu data for restaurant
 * This creates categories and menu items at restaurant level
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMenu() {
  try {
    console.log('\n=== Seeding Restaurant Menu ===\n');

    // Get the restaurant
    const restaurant = await prisma.restaurants.findFirst();

    if (!restaurant) {
      console.log('❌ No restaurant found!');
      return;
    }

    console.log(`✅ Found restaurant: ${restaurant.name} (${restaurant.id})`);

    // Get all branches
    const branches = await prisma.branches.findMany({
      where: {
        restaurant_id: restaurant.id
      }
    });

    console.log(`✅ Found ${branches.length} branches\n`);

    // Create categories
    const categories = [
      { name: 'Phở Bò', description: 'Phở bò truyền thống', sort_order: 1 },
      { name: 'Phở Gà', description: 'Phở gà thơm ngon', sort_order: 2 },
      { name: 'Phở Đặc Biệt', description: 'Các loại phở đặc biệt', sort_order: 3 },
      { name: 'Món Ăn Kèm', description: 'Các món ăn kèm', sort_order: 4 },
      { name: 'Đồ Uống', description: 'Nước uống các loại', sort_order: 5 },
    ];

    const createdCategories = [];

    for (const catData of categories) {
      const category = await prisma.categories.create({
        data: {
          restaurant_id: restaurant.id,
          name: catData.name,
          description: catData.description,
          sort_order: catData.sort_order
        }
      });

      createdCategories.push(category);
      console.log(`✅ Created category: ${category.name}`);
    }

    // Create menu items
    const menuItems = [
      // Phở Bò
      {
        category: 'Phở Bò',
        items: [
          { name: 'Phở Bò Gầu', description: 'Thịt gầu bò mềm, thơm đặc trưng', price: 50000 },
          { name: 'Phở Bò Tái Nạm', description: 'Kết hợp thịt tái và nạm, đậm vị', price: 50000 },
        ]
      },
      // Phở Gà
      {
        category: 'Phở Gà',
        items: [
          { name: 'Phở Gà Truyền Thống', description: 'Phở gà nước trong, thịt gà mềm', price: 45000 },
          { name: 'Phở Gà Quay', description: 'Phở gà với thịt gà quay giòn', price: 55000 },
        ]
      },
      // Phở Đặc Biệt
      {
        category: 'Phở Đặc Biệt',
        items: [
          { name: 'Phở Đặc Biệt', description: 'Phở đầy đủ các loại thịt', price: 65000 },
          { name: 'Phở Bò Viên', description: 'Phở với bò viên tươi', price: 48000 },
        ]
      },
      // Món Ăn Kèm
      {
        category: 'Món Ăn Kèm',
        items: [
          { name: 'Gỏi Cuốn', description: 'Gỏi cuốn tươi ngon', price: 25000 },
          { name: 'Chả Giò', description: 'Chả giò giòn rụm', price: 30000 },
        ]
      },
      // Đồ Uống
      {
        category: 'Đồ Uống',
        items: [
          { name: 'Trà Đá', description: 'Trà đá miễn phí', price: 0 },
          { name: 'Nước Ngọt', description: 'Các loại nước ngọt', price: 15000 },
          { name: 'Nước Cam', description: 'Nước cam tươi', price: 25000 },
        ]
      },
    ];

    let totalItems = 0;

    for (const group of menuItems) {
      const category = createdCategories.find(c => c.name === group.category);
      if (!category) continue;

      console.log(`\nAdding items to ${category.name}:`);

      for (const itemData of group.items) {
        const menuItem = await prisma.menu_items.create({
          data: {
            category_id: category.id,
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            available: true
          }
        });

        console.log(`  ✅ ${itemData.name} - ${itemData.price.toLocaleString()}đ`);

        // Create availability for all branches
        for (const branch of branches) {
          await prisma.menu_item_availability.create({
            data: {
              menu_item_id: menuItem.id,
              branch_id: branch.id,
              is_available: true
            }
          });
        }

        totalItems++;
      }
    }

    console.log(`\n=== Seed Complete ===`);
    console.log(`✅ Created ${createdCategories.length} categories`);
    console.log(`✅ Created ${totalItems} menu items`);
    console.log(`✅ Menu available in ${branches.length} branches\n`);

  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMenu()
  .then(() => {
    console.log('✅ Seed successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
