/**
 * Check user and restaurant data to debug delete branch issue
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRestaurantData() {
  try {
    console.log('🔄 Connecting to database...\n');
    await prisma.$connect();

    // Get all users
    const users = await prisma.users.findMany({
      where: {
        role: 'OWNER'
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        restaurant_id: true,
        branch_id: true
      }
    });

    console.log(`👥 Found ${users.length} OWNER users:\n`);

    for (const user of users) {
      console.log(`User: ${user.full_name} (${user.email})`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  restaurant_id: ${user.restaurant_id || 'NULL'}`);
      console.log(`  branch_id: ${user.branch_id || 'NULL'}`);

      // Get restaurants owned by this user
      const ownedRestaurants = await prisma.restaurants.findMany({
        where: {
          owner_id: user.id
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      });

      console.log(`  Owned Restaurants: ${ownedRestaurants.length}`);
      ownedRestaurants.forEach(r => {
        console.log(`    - ${r.name} (ID: ${r.id})`);
      });

      // Get branches for owned restaurants
      for (const restaurant of ownedRestaurants) {
        const branches = await prisma.branches.findMany({
          where: {
            restaurant_id: restaurant.id
          },
          select: {
            id: true,
            name: true,
            deleted_at: true
          }
        });

        const activeBranches = branches.filter(b => !b.deleted_at);
        console.log(`    Branches for ${restaurant.name}: ${activeBranches.length} active`);
        activeBranches.forEach(b => {
          console.log(`      - ${b.name} (ID: ${b.id})`);
        });
      }

      console.log('');
    }

    // Check the specific branch that failed
    const failedBranchId = '69c2d1cb90b40ce98ab5e635';
    console.log(`\n🔍 Checking failed branch: ${failedBranchId}\n`);

    const branch = await prisma.branches.findUnique({
      where: { id: failedBranchId },
      select: {
        id: true,
        name: true,
        restaurant_id: true,
        deleted_at: true
      }
    });

    if (branch) {
      console.log(`Branch found: ${branch.name}`);
      console.log(`  restaurant_id: ${branch.restaurant_id}`);
      console.log(`  deleted_at: ${branch.deleted_at || 'NULL'}`);

      // Find owner of this restaurant
      const restaurant = await prisma.restaurants.findUnique({
        where: { id: branch.restaurant_id },
        select: {
          id: true,
          name: true,
          owner_id: true
        }
      });

      if (restaurant) {
        console.log(`\nRestaurant: ${restaurant.name}`);
        console.log(`  owner_id: ${restaurant.owner_id}`);

        const owner = await prisma.users.findUnique({
          where: { id: restaurant.owner_id },
          select: {
            id: true,
            email: true,
            full_name: true,
            restaurant_id: true
          }
        });

        if (owner) {
          console.log(`\nOwner: ${owner.full_name} (${owner.email})`);
          console.log(`  user.id: ${owner.id}`);
          console.log(`  user.restaurant_id: ${owner.restaurant_id || 'NULL'}`);
          console.log(`  restaurant.owner_id: ${restaurant.owner_id}`);
          console.log(`  Match: ${owner.id === restaurant.owner_id ? '✅' : '❌'}`);
          
          // Check if user.restaurant_id matches
          if (owner.restaurant_id) {
            console.log(`  user.restaurant_id matches branch.restaurant_id: ${owner.restaurant_id === branch.restaurant_id ? '✅' : '❌'}`);
          } else {
            console.log(`  ⚠️  user.restaurant_id is NULL - JWT token may not have restaurantId!`);
          }
        }
      }
    } else {
      console.log('Branch not found!');
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRestaurantData();
