const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.users.findMany({
      where: {
        role: 'OWNER'
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        restaurant_id: true
      }
    });

    console.log('\n=== Owner Users ===');
    console.log(JSON.stringify(users, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
