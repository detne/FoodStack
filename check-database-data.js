/**
 * Check what data exists in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();

    // Check restaurants
    const restaurantCount = await prisma.restaurants.count();
    console.log(`\n🏪 Restaurants: ${restaurantCount}`);

    if (restaurantCount > 0) {
      const restaurants = await prisma.restaurants.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          deleted_at: true
        }
      });
      console.log('Sample restaurants:');
      restaurants.forEach(r => {
        console.log(`  - ${r.name} (${r.email}) ${r.deleted_at ? '[DELETED]' : ''}`);
      });
    }

    // Check branches
    const branchCount = await prisma.branches.count();
    console.log(`\n🏢 Branches: ${branchCount}`);

    if (branchCount > 0) {
      const branches = await prisma.branches.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          restaurant_id: true,
          deleted_at: true
        }
      });
      console.log('Sample branches:');
      branches.forEach(b => {
        console.log(`  - ${b.name} (Restaurant: ${b.restaurant_id}) ${b.deleted_at ? '[DELETED]' : ''}`);
      });
    }

    // Check subscriptions
    const subscriptionCount = await prisma.subscriptions.count();
    console.log(`\n💳 Subscriptions: ${subscriptionCount}`);

    if (subscriptionCount > 0) {
      const subscriptions = await prisma.subscriptions.findMany({
        take: 5,
        select: {
          id: true,
          restaurant_id: true,
          plan_type: true,
          status: true,
          max_branches: true
        }
      });
      console.log('Sample subscriptions:');
      subscriptions.forEach(s => {
        console.log(`  - Restaurant ${s.restaurant_id}: ${s.plan_type} (${s.status}) - max ${s.max_branches} branches`);
      });
    }

    // Check subscription plans
    const planCount = await prisma.subscription_plans.count();
    console.log(`\n📋 Subscription Plans: ${planCount}`);

    if (planCount > 0) {
      const plans = await prisma.subscription_plans.findMany({
        select: {
          name: true,
          price: true,
          max_branches: true,
          max_tables: true,
          max_menu_items: true
        }
      });
      console.log('All plans:');
      plans.forEach(p => {
        console.log(`  - ${p.name}: ${p.price}đ (${p.max_branches} branches, ${p.max_tables} tables, ${p.max_menu_items} items)`);
      });
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
