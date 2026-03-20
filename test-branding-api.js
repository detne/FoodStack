// Test script for Branch Branding API
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test data - replace with actual values
const TEST_DATA = {
  email: 'owner@example.com',
  password: 'password123',
  branchId: 'your-branch-id-here'
};

async function testBrandingAPI() {
  try {
    console.log('🚀 Testing Branch Branding API...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_DATA.email,
      password: TEST_DATA.password
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');

    // Step 2: Test the branding endpoint
    console.log('\n2. Getting branch branding settings...');
    const brandingResponse = await axios.get(
      `${BASE_URL}/owner/branches/${TEST_DATA.branchId}/branding`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Branding API successful');
    console.log('\n📋 Response:');
    console.log(JSON.stringify(brandingResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testBrandingAPI();