// Check subscription for specific user
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserSubscription() {
  try {
    const email = 'ngocquyensn204@gmail.com';
    
    console.log(`\n🔍 Checking subscription for: ${email}\n`);
    
    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        restaurant_id: true,
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.full_name);
    console.log('   Role:', user.role);
    console.log('   Restaurant ID:', user.restaurant_id);
    
    if (!user.restaurant_id) {
      console.log('\n❌ User has no restaurant');
      return;
    }
    
    // Find restaurant
    const restaurant = await prisma.restaurants.findUnique({
      where: { id: user.restaurant_id },
      select: {
        id: true,
        name: true,
        email: true,
        subscription_id: true,
      }
    });
    
    console.log('\n✅ Restaurant found:');
    console.log('   ID:', restaurant.id);
    console.log('   Name:', restaurant.name);
    console.log('   Subscription ID:', restaurant.subscription_id);
    
    // Find subscription
    const subscription = await prisma.subscriptions.findUnique({
      where: { restaurant_id: restaurant.id }
    });
    
    if (!subscription) {
      console.log('\n❌ No subscription found for this restaurant');
      return;
    }
    
    console.log('\n✅ Subscription found:');
    console.log('   ID:', subscription.id);
    console.log('   Plan Type:', subscription.plan_type);
    console.log('   Status:', subscription.status);
    console.log('   Max Branches:', subscription.max_branches);
    console.log('   Max Tables:', subscription.max_tables);
    console.log('   Start Date:', subscription.start_date);
    console.log('   End Date:', subscription.end_date);
    console.log('   Created:', subscription.created_at);
    console.log('   Updated:', subscription.updated_at);
    
    // Check if subscription is linked to restaurant
    if (restaurant.subscription_id !== subscription.id) {
      console.log('\n⚠️  WARNING: Restaurant subscription_id does not match subscription id!');
      console.log('   Restaurant subscription_id:', restaurant.subscription_id);
      console.log('   Actual subscription id:', subscription.id);
      console.log('\n🔧 Fixing...');
      
      await prisma.restaurants.update({
        where: { id: restaurant.id },
        data: { subscription_id: subscription.id }
      });
      
      console.log('✅ Fixed! Restaurant subscription_id updated.');
    }
    
    console.log('\n✅ All checks passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserSubscription();
