const fetch = require('node-fetch');

async function testAPI() {
  try {
    // Test login first
    console.log('=== Testing Login ===');
    const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'owner@phodenhất.com',
        password: 'owner123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.log('Login failed, trying alternative credentials');
      return;
    }

    const token = loginData.data.accessToken;
    console.log('\n=== Got Token ===');

    // Get categories
    console.log('\n=== Testing Categories API ===');
    const categoriesResponse = await fetch('http://localhost:3000/api/v1/categories', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const categoriesData = await categoriesResponse.json();
    console.log('Categories response:', JSON.stringify(categoriesData, null, 2));

    // Get menu items
    console.log('\n=== Testing Menu Items API ===');
    const menuItemsResponse = await fetch('http://localhost:3000/api/v1/menu-items/search', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const menuItemsData = await menuItemsResponse.json();
    console.log('Menu items response:', JSON.stringify(menuItemsData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
