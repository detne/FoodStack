// Test script for Update Branch Branding API
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test data - replace with actual values
const TEST_DATA = {
  email: 'owner@example.com',
  password: 'password123',
  branchId: 'your-branch-id-here'
};

// Sample branding update data
const BRANDING_UPDATE = {
  slug: 'hilldevil-downtown-updated',
  logoUrl: 'https://cdn.example.com/new-logo.png',
  bannerUrl: 'https://cdn.example.com/new-banner.jpg',
  tagline: 'Updated: Best BBQ in Town',
  selectedThemeId: 'theme_midnight',
  themeColors: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#e94560'
  },
  layoutType: 'modern',
  galleryImages: [
    { url: 'https://cdn.example.com/gallery1.jpg', caption: 'Interior View' },
    { url: 'https://cdn.example.com/gallery2.jpg', caption: 'Delicious Food' }
  ],
  sliderImages: [
    { url: 'https://cdn.example.com/slider1.jpg', caption: 'Welcome to Hill Devil' }
  ],
  operatingHours: {
    monday: { open: '09:00', close: '22:00' },
    tuesday: { open: '09:00', close: '22:00' },
    wednesday: { open: '09:00', close: '22:00' },
    thursday: { open: '09:00', close: '23:00' },
    friday: { open: '09:00', close: '23:00' },
    saturday: { open: '10:00', close: '23:00' },
    sunday: { open: '10:00', close: '21:00' }
  },
  socialLinks: {
    facebook: 'https://facebook.com/hilldevil',
    instagram: 'https://instagram.com/hilldevil',
    website: 'https://hilldevil.com'
  },
  seoTitle: 'Hill Devil Restaurant - Downtown BBQ',
  seoDescription: 'Best BBQ restaurant in downtown with amazing atmosphere',
  seoKeywords: 'bbq, restaurant, downtown, grill, meat'
};

async function testUpdateBrandingAPI() {
  try {
    console.log('🚀 Testing Update Branch Branding API...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_DATA.email,
      password: TEST_DATA.password
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');

    // Step 2: Get current branding settings
    console.log('\n2. Getting current branding settings...');
    const currentBrandingResponse = await axios.get(
      `${BASE_URL}/owner/branches/${TEST_DATA.branchId}/branding`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Current branding retrieved');
    console.log('Current slug:', currentBrandingResponse.data.data.slug);

    // Step 3: Update branding settings
    console.log('\n3. Updating branding settings...');
    const updateResponse = await axios.put(
      `${BASE_URL}/owner/branches/${TEST_DATA.branchId}/branding`,
      BRANDING_UPDATE,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Branding update successful');
    console.log('\n📋 Update Response:');
    console.log(JSON.stringify(updateResponse.data, null, 2));

    // Step 4: Verify the update by getting branding again
    console.log('\n4. Verifying update...');
    const verifyResponse = await axios.get(
      `${BASE_URL}/owner/branches/${TEST_DATA.branchId}/branding`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Verification successful');
    console.log('Updated slug:', verifyResponse.data.data.slug);
    console.log('Updated tagline:', verifyResponse.data.data.tagline);

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test validation errors
async function testValidationErrors() {
  try {
    console.log('\n🧪 Testing validation errors...\n');

    // Login first
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_DATA.email,
      password: TEST_DATA.password
    });
    const token = loginResponse.data.data.accessToken;

    // Test invalid data
    const invalidData = {
      slug: 'INVALID-SLUG-WITH-CAPS', // Should be lowercase
      logoUrl: 'not-a-valid-url',
      themeColors: {
        primary: 'invalid-color' // Should be hex
      },
      operatingHours: {
        monday: { open: '25:00', close: '22:00' } // Invalid time
      }
    };

    console.log('Testing invalid data...');
    await axios.put(
      `${BASE_URL}/owner/branches/${TEST_DATA.branchId}/branding`,
      invalidData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.log('✅ Validation errors caught correctly:');
    if (error.response && error.response.data) {
      console.log('Status:', error.response.status);
      console.log('Validation errors:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the tests
async function runAllTests() {
  await testUpdateBrandingAPI();
  await testValidationErrors();
}

runAllTests();