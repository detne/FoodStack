const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearMenu() {
  try {
    console.log('\n=== Clearing Menu Data ===\n');

    // Delete menu item availability
    const deletedAvailability = await prisma.menu_item_availability.deleteMany({});
    console.log(`✅ Deleted ${deletedAvailability.count} availability records`);

    // Delete menu items
    const deletedItems = await prisma.menu_items.deleteMany({});
    console.log(`✅ Deleted ${deletedItems.count} menu items`);

    // Delete categories
    const deletedCategories = await prisma.categories.deleteMany({});
    console.log(`✅ Deleted ${deletedCategories.count} categories`);

    console.log('\n✅ Menu data cleared\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearMenu();
