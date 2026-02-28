/**
 * Test Database Connections - Simple Version (No Prisma)
 * Chạy: node test-db-simple.js
 */

require('dotenv').config();
const { Client } = require('pg');
const mongoose = require('mongoose');
const Redis = require('ioredis');

async function testPostgreSQL() {
  console.log('\n🐘 Testing PostgreSQL...');
  
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL
    });
    
    await client.connect();
    const result = await client.query('SELECT version()');
    const version = result.rows[0].version.split(' ')[1];
    
    console.log('✅ PostgreSQL Connected');
    console.log('   Version:', version);
    console.log('   Host:', client.host);
    console.log('   Database:', client.database);
    
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL Failed');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testMongoDB() {
  console.log('\n🍃 Testing MongoDB...');
  
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.log('⚠️  MongoDB URI not found in .env');
      return false;
    }
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    
    const version = (await mongoose.connection.db.admin().serverInfo()).version;
    
    console.log('✅ MongoDB Connected');
    console.log('   Version:', version);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log('❌ MongoDB Failed');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testRedis() {
  console.log('\n🔴 Testing Redis...');
  
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: () => null,
      lazyConnect: true
    });
    
    await redis.connect();
    const pong = await redis.ping();
    
    await redis.set('test_key', 'Hello FoodStack!');
    const value = await redis.get('test_key');
    await redis.del('test_key');
    
    const info = await redis.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)[1];
    
    console.log('✅ Redis Connected');
    console.log('   Version:', version);
    console.log('   Host:', redis.options.host);
    console.log('   Port:', redis.options.port);
    console.log('   PING:', pong);
    console.log('   SET/GET:', value);
    
    await redis.quit();
    return true;
  } catch (error) {
    console.log('❌ Redis Failed');
    console.log('   Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   FoodStack Database Connection Test  ║');
  console.log('╚════════════════════════════════════════╝');
  
  const results = {
    postgres: false,
    mongodb: false,
    redis: false
  };
  
  results.postgres = await testPostgreSQL();
  results.mongodb = await testMongoDB();
  results.redis = await testRedis();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  
  const total = Object.values(results).filter(Boolean).length;
  const allConnected = total === 3;
  
  console.log('PostgreSQL:', results.postgres ? '✅' : '❌');
  console.log('MongoDB:   ', results.mongodb ? '✅' : '❌');
  console.log('Redis:     ', results.redis ? '✅' : '❌');
  console.log('='.repeat(50));
  console.log('Total:', total + '/3 databases connected');
  
  if (allConnected) {
    console.log('\n🎉 All databases connected successfully!');
    console.log('✅ Ready to start development!\n');
  } else {
    console.log('\n⚠️  Some databases failed to connect');
    console.log('\n💡 Troubleshooting:');
    
    if (!results.postgres) {
      console.log('\n  PostgreSQL:');
      console.log('  - Check DATABASE_URL in .env');
      console.log('  - Verify Supabase project is active');
    }
    
    if (!results.mongodb) {
      console.log('\n  MongoDB:');
      console.log('  - Check MONGODB_URI in .env');
      console.log('  - Verify MongoDB Atlas cluster is active');
    }
    
    if (!results.redis) {
      console.log('\n  Redis:');
      console.log('  - Check REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in .env');
      console.log('  - Verify Redis Cloud database is active');
    }
    
    console.log('\n');
  }
  
  process.exit(allConnected ? 0 : 1);
}

main().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
