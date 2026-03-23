#!/usr/bin/env node

/**
 * Pre-deployment Checklist Script
 * Kiểm tra các yêu cầu trước khi deploy
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment requirements...\n');

let hasErrors = false;
let hasWarnings = false;

// 1. Check Node version
console.log('1️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 20) {
  console.error('   ❌ Node.js version must be 20 or higher');
  console.error(`   Current: ${nodeVersion}`);
  hasErrors = true;
} else {
  console.log(`   ✅ Node.js ${nodeVersion}`);
}

// 2. Check package.json
console.log('\n2️⃣  Checking package.json...');
try {
  const pkg = require('../package.json');
  if (!pkg.engines || !pkg.engines.node) {
    console.warn('   ⚠️  No Node.js engine specified in package.json');
    hasWarnings = true;
  } else {
    console.log(`   ✅ Engine: ${pkg.engines.node}`);
  }
} catch (error) {
  console.error('   ❌ Cannot read package.json');
  hasErrors = true;
}

// 3. Check environment variables
console.log('\n3️⃣  Checking environment variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_TOKEN_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'PAYOS_CLIENT_ID',
  'PAYOS_API_KEY',
  'PAYOS_CHECKSUM_KEY'
];

require('dotenv').config();

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`   ❌ Missing: ${varName}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${varName}`);
  }
});

// 4. Check JWT secrets
console.log('\n4️⃣  Checking JWT secrets...');
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('   ❌ JWT_SECRET must be at least 32 characters');
  hasErrors = true;
} else if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_min_32_characters_change_in_production') {
  console.warn('   ⚠️  JWT_SECRET is using default value - CHANGE IN PRODUCTION!');
  hasWarnings = true;
} else {
  console.log('   ✅ JWT_SECRET is secure');
}

// 5. Check database connection
console.log('\n5️⃣  Checking database connection...');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('   ✅ MongoDB connection successful');
    mongoose.disconnect();
    
    // 6. Check Redis connection
    console.log('\n6️⃣  Checking Redis connection...');
    if (process.env.REDIS_ENABLED === 'true') {
      const Redis = require('ioredis');
      const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3
      });
      
      redis.ping()
        .then(() => {
          console.log('   ✅ Redis connection successful');
          redis.disconnect();
          printSummary();
        })
        .catch(err => {
          console.error('   ❌ Redis connection failed:', err.message);
          hasErrors = true;
          printSummary();
        });
    } else {
      console.log('   ⚠️  Redis is disabled');
      hasWarnings = true;
      printSummary();
    }
  })
  .catch(err => {
    console.error('   ❌ MongoDB connection failed:', err.message);
    hasErrors = true;
    printSummary();
  });

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  
  if (hasErrors) {
    console.error('\n❌ Deployment check FAILED');
    console.error('Please fix the errors above before deploying.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('\n⚠️  Deployment check passed with WARNINGS');
    console.warn('Please review the warnings above.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All checks passed! Ready to deploy.\n');
    process.exit(0);
  }
}
