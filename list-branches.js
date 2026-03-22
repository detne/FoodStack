const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listBranches() {
  try {
    const branches = await prisma.branches.findMany({
      include: {
        restaurants: {
          select: { name: true }
        }
      }
    });

    console.log(`\nFound ${branches.length} branches:\n`);
    branches.forEach(branch => {
      console.log(`ID: ${branch.id}`);
      console.log(`Name: ${branch.name}`);
      console.log(`Restaurant: ${branch.restaurants.name}`);
      console.log(`Status: ${branch.status}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listBranches();
