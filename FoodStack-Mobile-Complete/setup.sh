#!/bin/bash

echo "========================================"
echo "   FoodStack Mobile Complete Setup"
echo "========================================"
echo

echo "[1/4] Setting up Backend..."
cd backend
echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi

echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate Prisma client"
    exit 1
fi

echo
echo "[2/4] Setting up Mobile App..."
cd ../mobile-app
echo "Installing mobile app dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install mobile app dependencies"
    exit 1
fi

echo
echo "[3/4] Database Setup Instructions..."
echo
echo "Please run the following commands in your PostgreSQL database:"
echo
echo "1. Create database:"
echo "   CREATE DATABASE foodstack;"
echo
echo "2. Run migrations:"
echo "   cd backend"
echo "   npx prisma migrate dev"
echo
echo "3. Seed test data:"
echo "   psql -d foodstack -f ../database/quick-test-accounts.sql"
echo

echo "[4/4] Configuration..."
echo
echo "Please configure the following files:"
echo
echo "1. Backend environment:"
echo "   Edit: backend/.env"
echo "   Set your DATABASE_URL and other credentials"
echo
echo "2. Mobile app configuration:"
echo "   Edit: mobile-app/config.js"
echo "   Set BACKEND_IP to your machine's IP address"
echo

echo "========================================"
echo "   Setup Complete!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Configure database connection in backend/.env"
echo "2. Update IP address in mobile-app/config.js"
echo "3. Run database migrations and seed data"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start mobile app: cd mobile-app && npx expo start"
echo
echo "Test credentials (password: 123456):"
echo "- Admin: admin@foodstack.com"
echo "- Owner: owner@restaurant.com"
echo "- Manager: manager@restaurant.com"
echo "- Staff: staff@restaurant.com"
echo "- Customer: customer@gmail.com"
echo