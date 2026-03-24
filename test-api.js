#!/usr/bin/env node

/**
 * Quick API Test Script
 * Test backend connectivity and endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api/v1';

async function testEndpoint(name, url, method = 'GET', data = null) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`   ${method} ${url}`);
    
    const config = {
      method,
      url,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📄 Response:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   📄 Status: ${error.response.status}`);
      console.log(`   📄 Response:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   🔌 Connection refused - Backend not running?`);
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 FoodStack API Test Suite');
  console.log('=' .repeat(50));
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Health endpoint
  totalTests++;
  if (await testEndpoint('Health Check', `${BASE_URL}/health`)) {
    passedTests++;
  }
  
  // Test 2: API root
  totalTests++;
  if (await testEndpoint('API Root', `${API_URL}`)) {
    passedTests++;
  }
  
  // Test 3: Login endpoint (should fail with validation error)
  totalTests++;
  if (await testEndpoint('Login (empty)', `${API_URL}/auth/login`, 'POST', {})) {
    passedTests++;
  }
  
  // Test 4: Login with data (should fail with invalid credentials)
  totalTests++;
  if (await testEndpoint('Login (test data)', `${API_URL}/auth/login`, 'POST', {
    email: 'test@example.com',
    password: '123456'
  })) {
    passedTests++;
  }
  
  // Test 5: Register endpoint (should fail with validation error)
  totalTests++;
  if (await testEndpoint('Register (empty)', `${API_URL}/auth/register`, 'POST', {})) {
    passedTests++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
  } else if (passedTests === 0) {
    console.log('\n💥 All tests failed! Backend is not running or not accessible.');
    console.log('\n🔧 Try running: npm run dev:backend');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
  
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure backend is running: npm run dev:backend');
  console.log('   2. Check frontend .env: VITE_API_BASE_URL=http://localhost:3000/api/v1');
  console.log('   3. Try login from frontend');
}

// Run tests
runTests().catch(console.error);