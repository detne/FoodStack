/**
 * Update Subscription Plan Prices in MongoDB
 * Pro: 4,000 VND
 * VIP: 9,000 VND
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSubscriptionPrices() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();

    console.log('📝 Updating subscription plan prices...');

    // Update Pro plan
    const proResult = await prisma.subscription_plans.updateMany({
      where: { name: 'pro' },
      data: { 
        price: 4000,
        updated_at: new Date()
      }
    });
    console.log(`✅ Updated Pro plan: ${proResult.count} record(s)`);

    // Update VIP plan
    const vipResult = await prisma.subscription_plans.updateMany({
      where: { name: 'vip' },
      data: { 
        price: 9000,
        updated_at: new Date()
      }
    });
    console.log(`✅ Updated VIP plan: ${vipResult.count} record(s)`);

    // Verify the changes
    console.log('\n📊 Current subscription plans:');
    const plans = await prisma.subscription_plans.findMany({
      orderBy: { price: 'asc' }
    });

    plans.forEach(plan => {
      console.log(`  - ${plan.display_name || plan.name}: ${plan.price.toLocaleString('vi-VN')}đ/${plan.billing_period || 'month'}`);
    });

    console.log('\n✅ Subscription prices updated successfully!');

  } catch (error) {
    console.error('❌ Error updating subscription prices:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateSubscriptionPrices();
