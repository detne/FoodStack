/**
 * Test subscription limit service
 */

const { SubscriptionLimitService } = require('./src/service/subscription-limit.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const service = new SubscriptionLimitService(prisma);

async function testLimits() {
  try {
    console.log('🔄 Testing subscription limit service...\n');

    // Get all restaurants
    const restaurants = await prisma.restaurants.findMany({
      select: {
        id: true,
        name: true
      }
    });

    for (const restaurant of restaurants) {
      console.log(`\n🏪 Testing: ${restaurant.name}`);
      console.log(`   ID: ${restaurant.id}`);

      // Test canCreateBranch
      const branchCheck = await service.canCreateBranch(restaurant.id);
      console.log(`\n   📊 Branch Limit Check:`);
      console.log(`      Allowed: ${branchCheck.allowed}`);
      console.log(`      Current: ${branchCheck.current}`);
      console.log(`      Limit: ${branchCheck.limit}`);
      console.log(`      Plan: ${branchCheck.plan}`);
      if (branchCheck.message) {
        console.log(`      Message: ${branchCheck.message}`);
      }

      // Test canCreateMenuItem
      const menuCheck = await service.canCreateMenuItem(restaurant.id);
      console.log(`\n   🍽️  Menu Item Limit Check:`);
      console.log(`      Allowed: ${menuCheck.allowed}`);
      console.log(`      Current: ${menuCheck.current}`);
      console.log(`      Limit: ${menuCheck.limit}`);
      console.log(`      Plan: ${menuCheck.plan}`);
      if (menuCheck.message) {
        console.log(`      Message: ${menuCheck.message}`);
      }

      // Get limits info
      const limitsInfo = await service.getLimitsInfo(restaurant.id);
      console.log(`\n   📋 Limits Summary:`);
      console.log(`      Plan: ${limitsInfo.plan}`);
      console.log(`      Branches: ${limitsInfo.branches.current}/${limitsInfo.branches.limit} ${limitsInfo.branches.unlimited ? '(unlimited)' : ''}`);
      console.log(`      Menu Items: ${limitsInfo.menuItems.current}/${limitsInfo.menuItems.limit} ${limitsInfo.menuItems.unlimited ? '(unlimited)' : ''}`);
      console.log(`      Tables: ${limitsInfo.tables.limit} per branch ${limitsInfo.tables.unlimited ? '(unlimited)' : ''}`);
    }

    console.log('\n\n✅ Test complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLimits();
