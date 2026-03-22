# Test Logout từ Frontend

## Các bước test:

### 1. Mở trình duyệt và login
- Vào http://localhost:5173/login
- Login với: ngocquyensn204@gmail.com / phone123
- Kiểm tra localStorage có `access_token`

### 2. Mở DevTools Console
```javascript
// Kiểm tra token hiện tại
localStorage.getItem('access_token')
```

### 3. Click nút Logout
- Ở góc trên bên phải, click avatar/menu
- Click "Logout" hoặc "Sign Out"

### 4. Kiểm tra kết quả
- Bạn sẽ được redirect về /login
- localStorage không còn `access_token`
- Token cũ đã bị blacklist trong Redis

### 5. Verify token đã bị blacklist
Mở terminal và chạy:
```bash
node test-verify-blacklist.js
```

## Kết quả mong đợi:
✅ Logout thành công
✅ Redirect về login page
✅ Token bị xóa khỏi localStorage
✅ Token bị blacklist trong Redis
✅ Không thể dùng token cũ để gọi API

## Troubleshooting:

### Nếu logout không hoạt động:
1. Kiểm tra Network tab trong DevTools
2. Xem request POST /api/v1/auth/logout
3. Kiểm tra response status (should be 200)
4. Kiểm tra console có error không

### Nếu vẫn dùng được token cũ:
1. Kiểm tra Redis có đang chạy không
2. Kiểm tra .env có REDIS_ENABLED=true
3. Kiểm tra backend log có "Token blacklisted" message
4. Restart backend server
