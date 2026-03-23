// test-verify-blacklist.js
// Script để verify token đã bị blacklist sau khi logout từ frontend
require('dotenv').config();
const { redisService } = require('./src/service/redis.service');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function verifyBlacklist() {
  try {
    console.log('🔍 Verify Token Blacklist\n');

    // Connect to Redis
    await redisService.connect();
    console.log('✅ Connected to Redis\n');

    // Get all blacklisted tokens
    const keys = await redisService.getAllBlacklistedTokens();
    console.log(`📊 Total blacklisted tokens: ${keys.length}\n`);

    if (keys.length === 0) {
      console.log('⚠️  No tokens blacklisted yet');
      console.log('   Try logging out from the frontend first\n');
      await redisService.disconnect();
      rl.close();
      return;
    }

    // Show all blacklisted tokens
    console.log('Blacklisted tokens:');
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const token = key.replace('blacklist:', '');
      const ttl = await redisService.client.ttl(key);
      
      console.log(`\n${i + 1}. Token: ${token.substring(0, 50)}...`);
      console.log(`   TTL: ${ttl} seconds (${Math.floor(ttl / 60)} minutes)`);
    }

    console.log('\n');
    rl.question('Enter token number to test (or press Enter to skip): ', async (answer) => {
      if (answer && !isNaN(answer)) {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < keys.length) {
          const token = keys[index].replace('blacklist:', '');
          console.log('\n🧪 Testing token...');
          
          const isBlacklisted = await redisService.isTokenBlacklisted(token);
          console.log(`Is blacklisted: ${isBlacklisted ? '✅ YES' : '❌ NO'}`);
        }
      }

      await redisService.disconnect();
      console.log('\n✅ Done!');
      rl.close();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

verifyBlacklist();
