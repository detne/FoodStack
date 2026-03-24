// Check if branches exist in MongoDB
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkBranches() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('Checking branches collection...');
    const branches = await db.collection('branches').find({}).toArray();
    console.log('Branches found:', branches.length);
    console.log('Branches:', JSON.stringify(branches, null, 2));
    
    // Also check PostgreSQL branches
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('\nChecking PostgreSQL branches...');
    const pgBranches = await prisma.branches.findMany();
    console.log('PostgreSQL branches found:', pgBranches.length);
    console.log('PostgreSQL branches:', JSON.stringify(pgBranches, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkBranches();
