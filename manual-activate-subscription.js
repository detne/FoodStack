/**
 * Manually activate PRO subscription for testing
 * This simulates what the webhook should do
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function activateSubscription() {
  try {
    console.log('🔄 Connecting to database...\n');
    await prisma.$connect();

    // Find the pending PRO payment
    const allPendingPayments = await prisma.payments.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Filter for PRO payment in JavaScript
    const pendingPayment = allPendingPayments.find(p => 
      p.payos_data && p.payos_data.planName === 'pro'
    );

    if (!pendingPayment) {
      console.log('❌ No pending PRO payment found');
      return;
    }

    console.log(`Found pending payment: ${pendingPayment.id}`);
    console.log(`  Order ID: ${pendingPayment.order_id}`);
    console.log(`  Amount: ${pendingPayment.amount}`);
    console.log(`  Restaurant ID: ${pendingPayment.payos_data.restaurant_id}`);
    console.log('');

    // Get the subscription
    const subscription = await prisma.subscriptions.findUnique({
      where: { id: pendingPayment.order_id }
    });

    if (!subscription) {
      console.log('❌ Subscription not found');
      return;
    }

    console.log(`Found subscription: ${subscription.id}`);
    console.log(`  Current status: ${subscription.status}`);
    console.log(`  Current plan: ${subscription.plan_type}`);
    console.log('');

    // Get PRO plan details
    const proPlan = await prisma.subscription_plans.findFirst({
      where: { name: 'pro' }
    });

    if (!proPlan) {
      console.log('❌ PRO plan not found');
      return;
    }

    console.log('📋 PRO Plan details:');
    console.log(`  Max Branches: ${proPlan.max_branches}`);
    console.log(`  Max Tables: ${proPlan.max_tables}`);
    console.log(`  Max Menu Items: ${proPlan.max_menu_items}`);
    console.log('');

    // Update subscription to ACTIVE with PRO limits
    console.log('🔄 Activating subscription...');
    
    const updated = await prisma.subscriptions.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        plan_type: 'pro',
        max_branches: proPlan.max_branches,
        max_tables: proPlan.max_tables,
        updated_at: new Date()
      }
    });

    console.log('✅ Subscription activated!');
    console.log(`  New status: ${updated.status}`);
    console.log(`  New plan: ${updated.plan_type}`);
    console.log(`  Max branches: ${updated.max_branches}`);
    console.log(`  Max tables: ${updated.max_tables}`);
    console.log('');

    // Update payment status
    console.log('🔄 Updating payment status...');
    
    await prisma.payments.update({
      where: { id: pendingPayment.id },
      data: {
        status: 'SUCCESS',
        updated_at: new Date()
      }
    });

    console.log('✅ Payment marked as SUCCESS');
    console.log('');

    // Get restaurant info
    const restaurant = await prisma.restaurants.findUnique({
      where: { id: subscription.restaurant_id },
      select: { name: true, email: true }
    });

    console.log('🎉 SUCCESS!');
    console.log(`Restaurant "${restaurant?.name}" is now on PRO plan!`);
    console.log('You can now create unlimited branches, tables, and menu items.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

activateSubscription();
