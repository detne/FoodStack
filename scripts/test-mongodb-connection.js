/**
 * Test MongoDB Cloud Connection
 * Kiểm tra kết nối đến MongoDB Atlas
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Cloud connection...');
    console.log('Connection URL:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'));
    
    // Test connection
    await prisma.$connect();
    console.log('✅ MongoDB Cloud connection successful!');
    
    // Test basic operations
    console.log('🔄 Testing basic operations...');
    
    // Try to count documents in any collection (should work even if empty)
    try {
      const userCount = await prisma.users.count();
      console.log(`✅ Users collection accessible (${userCount} records)`);
    } catch (error) {
      console.log('ℹ️  Users collection not yet created (this is normal for new database)');
    }
    
    // Test database info
    const result = await prisma.$runCommandRaw({
      buildInfo: 1
    });
    
    console.log('✅ Database info retrieved successfully');
    console.log(`📊 MongoDB version: ${result.version}`);
    console.log(`🏗️  Database ready for schema push`);
    
  } catch (error) {
    console.error('❌ MongoDB Cloud connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('🔑 Authentication issue - check username/password in connection string');
    } else if (error.message.includes('network')) {
      console.error('🌐 Network issue - check internet connection and cluster status');
    } else if (error.message.includes('timeout')) {
      console.error('⏱️  Connection timeout - check cluster region and network');
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Verify MongoDB Atlas cluster is running');
    console.error('2. Check database user credentials');
    console.error('3. Ensure IP address is whitelisted (or use 0.0.0.0/0 for development)');
    console.error('4. Verify connection string format');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test if called directly
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };