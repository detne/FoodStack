// Test subscription API endpoint
require('dotenv').config();

async function testSubscriptionAPI() {
  try {
    // You need to get a valid token first
    // Login with ngocquyensn204@gmail.com
    
    const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ngocquyensn204@gmail.com',
        password: 'phone123',
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginData.data.accessToken;
    console.log('\n✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // Test getCurrentSubscription
    console.log('\n🔍 Testing /api/v1/subscription/current...\n');
    
    const subResponse = await fetch('http://localhost:3000/api/v1/subscription/current', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const subData = await subResponse.json();
    console.log('Subscription response:', JSON.stringify(subData, null, 2));
    
    if (subData.success && subData.data) {
      console.log('\n✅ Subscription found:');
      console.log('   Plan Type:', subData.data.plan_type);
      console.log('   Status:', subData.data.status);
      console.log('   Max Branches:', subData.data.max_branches);
      console.log('   Max Tables:', subData.data.max_tables);
    } else {
      console.log('\n❌ No subscription data');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSubscriptionAPI();
