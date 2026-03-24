const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db();
  
  console.log('Connected to MongoDB:', process.env.DATABASE_URL.split('@')[1].split('?')[0]);
  
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`${col.name}: ${count} documents`);
    
    if (count > 0 && count < 10) {
      const docs = await db.collection(col.name).find({}).limit(2).toArray();
      console.log(`Sample from ${col.name}:`, JSON.stringify(docs, null, 2));
    }
  }
  
  await client.close();
})();
