/**
 * Check menu availability for a specific branch
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBranchMenu() {
  try {
    console.log('🔄 Connecting to database...\n');
    await prisma.$connect();

    // Get branch "Phở Đệ Nhất - Chi nhánh Gò Vấp"
    const branch = await prisma.branches.findFirst({
      where: {
        name: { contains: 'Gò Vấp' }
      },
      select: {
        id: true,
        name: true,
        restaurant_id: true
      }
    });

    if (!branch) {
      console.log('❌ Branch not found');
      return;
    }

    console.log(`📍 Branch: ${branch.name}`);
    console.log(`   ID: ${branch.id}`);
    console.log(`   Restaurant ID: ${branch.restaurant_id}\n`);

    // Get all categories for this restaurant
    const categories = await prisma.categories.findMany({
      where: {
        restaurant_id: branch.restaurant_id
      },
      select: {
        id: true,
        name: true,
        deleted_at: true
      },
      orderBy: {
        sort_order: 'asc'
      }
    });

    const activeCategories = categories.filter(c => !c.deleted_at);
    console.log(`📋 Categories: ${activeCategories.length}\n`);

    for (const category of activeCategories) {
      // Get menu items in this category
      const menuItems = await prisma.menu_items.findMany({
        where: {
          category_id: category.id
        },
        select: {
          id: true,
          name: true,
          deleted_at: true
        }
      });

      const activeMenuItems = menuItems.filter(m => !m.deleted_at);

      // Get availability for this branch
      const availabilities = await prisma.menu_item_availability.findMany({
        where: {
          branch_id: branch.id,
          menu_item_id: { in: activeMenuItems.map(m => m.id) }
        }
      });

      console.log(`Category: ${category.name}`);
      console.log(`  Total menu items: ${activeMenuItems.length}`);
      console.log(`  Availability records: ${availabilities.length}`);
      console.log(`  Available: ${availabilities.filter(a => a.is_available).length}`);
      console.log(`  Unavailable: ${availabilities.filter(a => !a.is_available).length}`);
      
      if (activeMenuItems.length !== availabilities.length) {
        console.log(`  ⚠️  MISSING ${activeMenuItems.length - availabilities.length} availability records!`);
      }
      console.log('');
    }

    console.log('✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkBranchMenu();
