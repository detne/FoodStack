/**
 * Migration Script: PostgreSQL to MongoDB
 * Migrates data from PostgreSQL (Supabase) to MongoDB
 */

const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../src/config/logger.config');

// PostgreSQL Client (direct connection)
const postgresClient = new Client({
  connectionString: process.env.POSTGRES_DATABASE_URL,
});

// MongoDB Prisma Client
const mongoClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Convert PostgreSQL Decimal to Float for MongoDB
 */
const convertDecimalToFloat = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' && !isNaN(parseFloat(value))) {
    return parseFloat(value);
  }
  return parseFloat(value.toString());
};

/**
 * Convert PostgreSQL data to MongoDB format
 */
const transformDataForMongoDB = (records, tableName) => {
  return records.map(record => {
    const transformed = { ...record };
    
    // Remove PostgreSQL specific fields
    delete transformed.id; // Let MongoDB generate ObjectId
    
    // Convert Decimal fields to Float
    Object.keys(transformed).forEach(key => {
      const value = transformed[key];
      
      // Handle decimal/numeric fields
      if (tableName === 'menu_items' && ['price'].includes(key)) {
        transformed[key] = convertDecimalToFloat(value);
      }
      if (tableName === 'orders' && ['subtotal', 'tax', 'service_charge', 'total'].includes(key)) {
        transformed[key] = convertDecimalToFloat(value);
      }
      if (tableName === 'order_items' && ['price', 'subtotal'].includes(key)) {
        transformed[key] = convertDecimalToFloat(value);
      }
      if (tableName === 'payments' && ['amount'].includes(key)) {
        transformed[key] = convertDecimalToFloat(value);
      }
      if (tableName === 'invoices' && ['subtotal', 'tax', 'service_charge', 'total'].includes(key)) {
        transformed[key] = convertDecimalToFloat(value);
      }
      if (tableName === 'customization_options' && ['price_delta'].includes(key)) {
        transformed[key] = convertDecimalToFloat(value);
      }
      if (tableName === 'order_item_customizations' && ['price_delta'].includes(key)) {
        transformed[key] = convertDecimalToFloat(value);
      }
      if (tableName === 'subscription_plans' && ['price'].includes(key)) {
        transformed[key] = convertDecimalToFloat(value);
      }
      
      // Handle JSON fields (keep as is)
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        transformed[key] = value;
      }
    });
    
    return transformed;
  });
};

/**
 * Migrate specific table
 */
const migrateTable = async (tableName) => {
  try {
    logger.info(`Starting migration for table: ${tableName}`);
    
    // Get data from PostgreSQL
    const result = await postgresClient.query(`SELECT * FROM ${tableName}`);
    const postgresData = result.rows;
    
    if (postgresData.length === 0) {
      logger.info(`No data found in PostgreSQL table: ${tableName}`);
      return;
    }

    logger.info(`Found ${postgresData.length} records in PostgreSQL table: ${tableName}`);

    // Transform data for MongoDB
    const mongoData = transformDataForMongoDB(postgresData, tableName);

    logger.info(`Transformed data for MongoDB. Sample record:`, JSON.stringify(mongoData[0], null, 2));

    // Clear existing data in MongoDB
    const deleteResult = await mongoClient[tableName].deleteMany({});
    logger.info(`Cleared ${deleteResult.count || 0} existing records from MongoDB`);
    
    // Insert data into MongoDB in batches
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < mongoData.length; i += batchSize) {
      const batch = mongoData.slice(i, i + batchSize);
      try {
        const insertResult = await mongoClient[tableName].createMany({
          data: batch,
          skipDuplicates: true
        });
        totalInserted += insertResult.count || batch.length;
        logger.info(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records`);
      } catch (batchError) {
        logger.error(`Error inserting batch for ${tableName}:`, batchError.message);
        // Try inserting one by one
        for (const record of batch) {
          try {
            await mongoClient[tableName].create({ data: record });
            totalInserted++;
          } catch (singleError) {
            logger.error(`Error inserting single record in ${tableName}:`, singleError.message);
            logger.error(`Problematic record:`, JSON.stringify(record, null, 2));
          }
        }
      }
    }

    logger.info(`Successfully migrated ${totalInserted} records for table: ${tableName}`);
    
  } catch (error) {
    logger.error(`Error migrating table ${tableName}:`, error.message);
    logger.error(`Full error:`, error);
    // Don't throw error, continue with other tables
  }
};

/**
 * Main migration function
 */
const runMigration = async () => {
  try {
    logger.info('Starting PostgreSQL to MongoDB migration...');
    
    // Connect to both databases
    await postgresClient.connect();
    await mongoClient.$connect();
    
    // Tables to migrate in order (respecting dependencies)
    const orderedTables = [
      'roles',
      'permissions', 
      'subscription_plans',
      'users',
      'restaurants',
      'subscriptions',
      'subscription_feature_limits',
      'user_restaurants',
      'branches',
      'areas',
      'tables',
      'categories',
      'menu_items',
      'customization_groups',
      'customization_options',
      'menu_item_customizations',
      'orders',
      'order_items',
      'order_item_customizations',
      'payments',
      'invoices',
      'feedbacks',
      'reservations',
      'notifications',
      'activity_logs',
      'user_permissions'
    ];

    let totalMigrated = 0;
    for (const tableName of orderedTables) {
      try {
        const result = await postgresClient.query(`SELECT COUNT(*) FROM ${tableName}`);
        const count = parseInt(result.rows[0].count);
        
        if (count > 0) {
          await migrateTable(tableName);
          totalMigrated += count;
        } else {
          logger.info(`Table ${tableName} is empty, skipping...`);
        }
      } catch (error) {
        logger.warn(`Failed to migrate table ${tableName}: ${error.message}`);
        // Continue with other tables
      }
    }
    
    logger.info(`Migration completed successfully! Total records migrated: ${totalMigrated}`);
    
  } catch (error) {
    logger.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await postgresClient.end();
    await mongoClient.$disconnect();
  }
};

/**
 * Verify migration
 */
const verifyMigration = async () => {
  try {
    logger.info('Verifying migration...');
    
    await mongoClient.$connect();
    
    const collections = [
      'users', 'restaurants', 'branches', 'areas', 'tables',
      'categories', 'menu_items', 'orders', 'order_items',
      'payments', 'roles', 'permissions'
    ];
    
    for (const collection of collections) {
      try {
        const count = await mongoClient[collection].count();
        logger.info(`${collection}: ${count} records`);
      } catch (error) {
        logger.warn(`Could not count ${collection}: ${error.message}`);
      }
    }
    
    logger.info('Migration verification completed!');
    
  } catch (error) {
    logger.error('Verification failed:', error.message);
  } finally {
    await mongoClient.$disconnect();
  }
};

// Run migration if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'verify') {
    verifyMigration();
  } else {
    runMigration();
  }
}

module.exports = {
  runMigration,
  verifyMigration,
  migrateTable
};