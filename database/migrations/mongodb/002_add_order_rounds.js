/**
 * Migration: Add order_rounds collection and update order_items
 * 
 * Changes:
 * 1. orders.status: old values (PENDING/PREPARING/SERVED) → new value ACTIVE
 * 2. order_items: add round_id (ObjectId ref), status (PENDING/PREPARING/SERVED)
 * 3. order_rounds: new collection
 * 
 * Run once against your MongoDB instance.
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function up(db) {
  // 1. Migrate existing orders: any non-terminal status → ACTIVE
  await db.collection('orders').updateMany(
    { status: { $in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] } },
    { $set: { status: 'ACTIVE' } }
  );

  // 2. Add status field to existing order_items (default PENDING)
  await db.collection('order_items').updateMany(
    { status: { $exists: false } },
    { $set: { status: 'PENDING', round_id: null } }
  );

  // 3. For each ACTIVE order, create a Round 1 and link its items
  const activeOrders = await db.collection('orders').find({ status: 'ACTIVE' }).toArray();

  for (const order of activeOrders) {
    const round = {
      order_id: order._id,
      round_number: 1,
      status: 'PENDING',
      notes: null,
      created_at: order.created_at || new Date(),
      updated_at: new Date(),
    };
    const result = await db.collection('order_rounds').insertOne(round);

    // Link all items of this order to round 1
    await db.collection('order_items').updateMany(
      { order_id: order._id },
      { $set: { round_id: result.insertedId } }
    );
  }

  console.log(`Migrated ${activeOrders.length} orders to round-based model`);
}

async function main() {
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db();
  await up(db);
  await client.close();
  console.log('Migration complete');
}

main().catch(console.error);
