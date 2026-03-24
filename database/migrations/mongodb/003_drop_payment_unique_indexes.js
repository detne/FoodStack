/**
 * Migration: Drop unique indexes on payments collection
 * - payments.order_id (was @unique — now 1 order can have multiple payments)
 * - payments.idempotency_key (was @unique)
 * - payments.transaction_ref (was @unique)
 *
 * Run: node database/migrations/mongodb/003_drop_payment_unique_indexes.js
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

  const indexesToDrop = [
    'payments_order_id_key',
    'payments_idempotency_key_key',
    'payments_transaction_ref_key',
  ];

  const existingIndexes = await col.indexes();
  const existingNames = existingIndexes.map((i) => i.name);

  for (const name of indexesToDrop) {
    if (existingNames.includes(name)) {
      await col.dropIndex(name);
      console.log(`Dropped index: ${name}`);
    } else {
      console.log(`Index not found (skipped): ${name}`);
    }
  }

  await client.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
