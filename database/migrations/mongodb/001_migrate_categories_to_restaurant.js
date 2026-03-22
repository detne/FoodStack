/**
 * Migration: Move categories from branch-level to restaurant-level
 * This ensures all branches of a restaurant share the same menu
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('\n=== Starting Migration: Categories to Restaurant Level ===\n');

    // 1. Get all existing categories
    const existingCategories = await prisma.categories.findMany({
      where: { deleted_at: null },
      include: {
        menu_items: {
          where: { deleted_at: null }
        }
      }
    });

    console.log(`Found ${existingCategories.length} existing categories`);

    if (existingCategories.length === 0) {
      console.log('No categories to migrate. Migration complete.');
      return;
    }

    // 2. Group categories by branch and get restaurant info
    const branchToRestaurant = {};
    const branches = await prisma.branches.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        restaurant_id: true,
        name: true
      }
    });

    branches.forEach(branch => {
      branchToRestaurant[branch.id] = {
        restaurant_id: branch.restaurant_id,
        name: branch.name
      };
    });

    // 3. Group categories by restaurant and category name
    const restaurantCategories = {};
    
    for (const category of existingCategories) {
      const branchInfo = branchToRestaurant[category.branch_id];
      if (!branchInfo) {
        console.log(`⚠️  Warning: Branch ${category.branch_id} not found for category ${category.name}`);
        continue;
      }

      const restaurantId = branchInfo.restaurant_id;
      const categoryKey = `${restaurantId}_${category.name}`;

      if (!restaurantCategories[categoryKey]) {
        restaurantCategories[categoryKey] = {
          restaurant_id: restaurantId,
          name: category.name,
          description: category.description,
          sort_order: category.sort_order,
          oldCategories: [],
          menuItems: []
        };
      }

      restaurantCategories[categoryKey].oldCategories.push(category);
      restaurantCategories[categoryKey].menuItems.push(...category.menu_items);
    }

    console.log(`\nGrouped into ${Object.keys(restaurantCategories).length} unique restaurant categories\n`);

    // 4. Create new restaurant-level categories and migrate menu items
    for (const [key, data] of Object.entries(restaurantCategories)) {
      console.log(`\nProcessing: ${data.name} for restaurant ${data.restaurant_id}`);
      console.log(`  - Merging ${data.oldCategories.length} branch categories`);
      console.log(`  - Total menu items: ${data.menuItems.length}`);

      // Create new restaurant-level category
      const newCategory = await prisma.categories.create({
        data: {
          restaurant_id: data.restaurant_id,
          name: data.name,
          description: data.description,
          sort_order: data.sort_order
        }
      });

      console.log(`  ✅ Created restaurant category: ${newCategory.id}`);

      // Migrate menu items (remove duplicates by name)
      const uniqueItems = new Map();
      data.menuItems.forEach(item => {
        if (!uniqueItems.has(item.name)) {
          uniqueItems.set(item.name, item);
        }
      });

      console.log(`  - Migrating ${uniqueItems.size} unique menu items`);

      for (const [itemName, item] of uniqueItems) {
        const newItem = await prisma.menu_items.create({
          data: {
            category_id: newCategory.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image_url: item.image_url,
            available: item.available
          }
        });

        console.log(`    ✅ Migrated: ${itemName}`);

        // Create availability records for all branches
        const allBranches = await prisma.branches.findMany({
          where: {
            restaurant_id: data.restaurant_id,
            deleted_at: null
          },
          select: { id: true }
        });

        for (const branch of allBranches) {
          await prisma.menu_item_availability.upsert({
            where: {
              menu_item_id_branch_id: {
                menu_item_id: newItem.id,
                branch_id: branch.id
              }
            },
            create: {
              menu_item_id: newItem.id,
              branch_id: branch.id,
              is_available: true
            },
            update: {
              is_available: true
            }
          });
        }

        console.log(`    ✅ Created availability for ${allBranches.length} branches`);
      }

      // Soft delete old categories
      for (const oldCategory of data.oldCategories) {
        await prisma.categories.update({
          where: { id: oldCategory.id },
          data: { deleted_at: new Date() }
        });
      }

      console.log(`  ✅ Archived ${data.oldCategories.length} old branch categories`);
    }

    console.log('\n=== Migration Complete ===\n');

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('✅ Migration successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
