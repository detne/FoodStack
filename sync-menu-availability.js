/**
 * Sync menu item availability for all branches
 * Ensures all menu items are available in all branches
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function syncMenuAvailability() {
  try {
    console.log('🔄 Connecting to database...\n');
    await prisma.$connect();

    // Get all restaurants
    const restaurants = await prisma.restaurants.findMany({
      select: {
        id: true,
        name: true
      }
    });

    console.log(`Found ${restaurants.length} restaurants\n`);

    for (const restaurant of restaurants) {
      console.log(`\n🏪 Processing: ${restaurant.name}`);
      console.log(`   Restaurant ID: ${restaurant.id}`);

      // Get all branches for this restaurant
      const branches = await prisma.branches.findMany({
        where: {
          restaurant_id: restaurant.id
        },
        select: {
          id: true,
          name: true,
          deleted_at: true
        }
      });

      const activeBranches = branches.filter(b => !b.deleted_at);
      console.log(`   Active branches: ${activeBranches.length}`);

      // Get all menu items for this restaurant
      const categories = await prisma.categories.findMany({
        where: {
          restaurant_id: restaurant.id
        },
        select: {
          id: true,
          deleted_at: true
        }
      });

      const activeCategories = categories.filter(c => !c.deleted_at);
      const categoryIds = activeCategories.map(c => c.id);

      const menuItems = await prisma.menu_items.findMany({
        where: {
          category_id: { in: categoryIds }
        },
        select: {
          id: true,
          name: true,
          deleted_at: true
        }
      });

      const activeMenuItems = menuItems.filter(m => !m.deleted_at);
      console.log(`   Active menu items: ${activeMenuItems.length}`);

      if (activeMenuItems.length === 0) {
        console.log('   ⚠️  No menu items to sync');
        continue;
      }

      // For each branch, ensure all menu items have availability records
      let created = 0;
      let existing = 0;

      for (const branch of activeBranches) {
        console.log(`\n   📍 Branch: ${branch.name}`);

        for (const menuItem of activeMenuItems) {
          // Check if availability record exists
          const existingAvailability = await prisma.menu_item_availability.findUnique({
            where: {
              menu_item_id_branch_id: {
                menu_item_id: menuItem.id,
                branch_id: branch.id
              }
            }
          });

          if (!existingAvailability) {
            // Create availability record
            try {
              await prisma.menu_item_availability.create({
                data: {
                  menu_item_id: menuItem.id,
                  branch_id: branch.id,
                  is_available: true,
                  updated_at: new Date()
                }
              });
              created++;
            } catch (error) {
              // Skip if already exists (race condition)
              if (error.code === 'P2002') {
                existing++;
              } else {
                console.error(`      ❌ Error creating availability for ${menuItem.name}:`, error.message);
              }
            }
          } else {
            existing++;
          }
        }

        console.log(`      ✅ Created: ${created}, Already exists: ${existing}`);
        created = 0;
        existing = 0;
      }
    }

    console.log('\n\n✅ Sync complete!');
    console.log('All menu items are now available in all branches.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncMenuAvailability();
