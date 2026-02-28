/**
 * Test Database Connections
 * Chạy: node test-db-connection.js
 */

require('dotenv').config();
const { initializeDatabases, checkDatabaseHealth, prisma, redis } = require('./src/config/database.config');

async function testConnections() {
  console.log('🔍 Testing database connections...\n');

  try {
    // Initialize all databases
    await initializeDatabases();
    
    // Check health
    const health = await checkDatabaseHealth();
    
    console.log('\n📊 Database Health Status:');
    console.log('  PostgreSQL:', health.postgres ? '✅ Connected' : '❌ Failed');
    console.log('  MongoDB:', health.mongodb ? '✅ Connected' : '❌ Failed');
    console.log('  Redis:', health.redis ? '✅ Connected' : '❌ Failed');
    
    // Test PostgreSQL query
    if (health.postgres) {
      const result = await prisma.$queryRaw`SELECT version()`;
      console.log('\n🐘 PostgreSQL Version:', result[0].version.split(' ')[0]);
    }
    
    // Test Redis
    if (health.redis) {
      await redis.set('test_key', 'Hello Redis!');
      const value = await redis.get('test_key');
      console.log('🔴 Redis Test:', value);
      await redis.del('test_key');
    }
    
    console.log('\n✅ All database connections working!\n');
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check if PostgreSQL is running: pg_isready');
    console.error('  2. Check if MongoDB is running: mongosh --eval "db.version()"');
    console.error('  3. Check if Redis is running: redis-cli ping');
    console.error('  4. Verify .env file has correct credentials');
  } finally {
    // Cleanup
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  }
}

testConnections();
