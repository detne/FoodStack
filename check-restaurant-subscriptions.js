/**
 * Check restaurant subscriptions and branch counts
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRestaurantSubscriptions() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();

    console.log('\n📊 Checking all restaurants...\n');

    const restaurants = await prisma.restaurants.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        email: true,
        owner_id: true
      }
    });

    for (const restaurant of restaurants) {
      console.log(`\n🏪 Restaurant: ${restaurant.name} (${restaurant.email})`);
      console.log(`   ID: ${restaurant.id}`);

      // Check active subscription
      const subscription = await prisma.subscriptions.findFirst({
        where: {
          restaurant_id: restaurant.id,
          status: 'ACTIVE'
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      if (subscription) {
        console.log(`   ✅ Active Subscription: ${subscription.plan_type}`);
        console.log(`   Limits: ${subscription.max_branches} branches, ${subscription.max_tables} tables, max_menu_items not in subscriptions table`);
      } else {
        console.log(`   ⚠️  No active subscription (defaults to FREE plan)`);
      }

      // Get plan details from subscription_plans
      const planType = subscription?.plan_type || 'free';
      const plan = await prisma.subscription_plans.findFirst({
        where: { name: planType }
      });

      if (plan) {
        console.log(`   📋 Plan Details from subscription_plans:`);
        console.log(`      - Max Branches: ${plan.max_branches === -1 ? 'Unlimited' : plan.max_branches}`);
        console.log(`      - Max Tables: ${plan.max_tables === -1 ? 'Unlimited' : plan.max_tables}`);
        console.log(`      - Max Menu Items: ${plan.max_menu_items === -1 ? 'Unlimited' : plan.max_menu_items}`);
      }

      // Count actual branches
      const branchCount = await prisma.branches.count({
        where: {
          restaurant_id: restaurant.id,
          deleted_at: null
        }
      });

      console.log(`   🏢 Current Branches: ${branchCount}`);

      // Check if exceeding limits
      if (plan && plan.max_branches !== -1 && branchCount > plan.max_branches) {
        console.log(`   ❌ EXCEEDING LIMIT! Has ${branchCount} branches but limit is ${plan.max_branches}`);
      } else if (plan && plan.max_branches !== -1) {
        console.log(`   ✅ Within limit (${branchCount}/${plan.max_branches})`);
      } else {
        console.log(`   ✅ Unlimited branches`);
      }

      // Count menu items
      const categories = await prisma.categories.findMany({
        where: {
          restaurant_id: restaurant.id,
          deleted_at: null
        },
        select: { id: true }
      });

      const categoryIds = categories.map(c => c.id);

      const menuItemCount = await prisma.menu_items.count({
        where: {
          category_id: { in: categoryIds },
          deleted_at: null
        }
      });

      console.log(`   🍽️  Current Menu Items: ${menuItemCount}`);

      if (plan && plan.max_menu_items !== -1 && menuItemCount > plan.max_menu_items) {
        console.log(`   ❌ EXCEEDING LIMIT! Has ${menuItemCount} items but limit is ${plan.max_menu_items}`);
      } else if (plan && plan.max_menu_items !== -1) {
        console.log(`   ✅ Within limit (${menuItemCount}/${plan.max_menu_items})`);
      } else {
        console.log(`   ✅ Unlimited menu items`);
      }
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkRestaurantSubscriptions();
