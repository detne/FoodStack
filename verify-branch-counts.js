/**
 * Verify actual branch counts per restaurant
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyBranchCounts() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();

    const restaurants = await prisma.restaurants.findMany({
      select: {
        id: true,
        name: true
      }
    });

    console.log(`\n📊 Branch counts per restaurant:\n`);

    for (const restaurant of restaurants) {
      // Count all branches
      const totalBranches = await prisma.branches.count({
        where: {
          restaurant_id: restaurant.id
        }
      });

      // Count non-deleted branches
      const activeBranches = await prisma.branches.count({
        where: {
          restaurant_id: restaurant.id,
          deleted_at: null
        }
      });

      // Count deleted branches
      const deletedBranches = await prisma.branches.count({
        where: {
          restaurant_id: restaurant.id,
          deleted_at: { not: null }
        }
      });

      console.log(`🏪 ${restaurant.name} (${restaurant.id})`);
      console.log(`   Total: ${totalBranches}`);
      console.log(`   Active: ${activeBranches}`);
      console.log(`   Deleted: ${deletedBranches}`);

      // List all branches
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

      console.log(`   Branches:`);
      branches.forEach(b => {
        console.log(`      - ${b.name} ${b.deleted_at ? '[DELETED]' : '[ACTIVE]'}`);
      });

      // Get subscription
      const subscription = await prisma.subscriptions.findFirst({
        where: {
          restaurant_id: restaurant.id,
          status: 'ACTIVE'
        }
      });

      if (subscription) {
        console.log(`   Subscription: ${subscription.plan_type} (max ${subscription.max_branches} branches)`);
        if (activeBranches > subscription.max_branches) {
          console.log(`   ❌ EXCEEDING LIMIT! ${activeBranches} > ${subscription.max_branches}`);
        } else {
          console.log(`   ✅ Within limit`);
        }
      }

      console.log('');
    }

    console.log('✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyBranchCounts();
