/**
 * Check all subscriptions including pending/cancelled
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllSubscriptions() {
  try {
    console.log('🔄 Connecting to database...\n');
    await prisma.$connect();

    // Get ALL subscriptions (not just active)
    const allSubscriptions = await prisma.subscriptions.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`📊 Total subscriptions: ${allSubscriptions.length}\n`);

    for (const sub of allSubscriptions) {
      const restaurant = await prisma.restaurants.findUnique({
        where: { id: sub.restaurant_id },
        select: { name: true, email: true }
      });

      console.log(`Subscription ID: ${sub.id}`);
      console.log(`  Restaurant: ${restaurant?.name || 'Unknown'} (${restaurant?.email || 'N/A'})`);
      console.log(`  Plan: ${sub.plan_type}`);
      console.log(`  Status: ${sub.status}`);
      console.log(`  Max Branches: ${sub.max_branches}`);
      console.log(`  Max Tables: ${sub.max_tables}`);
      console.log(`  Start: ${sub.start_date}`);
      console.log(`  End: ${sub.end_date}`);
      console.log(`  Created: ${sub.created_at}`);
      console.log('');
    }

    // Check payments
    console.log('\n💳 Checking payments...\n');
    
    const payments = await prisma.payments.findMany({
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    });

    console.log(`Total payments: ${payments.length}\n`);

    for (const payment of payments) {
      console.log(`Payment ID: ${payment.id}`);
      console.log(`  Order ID: ${payment.order_id}`);
      console.log(`  Amount: ${payment.amount}`);
      console.log(`  Method: ${payment.method}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Transaction Ref: ${payment.transaction_ref || 'N/A'}`);
      console.log(`  PayOS Data:`, payment.payos_data);
      console.log(`  Created: ${payment.created_at}`);
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

checkAllSubscriptions();
