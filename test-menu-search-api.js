// Test script to verify menu search API with limit parameter
require('dotenv').config();

async function testMenuSearchAPI() {
  try {
    // You need to replace this with a valid token from your login
    const token = process.argv[2];
    
    if (!token) {
      console.log('Usage: node test-menu-search-api.js <your_access_token>');
      console.log('\nTo get your token:');
      console.log('1. Login to the frontend');
      console.log('2. Open browser console');
      console.log('3. Run: localStorage.getItem("access_token")');
      console.log('4. Copy the token and run this script with it');
      return;
    }

    console.log('Testing menu search API with different limits...\n');

    // Test with default limit (10)
    console.log('1. Testing with default limit (no parameter):');
    let response = await fetch('http://localhost:3000/api/v1/menu-items/search', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    let data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Items returned: ${data.data?.length || 0}`);
    console.log(`   Pagination:`, data.pagination);
    console.log('');

    // Test with limit=1000
    console.log('2. Testing with limit=1000:');
    response = await fetch('http://localhost:3000/api/v1/menu-items/search?limit=1000', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Items returned: ${data.data?.length || 0}`);
    console.log(`   Pagination:`, data.pagination);
    console.log('');

    // Test with limit=50
    console.log('3. Testing with limit=50:');
    response = await fetch('http://localhost:3000/api/v1/menu-items/search?limit=50', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Items returned: ${data.data?.length || 0}`);
    console.log(`   Pagination:`, data.pagination);
    console.log('');

    console.log('Test completed!');
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testMenuSearchAPI();
