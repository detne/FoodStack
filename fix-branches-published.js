// Fix branches is_published to true
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixBranches() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('Updating all branches to is_published: true...');
    const result = await db.collection('branches').updateMany(
      {},
      { $set: { is_published: true } }
    );
    
    console.log('Updated:', result.modifiedCount, 'branches');
    
    // Verify
    const branches = await db.collection('branches').find({}).toArray();
    console.log('\nBranches after update:');
    branches.forEach(b => {
      console.log(`- ${b.name}: is_published = ${b.is_published}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixBranches();
