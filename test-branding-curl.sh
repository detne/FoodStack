#!/bin/bash

# Branch Branding API Test Script using cURL
# Replace the variables below with your actual values

BASE_URL="http://localhost:3000/api/v1"
EMAIL="owner@example.com"
PASSWORD="password123"
BRANCH_ID="your-branch-id-here"

echo "🚀 Testing Branch Branding API with cURL..."
echo

# Step 1: Login to get access token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"

# Extract access token (requires jq - install with: sudo apt-get install jq)
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Login failed. Please check your credentials."
    exit 1
fi

echo "✅ Login successful. Token: ${ACCESS_TOKEN:0:20}..."
echo

# Step 2: Test the branding endpoint
echo "2. Getting branch branding settings..."
BRANDING_RESPONSE=$(curl -s -X GET "$BASE_URL/owner/branches/$BRANCH_ID/branding" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

echo "Branding Response:"
echo $BRANDING_RESPONSE | jq '.'

# Check if request was successful
SUCCESS=$(echo $BRANDING_RESPONSE | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
    echo
    echo "✅ Branding API test successful!"
else
    echo
    echo "❌ Branding API test failed!"
fi