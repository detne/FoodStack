# Hướng dẫn chạy FoodStack Mobile trên Expo Go SDK 54

## Tổng quan
Hướng dẫn này sẽ giúp bạn chạy FoodStack Mobile trên điện thoại thật sử dụng Expo Go app với SDK 54.

## Bước 1: Cài đặt Expo Go

### Android:
- Tải Expo Go từ Google Play Store
- Hoặc tải APK từ: https://expo.dev/tools#client

### iOS:
- Tải Expo Go từ App Store

## Bước 2: Setup Dependencies

### Chạy script setup:

**Windows:**
```cmd
cd FoodStackMobile
setup-sdk54.bat
```

**macOS/Linux:**
```bash
cd FoodStackMobile
chmod +x setup-sdk54.sh
./setup-sdk54.sh
```

**Hoặc manual:**
```bash
cd FoodStackMobile
rm -rf node_modules package-lock.json
npm install
```

## Bước 3: Cấu hình IP Address

### 1. Tìm IP address của máy tính:

**Windows:**
```cmd
ipconfig
```
Tìm "IPv4 Address" của WiFi adapter

**macOS:**
```bash
ifconfig en0 | grep inet
```

**Linux:**
```bash
ip addr show
```

### 2. Cập nhật IP trong code:

Mở file `src/services/api-config.ts` và thay đổi:
```typescript
const PHYSICAL_DEVICE_URL = 'http://YOUR_IP_ADDRESS:3000/api/v1';
```

Ví dụ:
```typescript
const PHYSICAL_DEVICE_URL = 'http://192.168.1.100:3000/api/v1';
```

## Bước 4: Khởi động Backend Server

Trong thư mục root của project:
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## Bước 5: Khởi động Expo Development Server

Trong thư mục FoodStackMobile:
```bash
npm start
```

Hoặc:
```bash
expo start
```

## Bước 6: Kết nối với Expo Go

### 1. Đảm bảo cùng mạng WiFi:
- Máy tính và điện thoại phải cùng mạng WiFi
- Tắt VPN nếu có

### 2. Scan QR code:
- Mở Expo Go app trên điện thoại
- Scan QR code hiển thị trong terminal/browser
- Hoặc nhập URL thủ công

### 3. Alternative methods:
- **Android**: Có thể scan QR bằng camera thường
- **iOS**: Phải dùng Expo Go app để scan

## Bước 7: Test API Connection

1. Mở app trên điện thoại
2. Vào màn hình Login
3. Nhấn button "🔧 Test API Connection" (chỉ hiện trong dev mode)
4. Chạy test để kiểm tra kết nối

## Troubleshooting

### 1. "Network response timed out"
- Kiểm tra IP address trong `api-config.ts`
- Đảm bảo backend server đang chạy
- Kiểm tra firewall không block port 3000

### 2. "Unable to resolve host"
- Kiểm tra máy tính và điện thoại cùng WiFi
- Thử ping IP từ điện thoại (dùng network tools app)
- Restart WiFi router nếu cần

### 3. "Expo Go can't connect to development server"
- Restart Expo development server
- Clear Expo cache: `expo start -c`
- Restart Expo Go app

### 4. "Module not found" errors
- Chạy lại setup script
- Xóa node_modules và cài lại: `rm -rf node_modules && npm install`

### 5. API connection fails
- Kiểm tra backend server logs
- Test API bằng browser: `http://YOUR_IP:3000/api/v1/health`
- Kiểm tra CORS settings trong backend

## Test Accounts

Sau khi app chạy thành công, bạn có thể test với:

**Mock accounts (fallback):**
- `customer@test.com` / `password123`
- `owner@restaurant.com` / `password123`
- `admin@foodstack.com` / `admin123`

**Hoặc tạo tài khoản mới:**
- Vào Register screen
- Chọn "Đối tác nhà hàng"
- Điền thông tin và đăng ký

## Development Tips

### 1. Live Reload:
- Thay đổi code sẽ tự động reload app
- Shake điện thoại để mở developer menu

### 2. Debug:
- Mở developer menu → "Debug Remote JS"
- Sử dụng Chrome DevTools để debug

### 3. Logs:
- Xem logs trong Expo CLI terminal
- Hoặc trong Expo Go app → shake → "Show Performance Monitor"

## Production Build

Khi sẵn sàng build production:

1. Cập nhật production URL trong `api-config.ts`
2. Build APK/IPA:
   ```bash
   expo build:android
   expo build:ios
   ```

## Lưu ý quan trọng

1. **Network Security**: Đảm bảo mạng WiFi an toàn
2. **IP Changes**: IP có thể thay đổi khi restart router
3. **Firewall**: Windows Defender có thể block connections
4. **VPN**: Tắt VPN khi development
5. **Mobile Data**: Không hoạt động với mobile data, chỉ WiFi
6. **SDK Compatibility**: App được cấu hình cho SDK 50 (tương thích SDK 54)

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Expo CLI version: `expo --version`
2. Update Expo CLI: `npm install -g @expo/cli`
3. Clear cache: `expo start -c`
4. Restart everything: server, Expo, Expo Go app