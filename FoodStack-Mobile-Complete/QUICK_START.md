# 🚀 Quick Start Guide

## 📋 Prerequisites

Before starting, make sure you have:
- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Expo CLI**: `npm install -g @expo/cli`
- **PostgreSQL** database running
- **Git** for version control

## ⚡ 5-Minute Setup

### 1. Run Setup Script

**Windows:**
```cmd
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Configure Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE foodstack;
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/foodstack"
JWT_SECRET="your_secret_key_min_32_characters_change_in_production"
```

**Mobile App** (`mobile-app/config.js`):
```javascript
export const CONFIG = {
  BACKEND_IP: '192.168.1.123', // Your machine's IP
  BACKEND_PORT: '3000',
};
```

### 4. Initialize Database

```bash
cd backend
npx prisma migrate dev
psql -d foodstack -f ../database/quick-test-accounts.sql
```

### 5. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Mobile App:**
```bash
cd mobile-app
npx expo start
```

## 📱 Test the App

1. **Scan QR code** with Expo Go app on your phone
2. **Open API Test screen** in the mobile app
3. **Test backend connection** - should show ✅ success
4. **Try bypass login** with different roles:
   - Admin, Owner, Manager, Staff, Customer
5. **Navigate through the app** to test features

## 🔐 Test Credentials

All accounts use password: `123456`

- **👑 Admin:** `admin@foodstack.com`
- **🏪 Owner:** `owner@restaurant.com`
- **👨‍💼 Manager:** `manager@restaurant.com`
- **👥 Staff:** `staff@restaurant.com`
- **👤 Customer:** `customer@gmail.com`

## 🧪 Testing Features

### Customer Flow
1. Use bypass login → Customer role
2. Navigate to QR Scanner
3. Use test token: `test-qr-token-123`
4. Browse menu and add items to cart
5. Test checkout process

### Staff Flow
1. Use bypass login → Staff role
2. Navigate to Orders screen
3. View and manage orders
4. Test order status updates

### Manager Flow
1. Use bypass login → Manager role
2. Access menu management
3. Test adding/editing menu items
4. View branch analytics

## 🔧 Find Your IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for inet address (usually 192.168.x.x or 10.x.x.x).

**Important:** Make sure your mobile device and computer are on the same WiFi network!

## 🐛 Common Issues

### Backend won't start
- ✅ Check PostgreSQL is running
- ✅ Verify DATABASE_URL in .env
- ✅ Run `npm install` in backend folder

### Mobile app can't connect
- ✅ Update BACKEND_IP in config.js
- ✅ Check both devices on same WiFi
- ✅ Test backend URL in browser: `http://YOUR_IP:3000/health`

### Authentication fails
- ✅ Use test credentials above
- ✅ Try bypass login in API Test screen
- ✅ Check database has test users: `SELECT email FROM users;`

### QR scanning doesn't work
- ✅ Use test token: `test-qr-token-123`
- ✅ Test QR endpoint: `http://YOUR_IP:3000/api/v1/public/qr/test-qr-token-123`

## 📚 Next Steps

Once everything is working:

1. **Explore the codebase** - Check out the clean architecture
2. **Add new features** - Follow the development patterns
3. **Customize for your needs** - Modify branding, features, etc.
4. **Deploy to production** - Use the deployment guides

## 🆘 Need Help?

- 📖 Check the main README.md
- 🔍 Look at backend/README.md for API details
- 📱 Check mobile-app/SETUP_GUIDE.md for mobile specifics
- 🗄️ See database/TEST_CREDENTIALS.md for test data

---

**Happy coding! 🎉**