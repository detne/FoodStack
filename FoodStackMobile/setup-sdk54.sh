#!/bin/bash

echo "Setting up FoodStack Mobile with Expo SDK 50 (compatible with SDK 54)..."
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Make sure you're in the FoodStackMobile directory."
    exit 1
fi

# Remove node_modules and lock files
echo "Cleaning up old dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Install dependencies
echo "Installing dependencies for SDK 50 (SDK 54 compatible)..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo
echo "✅ Setup completed successfully!"
echo
echo "Next steps:"
echo "1. Update your computer's IP address in src/services/api-config.ts"
echo "2. Start the backend server: npm run dev (in the root directory)"
echo "3. Start Expo: npm start"
echo "4. Scan QR code with Expo Go app on your phone (SDK 54 compatible)"
echo