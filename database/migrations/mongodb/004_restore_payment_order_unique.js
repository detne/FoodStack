/**
 * Migration: Restore unique index on payments.order_id
 * (1 payment row per order — upsert approach)
 *
 * Run AFTER dropping old data from migration 003:
 *   node database/migrations/mongodb/004_restore_payment_order_unique.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error('DATABASE_URL not set in .env');

  const client = new MongoClient(uri);
  await client.connect();

  const dbName = uri.split('/').pop().split('?')[0];
  const db = client.db(dbName);
  const col = db.collection('payments');

  // Remove duplicate rows first (keep latest per order_id)
  const pipeline = [
    { $sort: { created_at: -1 } },
    { $group: { _id: '$order_id', keepId: { $first: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ];
  const duplicates = await col.aggregate(pipeline).toArray();

  for (const dup of duplicates) {
    // Delete all except the one we want to keep
    await col.deleteMany({ order_id: dup._id, _id: { $ne: dup.keepId } });
    console.log(`Cleaned duplicates for order_id: ${dup._id}`);
  }

  // Re-create unique index
  try {
    await col.createIndex({ order_id: 1 }, { unique: true, name: 'payments_order_id_key' });
    console.log('Created unique index: payments_order_id_key');
  } catch (e) {
    console.log('Index may already exist:', e.message);
  }

  await client.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
