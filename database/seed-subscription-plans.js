/**
 * Seed Subscription Plans to MongoDB
 * Creates or updates Free, Pro, and VIP plans
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();

    console.log('📝 Seeding subscription plans...');

    const plans = [
      {
        name: 'free',
        description: 'Gói miễn phí cho nhà hàng nhỏ',
        price: 0,
        billing_cycle: 'monthly',
        max_branches: 3,
        max_tables: 10,
        max_menu_items: 50,
        features: {
          upload_photos: true,
          analytics: true,
          branch_landing: false,
          theme_selection: false,
          gallery_images: false,
          image_slider: false
        },
        branding_features: {
          custom_logo: false,
          custom_domain: false,
          remove_branding: false
        },
        is_active: true
      },
      {
        name: 'pro',
        description: 'Gói Pro cho nhà hàng chuyên nghiệp',
        price: 4000,
        billing_cycle: 'monthly',
        max_branches: -1,
        max_tables: -1,
        max_menu_items: -1,
        features: {
          upload_photos: true,
          analytics: true,
          branch_landing: true,
          theme_selection: true,
          gallery_images: true,
          image_slider: false
        },
        branding_features: {
          custom_logo: true,
          custom_domain: false,
          remove_branding: false
        },
        is_active: true
      },
      {
        name: 'vip',
        description: 'Gói VIP với đầy đủ tính năng',
        price: 9000,
        billing_cycle: 'monthly',
        max_branches: -1,
        max_tables: -1,
        max_menu_items: -1,
        features: {
          upload_photos: true,
          analytics: true,
          branch_landing: true,
          theme_selection: true,
          gallery_images: true,
          image_slider: true,
          custom_domain: true,
          api_integration: true
        },
        branding_features: {
          custom_logo: true,
          custom_domain: true,
          remove_branding: true,
          white_label: true
        },
        is_active: true
      }
    ];

    for (const plan of plans) {
      const result = await prisma.subscription_plans.upsert({
        where: { name: plan.name },
        update: {
          ...plan,
          updated_at: new Date()
        },
        create: {
          ...plan,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log(`✅ ${result.name} plan: ${result.price.toLocaleString('vi-VN')}đ/${result.billing_cycle}`);
    }

    console.log('\n📊 All subscription plans:');
    const allPlans = await prisma.subscription_plans.findMany({
      orderBy: { price: 'asc' }
    });

    allPlans.forEach(plan => {
      console.log(`  - ${plan.name}: ${plan.price.toLocaleString('vi-VN')}đ/${plan.billing_cycle}`);
      console.log(`    Max branches: ${plan.max_branches}, Max tables: ${plan.max_tables}, Max menu items: ${plan.max_menu_items}`);
      console.log(`    Features: ${Object.keys(plan.features || {}).length} features`);
    });

    console.log('\n✅ Subscription plans seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedSubscriptionPlans();
