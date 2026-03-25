/**
 * Check deleted_at field values in branches
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDeletedAt() {
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();

    const branches = await prisma.branches.findMany({
      select: {
        id: true,
        name: true,
        restaurant_id: true,
        deleted_at: true
      }
    });

    console.log(`\n📊 Checking deleted_at values for ${branches.length} branches:\n`);

    branches.forEach(b => {
      const deletedAtValue = b.deleted_at;
      const deletedAtType = typeof deletedAtValue;
      const isNull = deletedAtValue === null;
      const isUndefined = deletedAtValue === undefined;
      
      console.log(`Branch: ${b.name}`);
      console.log(`  deleted_at value: ${deletedAtValue}`);
      console.log(`  type: ${deletedAtType}`);
      console.log(`  === null: ${isNull}`);
      console.log(`  === undefined: ${isUndefined}`);
      console.log(`  !deleted_at: ${!deletedAtValue}`);
      console.log('');
    });

    // Try different query approaches
    console.log('\n🔍 Testing different query approaches:\n');

    const countAll = await prisma.branches.count();
    console.log(`All branches: ${countAll}`);

    const countNullExplicit = await prisma.branches.count({
      where: { deleted_at: null }
    });
    console.log(`deleted_at === null: ${countNullExplicit}`);

    const countNotNull = await prisma.branches.count({
      where: { deleted_at: { not: null } }
    });
    console.log(`deleted_at !== null: ${countNotNull}`);

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDeletedAt();
