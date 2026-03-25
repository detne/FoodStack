/**
 * Fix restaurant subscriptions
 * - Set all restaurants to FREE plan with ACTIVE status
 * - Ensure limits match the subscription_plans table
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSubscriptions() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();

    // Get the free plan details
    const freePlan = await prisma.subscription_plans.findFirst({
      where: { name: 'free' }
    });

    if (!freePlan) {
      console.error('❌ Free plan not found in subscription_plans table!');
      process.exit(1);
    }

    console.log(`\n📋 Free Plan Details:`);
    console.log(`   Max Branches: ${freePlan.max_branches}`);
    console.log(`   Max Tables: ${freePlan.max_tables}`);
    console.log(`   Max Menu Items: ${freePlan.max_menu_items}`);

    // Get all restaurants (including those with deleted_at = null or undefined)
    const restaurants = await prisma.restaurants.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        deleted_at: true
      }
    });

    console.log(`   Total restaurants in DB: ${restaurants.length}`);
    const activeRestaurants = restaurants.filter(r => !r.deleted_at);
    console.log(`   Active restaurants: ${activeRestaurants.length}`);

    console.log(`\n🏪 Processing ${activeRestaurants.length} active restaurants\n`);

    for (const restaurant of activeRestaurants) {
      console.log(`Processing: ${restaurant.name}`);

      // Check if subscription exists
      const existingSubscription = await prisma.subscriptions.findFirst({
        where: {
          restaurant_id: restaurant.id
        }
      });

      if (existingSubscription) {
        // Update existing subscription
        const updated = await prisma.subscriptions.update({
          where: { id: existingSubscription.id },
          data: {
            plan_type: 'free',
            status: 'ACTIVE',
            max_branches: freePlan.max_branches,
            max_tables: freePlan.max_tables,
            start_date: new Date(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            updated_at: new Date()
          }
        });
        console.log(`   ✅ Updated subscription to FREE (ACTIVE) - max ${updated.max_branches} branches`);
      } else {
        // Create new subscription
        const created = await prisma.subscriptions.create({
          data: {
            restaurant_id: restaurant.id,
            plan_type: 'free',
            status: 'ACTIVE',
            max_branches: freePlan.max_branches,
            max_tables: freePlan.max_tables,
            start_date: new Date(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        console.log(`   ✅ Created FREE subscription (ACTIVE) - max ${created.max_branches} branches`);
      }

      // Count current branches
      const branchCount = await prisma.branches.count({
        where: {
          restaurant_id: restaurant.id,
          deleted_at: null
        }
      });

      console.log(`   📊 Current branches: ${branchCount}`);

      if (branchCount > freePlan.max_branches) {
        console.log(`   ⚠️  WARNING: Restaurant has ${branchCount} branches but FREE plan limit is ${freePlan.max_branches}`);
        console.log(`   💡 Consider upgrading to PRO or VIP plan, or delete extra branches`);
      }

      console.log('');
    }

    console.log('✅ All subscriptions fixed!');
    console.log('\n📝 Summary:');
    console.log('   - All restaurants now have ACTIVE FREE subscriptions');
    console.log(`   - Limits: ${freePlan.max_branches} branches, ${freePlan.max_tables} tables, ${freePlan.max_menu_items} menu items`);
    console.log('   - Restaurants exceeding limits should upgrade or remove excess resources');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubscriptions();
