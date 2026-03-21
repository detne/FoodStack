# 🔐 Test Credentials for FoodStack API

## Quick Setup
Run this SQL script in your database:
```sql
-- File: database/quick-test-accounts.sql
```

## Test Accounts (Password: `123456` for all)

### 👑 ADMIN Account
- **Email:** `admin@foodstack.com`
- **Password:** `123456`
- **Role:** `ADMIN`
- **Access:** Full system access

### 🏪 RESTAURANT OWNER Account
- **Email:** `owner@restaurant.com`
- **Password:** `123456`
- **Role:** `RESTAURANT_OWNER`
- **Access:** Restaurant management, all branches

### 👨‍💼 MANAGER Account
- **Email:** `manager@restaurant.com`
- **Password:** `123456`
- **Role:** `MANAGER`
- **Access:** Branch operations, orders, menu

### 👥 STAFF Account
- **Email:** `staff@restaurant.com`
- **Password:** `123456`
- **Role:** `STAFF`
- **Access:** Order management, basic operations

### 👤 CUSTOMER Account
- **Email:** `customer@gmail.com`
- **Password:** `123456`
- **Role:** `CUSTOMER`
- **Access:** Place orders, view order history

## Test Data Created
- ✅ 1 Restaurant: "Test Restaurant"
- ✅ 1 Branch: "Main Branch"
- ✅ 1 Area: "Main Hall"
- ✅ 1 Table: "T01" (QR Token: `test-qr-token-123`)
- ✅ 1 Category: "Main Dishes"
- ✅ 2 Menu Items: "Pho Bo", "Com Tam"

## API Testing Steps

### 1. Test Login Endpoints
```bash
# Test Admin Login
POST /api/v1/auth/login
{
  "email": "admin@foodstack.com",
  "password": "123456"
}

# Test Restaurant Owner Login
POST /api/v1/auth/login
{
  "email": "owner@restaurant.com", 
  "password": "123456"
}
```

### 2. Test QR Scanning
```bash
# Test QR Token
GET /api/v1/public/qr/test-qr-token-123
```

### 3. Test Menu API
```bash
# Get restaurant menu
GET /api/v1/branches/branch-001/menu
```

### 4. Mobile App Testing
1. Open FoodStack Mobile app
2. Go to "API Test" screen
3. Test backend connection
4. Go to Login screen
5. Use any of the credentials above
6. Test QR scanning with token: `test-qr-token-123`

## Database Setup Commands

```sql
-- Run in your PostgreSQL database
\i database/quick-test-accounts.sql
```

Or copy and paste the content of `quick-test-accounts.sql` into your database client.

## Notes
- All passwords are hashed with bcrypt (salt rounds: 10)
- Email verification is set to `true` for all accounts
- All accounts are in `ACTIVE` status
- Restaurant has basic structure for testing orders