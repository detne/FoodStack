const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('\n=== All Categories ===');
    const categories = await prisma.categories.findMany({
      include: {
        restaurants: {
          select: { name: true }
        }
      }
    });

    console.log(`Total categories: ${categories.length}\n`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (Restaurant: ${cat.restaurants.name})`);
      console.log(`  ID: ${cat.id}`);
      console.log(`  Restaurant ID: ${cat.restaurant_id}`);
    });

    console.log('\n=== All Menu Items ===');
    const menuItems = await prisma.menu_items.findMany({
      include: {
        categories: {
          include: {
            restaurants: {
              select: { name: true }
            }
          }
        }
      }
    });

    console.log(`Total menu items: ${menuItems.length}\n`);
    menuItems.forEach(item => {
      console.log(`- ${item.name}`);
      console.log(`  Category: ${item.categories.name}`);
      console.log(`  Restaurant: ${item.categories.restaurants.name}`);
      console.log(`  Available: ${item.available}`);
      console.log(`  Price: $${item.price}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
