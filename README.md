# FoodStack Mobile - Complete Project

Ứng dụng mobile hoàn chỉnh cho hệ thống quản lý nhà hàng FoodStack với backend API và mobile app React Native.

## 📱 Tính năng chính

### Mobile App (React Native + Expo)
- **Authentication**: Đăng nhập với 5 role khác nhau
- **QR Code Scanning**: Quét mã QR bàn ăn để xem menu
- **Menu Display**: Hiển thị menu theo danh mục với tìm kiếm
- **Role-based Navigation**: UI khác nhau cho từng role
- **Dashboard**: Thống kê real-time cho admin và restaurant staff
- **Order Management**: Quản lý đơn hàng (đang phát triển)

### Backend API (Node.js + Express + Prisma)
- **RESTful API**: Đầy đủ endpoints cho mobile app
- **Authentication**: JWT-based với refresh tokens
- **Database**: PostgreSQL với Prisma ORM
- **Real-time**: Redis integration
- **File Upload**: Cloudinary integration
- **Role-based Access**: 5 levels (Admin, Owner, Manager, Staff, Customer)

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd FoodStack-Mobile-Complete/backend
npm install
cp .env.example .env
# Cấu hình DATABASE_URL trong .env
npm run dev
```

### 2. Database Setup
- Chạy SQL script trong Supabase hoặc PostgreSQL:
```sql
-- File: FoodStack-Mobile-Complete/database/supabase-mobile-test-setup.sql
```

### 3. Mobile App Setup
```bash
cd FoodStack-Mobile-Complete/mobile-app
npm install
# Cập nhật IP backend trong config.js
npm start
```

## 🔐 Test Credentials

| Role | Email | Password | Mô tả |
|------|-------|----------|-------|
| Admin | admin@mobile.test | 123456 | Quản trị hệ thống |
| Owner | owner@mobile.test | 123456 | Chủ nhà hàng |
| Manager | manager@mobile.test | 123456 | Quản lý nhà hàng |
| Staff | staff@mobile.test | 123456 | Nhân viên |
| Customer | customer@mobile.test | 123456 | Khách hàng |

**QR Test Token**: `mobile-test-qr-123`

## 📊 API Endpoints

### Public APIs
- `GET /api/v1/public/tables/{qr_token}` - QR scan
- `GET /api/v1/public/branches/{branch_id}/menu` - Menu

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh-token` - Refresh token

### Restaurant Management
- `GET /api/v1/restaurants/me` - Nhà hàng của user
- `GET /api/v1/restaurants/me/statistics` - Thống kê
- `GET /api/v1/branches` - Danh sách chi nhánh

## 🏗️ Project Structure

```
FoodStack-Mobile-Complete/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controller/     # API Controllers
│   │   ├── routes/         # API Routes
│   │   ├── service/        # Business Logic
│   │   ├── repository/     # Data Access
│   │   └── use-cases/      # Use Cases
│   └── prisma/             # Database Schema
├── mobile-app/             # React Native App
│   ├── src/
│   │   ├── screens/        # App Screens
│   │   ├── components/     # Reusable Components
│   │   ├── contexts/       # React Contexts
│   │   ├── services/       # API Services
│   │   └── navigation/     # Navigation Setup
└── database/               # Database Scripts
    ├── supabase-mobile-test-setup.sql
    └── schema_complete.sql
```

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
DIRECT_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-jwt-secret"
REDIS_URL="redis://localhost:6379"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

### Mobile App (config.js)
```javascript
export const CONFIG = {
  BACKEND_IP: '192.168.1.123', // IP máy chạy backend
  BACKEND_PORT: '3000',
};
```

## 📱 Mobile App Features

### Role-based UI
- **Admin**: AdminDashboard với system-wide statistics
- **Owner/Manager/Staff**: RestaurantDashboard với restaurant statistics  
- **Customer**: Home screen với QR scanner

### Real Data Integration
- ✅ Authentication với backend
- ✅ QR scanning với real table data
- ✅ Menu loading từ database
- ✅ Statistics từ real backend APIs
- ✅ Role-based navigation

## 🧪 Testing

### Backend APIs
```bash
# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mobile.test","password":"123456"}'

# Test QR scan
curl http://localhost:3000/api/v1/public/tables/mobile-test-qr-123

# Test menu
curl http://localhost:3000/api/v1/public/branches/mobile-test-branch/menu
```

### Mobile App
1. Mở Expo Go trên điện thoại
2. Scan QR code từ `npm start`
3. Test login với các role khác nhau
4. Test QR scanner với token `mobile-test-qr-123`

## 📚 Documentation

- [Backend API Status](FoodStack-Mobile-Complete/BACKEND_API_STATUS.md)
- [Final Test Results](FoodStack-Mobile-Complete/FINAL_TEST_RESULTS.md)
- [Quick Start Guide](FoodStack-Mobile-Complete/QUICK_START.md)
- [Testing Guide](FoodStack-Mobile-Complete/TESTING_GUIDE.md)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT Authentication
- Redis Caching
- Cloudinary File Upload

### Mobile
- React Native + Expo SDK 54
- React Navigation 6
- React Query (TanStack Query)
- AsyncStorage
- Expo Camera (QR Scanner)

## 🎯 Status

✅ **Hoàn thành**: Authentication, QR Scanning, Menu Display, Dashboard
🚧 **Đang phát triển**: Order Management, Payment Integration
📋 **Kế hoạch**: Push Notifications, Offline Support

---

**Developed by**: FoodStack Team  
**Version**: 1.0.0  
**Last Updated**: March 2026