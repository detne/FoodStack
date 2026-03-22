/**
 * Copy menu from one branch to another
 * Usage: node copy-menu-to-branch.js <source_branch_id> <target_branch_id>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function copyMenu() {
  try {
    const sourceBranchId = process.argv[2] || '69bd784d249c761282b23c8b'; // Quận 1
    const targetBranchId = process.argv[3] || '69bd79a8e8cde92b1fa60a83'; // Gò Vấp

    console.log(`\nCopying menu from ${sourceBranchId} to ${targetBranchId}...\n`);

    // Check if source branch has categories
    const sourceCategories = await prisma.categories.findMany({
      where: {
        branch_id: sourceBranchId,
        deleted_at: null
      },
      include: {
        menu_items: {
          where: {
            deleted_at: null
          }
        }
      }
    });

    if (sourceCategories.length === 0) {
      console.log('❌ Source branch has no categories!');
      console.log('Let me check all branches with categories...\n');

      const allCategories = await prisma.categories.findMany({
        where: { deleted_at: null },
        include: {
          branches: {
            select: { name: true }
          }
        }
      });

      console.log(`Found ${allCategories.length} categories across all branches:`);
      allCategories.forEach(cat => {
        console.log(`- ${cat.name} (Branch: ${cat.branches.name}, ID: ${cat.branch_id})`);
      });

      if (allCategories.length > 0) {
        console.log('\nPlease run: node copy-menu-to-branch.js <source_branch_id> <target_branch_id>');
      }
      return;
    }

    console.log(`Found ${sourceCategories.length} categories in source branch\n`);

    // Copy categories and menu items
    for (const sourceCategory of sourceCategories) {
      console.log(`Copying category: ${sourceCategory.name}`);

      // Create category in target branch
      const newCategory = await prisma.categories.create({
        data: {
          branch_id: targetBranchId,
          name: sourceCategory.name,
          description: sourceCategory.description,
          sort_order: sourceCategory.sort_order
        }
      });

      console.log(`  ✅ Created category: ${newCategory.name}`);

      // Copy menu items
      for (const sourceItem of sourceCategory.menu_items) {
        const newItem = await prisma.menu_items.create({
          data: {
            category_id: newCategory.id,
            name: sourceItem.name,
            description: sourceItem.description,
            price: sourceItem.price,
            image_url: sourceItem.image_url,
            available: sourceItem.available
          }
        });

        console.log(`    ✅ Created item: ${newItem.name} ($${newItem.price})`);
      }
    }

    console.log('\n✅ Menu copied successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

copyMenu();
