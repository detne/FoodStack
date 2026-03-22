// test-staff-login.js
const axios = require('axios');

async function testStaffLogin() {
  try {
    console.log('Testing staff login...\n');

    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'ngocquyentcv95@gmail.com',
      password: 'staff123'
    });

    console.log('✅ Login successful!');
    console.log('User:', response.data.data.user);
    console.log('Role:', response.data.data.user.role);
    console.log('Token:', response.data.data.accessToken.substring(0, 50) + '...');

  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testStaffLogin();
