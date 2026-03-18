#!/bin/bash

# Update Branch Branding API Test Script using cURL
# Replace the variables below with your actual values

BASE_URL="http://localhost:3000/api/v1"
EMAIL="owner@example.com"
PASSWORD="password123"
BRANCH_ID="your-branch-id-here"

echo "🚀 Testing Update Branch Branding API with cURL..."
echo

# Step 1: Login to get access token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"

# Extract access token (requires jq)
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Login failed. Please check your credentials."
    exit 1
fi

echo "✅ Login successful. Token: ${ACCESS_TOKEN:0:20}..."
echo

# Step 2: Get current branding settings
echo "2. Getting current branding settings..."
CURRENT_BRANDING=$(curl -s -X GET "$BASE_URL/owner/branches/$BRANCH_ID/branding" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

echo "Current branding:"
echo $CURRENT_BRANDING | jq '.'
echo

# Step 3: Update branding settings
echo "3. Updating branding settings..."

# Sample update data
UPDATE_DATA='{
  "slug": "hilldevil-downtown-updated",
  "logoUrl": "https://cdn.example.com/new-logo.png",
  "bannerUrl": "https://cdn.example.com/new-banner.jpg",
  "tagline": "Updated: Best BBQ in Town",
  "selectedThemeId": "theme_midnight",
  "themeColors": {
    "primary": "#1a1a2e",
    "secondary": "#16213e",
    "accent": "#e94560"
  },
  "layoutType": "modern",
  "galleryImages": [
    {"url": "https://cdn.example.com/gallery1.jpg", "caption": "Interior View"},
    {"url": "https://cdn.example.com/gallery2.jpg", "caption": "Delicious Food"}
  ],
  "sliderImages": [
    {"url": "https://cdn.example.com/slider1.jpg", "caption": "Welcome"}
  ],
  "operatingHours": {
    "monday": {"open": "09:00", "close": "22:00"},
    "tuesday": {"open": "09:00", "close": "22:00"},
    "wednesday": {"open": "09:00", "close": "22:00"},
    "thursday": {"open": "09:00", "close": "23:00"},
    "friday": {"open": "09:00", "close": "23:00"},
    "saturday": {"open": "10:00", "close": "23:00"},
    "sunday": {"open": "10:00", "close": "21:00"}
  },
  "socialLinks": {
    "facebook": "https://facebook.com/hilldevil",
    "instagram": "https://instagram.com/hilldevil",
    "website": "https://hilldevil.com"
  },
  "seoTitle": "Hill Devil Restaurant - Downtown BBQ",
  "seoDescription": "Best BBQ restaurant in downtown with amazing atmosphere",
  "seoKeywords": "bbq, restaurant, downtown, grill, meat"
}'

UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/owner/branches/$BRANCH_ID/branding" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_DATA")

echo "Update Response:"
echo $UPDATE_RESPONSE | jq '.'

# Check if update was successful
SUCCESS=$(echo $UPDATE_RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
    echo
    echo "✅ Branding update successful!"
    
    # Step 4: Verify the update
    echo
    echo "4. Verifying update..."
    VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/owner/branches/$BRANCH_ID/branding" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json")
    
    echo "Verified branding:"
    echo $VERIFY_RESPONSE | jq '.data | {slug, tagline, layoutType}'
    
else
    echo
    echo "❌ Branding update failed!"
fi

echo
echo "🧪 Testing validation errors..."

# Test invalid data
INVALID_DATA='{
  "slug": "INVALID-SLUG-WITH-CAPS",
  "logoUrl": "not-a-valid-url",
  "themeColors": {
    "primary": "invalid-color"
  }
}'

VALIDATION_RESPONSE=$(curl -s -X PUT "$BASE_URL/owner/branches/$BRANCH_ID/branding" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$INVALID_DATA")

echo "Validation test response:"
echo $VALIDATION_RESPONSE | jq '.'