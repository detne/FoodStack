/**
 * Debug script to check menu data
 * Run: node debug-menu.js <branch_id>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugMenu() {
  try {
    const branchId = process.argv[2];
    
    if (!branchId) {
      console.log('Usage: node debug-menu.js <branch_id>');
      process.exit(1);
    }

    console.log('\n=== Checking Branch ===');
    const branch = await prisma.branches.findUnique({
      where: { id: branchId },
      include: {
        restaurants: {
          select: { name: true }
        }
      }
    });

    if (!branch) {
      console.log('❌ Branch not found!');
      process.exit(1);
    }

    console.log(`✅ Branch: ${branch.name} (${branch.restaurants.name})`);

    console.log('\n=== Checking Categories ===');
    const categories = await prisma.categories.findMany({
      where: {
        branch_id: branchId,
        deleted_at: null
      }
    });

    console.log(`Found ${categories.length} categories`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id})`);
    });

    console.log('\n=== Checking Menu Items ===');
    for (const category of categories) {
      const items = await prisma.menu_items.findMany({
        where: {
          category_id: category.id,
          deleted_at: null
        }
      });

      console.log(`\nCategory: ${category.name}`);
      console.log(`  Total items: ${items.length}`);
      
      items.forEach(item => {
        console.log(`  - ${item.name}`);
        console.log(`    Available: ${item.available}`);
        console.log(`    Price: $${item.price}`);
      });

      // Check availability records
      const itemIds = items.map(i => i.id);
      if (itemIds.length > 0) {
        const availability = await prisma.menu_item_availability.findMany({
          where: {
            menu_item_id: { in: itemIds },
            branch_id: branchId
          }
        });

        console.log(`  Availability records: ${availability.length}`);
        availability.forEach(avail => {
          const item = items.find(i => i.id === avail.menu_item_id);
          console.log(`    - ${item?.name}: ${avail.is_available ? '✅' : '❌'} ${avail.reason || ''}`);
        });
      }
    }

    console.log('\n=== Summary ===');
    const totalItems = await prisma.menu_items.count({
      where: {
        categories: {
          branch_id: branchId
        },
        deleted_at: null,
        available: true
      }
    });

    console.log(`Total available items: ${totalItems}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMenu();
