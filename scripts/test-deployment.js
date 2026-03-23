#!/usr/bin/env node

/**
 * Test Deployment Script
 * Test các endpoints sau khi deploy
 */

const axios = require('axios');

const BACKEND_URL = process.argv[2] || 'http://localhost:3000';
const FRONTEND_URL = process.argv[3] || 'http://localhost:5173';

console.log('🧪 Testing deployment...\n');
console.log(`Backend:  ${BACKEND_URL}`);
console.log(`Frontend: ${FRONTEND_URL}\n`);

let passed = 0;
let failed = 0;

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}`);
      passed++;
      return true;
    } else {
      console.error(`❌ ${name} - Expected ${expectedStatus}, got ${response.status}`);
      failed++;
      return false;
    }
  } catch (error) {
    console.error(`❌ ${name} - ${error.message}`);
    failed++;
    return false;
  }
}

async function runTests() {
  console.log('━'.repeat(60));
  console.log('Backend Tests');
  console.log('━'.repeat(60));
  
  await testEndpoint('Health Check', `${BACKEND_URL}/health`);
  await testEndpoint('API Root', `${BACKEND_URL}/api/v1`);
  
  console.log('\n' + '━'.repeat(60));
  console.log('Frontend Tests');
  console.log('━'.repeat(60));
  
  await testEndpoint('Frontend Root', FRONTEND_URL);
  
  console.log('\n' + '━'.repeat(60));
  console.log('Summary');
  console.log('━'.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs.\n');
    process.exit(1);
  }
}

runTests();
