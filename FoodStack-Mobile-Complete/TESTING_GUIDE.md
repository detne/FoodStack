# 🧪 Testing Guide - FoodStack Mobile

## 📋 Bước 1: Setup Database (Supabase)

### Option A: Tạo users đơn giản (Khuyến nghị)
1. Mở **Supabase SQL Editor**
2. Copy và chạy file: `database/simple-users-only.sql`
3. Kiểm tra kết quả có 2 users được tạo

### Option B: Setup đầy đủ (Nếu muốn test QR)
1. Mở **Supabase SQL Editor** 
2. Copy và chạy file: `database/supabase-mobile-test-setup.sql`
3. Nếu có lỗi foreign key, chạy từng phần một theo thứ tự

## 📋 Bước 2: Test Backend API

### Kiểm tra Backend đang chạy
```bash
# Trong terminal, chạy:
cd FoodStack-Mobile-Complete/backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:3000`

### Test API Endpoints
```bash
# Test health
curl http://localhost:3000/health

# Test login (sau khi chạy SQL)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mobile.test","password":"123456"}'
```

## 📋 Bước 3: Setup Mobile App

### Cập nhật IP Address
1. Mở file: `FoodStack-Mobile-Complete/mobile-app/config.js`
2. Thay đổi `BACKEND_IP` thành IP của máy bạn:

```javascript
export const CONFIG = {
  BACKEND_IP: '192.168.1.XXX', // Thay bằng IP máy bạn
  BACKEND_PORT: '3000',
};
```

### Tìm IP Address
**Windows:**
```cmd
ipconfig
```
Tìm "IPv4 Address" (thường là 192.168.x.x)

**Mac/Linux:**
```bash
ifconfig
```

### Khởi động Mobile App
```bash
cd FoodStack-Mobile-Complete/mobile-app
npm install
npx expo start
```

## 📋 Bước 4: Test Mobile App

### Test 1: Backend Connection
1. Mở app trên điện thoại (Expo Go)
2. Vào màn hình **"API Test"**
3. Bấm **"Test Backend Connection"**
4. Kết quả mong đợi: ✅ "Backend connection successful!"

### Test 2: Bypass Login
1. Trong màn hình **"API Test"**
2. Thử các nút bypass login:
   - 👑 Login as ADMIN
   - 🏪 Login as OWNER  
   - 👤 Login as CUSTOMER
3. Mỗi lần login sẽ hiển thị thông tin role và credentials thật

### Test 3: Real Login (Nếu đã chạy SQL)
1. Vào màn hình **Login**
2. Thử đăng nhập với:
   - **Email:** `admin@mobile.test`
   - **Password:** `123456`
3. Kết quả mong đợi: Đăng nhập thành công

### Test 4: Navigation
1. Sau khi login (bypass hoặc real)
2. Test các màn hình khác nhau tùy theo role:
   - **Admin:** User management, system settings
   - **Customer:** QR scanner, menu, cart
   - **Owner:** Restaurant dashboard, analytics

## 🔧 Troubleshooting

### Backend không khởi động được
```bash
# Kiểm tra port 3000 có bị chiếm không
netstat -ano | findstr :3000

# Cài lại dependencies
cd FoodStack-Mobile-Complete/backend
rm -rf node_modules
npm install
```

### Mobile app không kết nối được backend
1. ✅ Kiểm tra IP address trong `config.js`
2. ✅ Đảm bảo điện thoại và máy tính cùng WiFi
3. ✅ Test backend URL trong browser: `http://YOUR_IP:3000/health`
4. ✅ Tắt firewall tạm thời để test

### Login thất bại
1. ✅ Kiểm tra đã chạy SQL script chưa
2. ✅ Verify users trong Supabase:
   ```sql
   SELECT email, role FROM users WHERE email LIKE '%@mobile.test';
   ```
3. ✅ Dùng bypass login để test UI trước

### QR Scanner không hoạt động
1. ✅ Chạy full SQL script (Option B)
2. ✅ Test QR token: `mobile-test-qr-123`
3. ✅ Kiểm tra camera permissions

## 📊 Expected Results

### ✅ Thành công khi:
- Backend health check trả về status 200
- Login API trả về access token
- Mobile app kết nối được backend
- Bypass login hoạt động cho tất cả roles
- Navigation giữa các màn hình mượt mà

### ❌ Cần fix khi:
- Backend trả về 500 errors
- Mobile app hiển thị "Network Error"
- Login luôn thất bại
- App crash khi chuyển màn hình

## 🎯 Test Credentials

Sau khi chạy SQL script:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@mobile.test` | `123456` |
| Customer | `customer@mobile.test` | `123456` |

## 📞 Next Steps

Sau khi test thành công:
1. **Customize UI** theo brand của bạn
2. **Add real data** thay vì test data
3. **Deploy backend** lên cloud service
4. **Build mobile app** cho production
5. **Setup real payment** integration

---

**Happy Testing! 🚀**