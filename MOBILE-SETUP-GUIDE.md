# 📱 FoodStack Mobile App - Hướng dẫn chạy

## 🎯 Tổng quan App

FoodStack Mobile là ứng dụng gọi món hoàn chỉnh với các tính năng:

### 🏠 Màn hình chính (Home)
- Tổng quan các tính năng
- Hướng dẫn sử dụng
- Truy cập nhanh các chức năng

### 📱 Các tính năng chính
1. **Quét QR Code** - Quét mã QR trên bàn để gọi món
2. **Danh sách nhà hàng** - Duyệt các nhà hàng có sẵn
3. **Xem menu** - Duyệt menu và thêm món vào giỏ hàng
4. **Lịch sử đơn hàng** - Xem các đơn hàng đã đặt
5. **Hồ sơ cá nhân** - Thông tin và cài đặt

---

## 🚀 Cách 1: Chạy trên Expo Go (Dễ nhất)

### Bước 1: Cài đặt Expo Go
- **Android**: Tải [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) từ Google Play Store
- **iOS**: Tải [Expo Go](https://apps.apple.com/app/expo-go/id982107779) từ App Store

### Bước 2: Khởi động development server
```bash
cd FoodStackMobile
npm start
```

### Bước 3: Kết nối với app
1. **Android**: Mở Expo Go → Scan QR code từ terminal
2. **iOS**: Mở Camera → Scan QR code từ terminal
3. App sẽ tự động tải và chạy

### Bước 4: Test app flow
1. **Màn hình chính**: Xem các tính năng có sẵn
2. **Demo menu**: Nhấn "Xem menu demo" để test không cần QR
3. **QR Scanner**: Nhấn "Quét mã QR" để test quét mã
4. **Nhà hàng**: Xem danh sách nhà hàng demo

---

## 🔧 Cách 2: Chạy trên Android Studio

### Bước 1: Cài đặt Android Studio
1. Tải [Android Studio](https://developer.android.com/studio)
2. Cài đặt Android SDK và emulator

### Bước 2: Tạo Android Virtual Device (AVD)
1. Mở Android Studio
2. Tools → AVD Manager
3. Create Virtual Device
4. Chọn device (ví dụ: Pixel 7)
5. Chọn system image (API 34 trở lên)
6. Finish và Start emulator

### Bước 3: Chạy app trên emulator
```bash
cd FoodStackMobile
npm run android
```

### Bước 4: Debug và test
- App sẽ tự động cài đặt trên emulator
- Sử dụng emulator camera để test QR scanning

---

## 🍎 Cách 3: Chạy trên iOS Simulator (chỉ macOS)

### Bước 1: Cài đặt Xcode
1. Tải Xcode từ Mac App Store
2. Cài đặt iOS Simulator

### Bước 2: Chạy app
```bash
cd FoodStackMobile
npm run ios
```

---

## 🌐 Cách 4: Chạy trên Web Browser

### Chạy web version
```bash
cd FoodStackMobile
npm run web
```

**Lưu ý**: Camera không hoạt động trên web, chỉ dùng để test UI.

---

## 🔧 Cấu hình API

### Cập nhật API URL trong `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api/v1'  // Android emulator
  : 'https://your-production-api.com/api/v1';
```

### Cho iOS simulator:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'  // iOS simulator
  : 'https://your-production-api.com/api/v1';
```

### Cho physical device:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:3000/api/v1'  // Replace with your IP
  : 'https://your-production-api.com/api/v1';
```

---

## 🧪 Test Flow hoàn chỉnh

### 1. Test không cần QR (Demo Mode)
1. Mở app → Màn hình chính
2. Nhấn "Xem menu demo" hoặc "Nhà hàng" → "FoodStack Demo"
3. Duyệt menu → Thêm món vào giỏ hàng
4. Xem giỏ hàng → Đặt hàng (demo)
5. Theo dõi trạng thái đơn hàng

### 2. Test với QR Code
1. Tạo QR code test (xem bên dưới)
2. Nhấn "Quét mã QR" từ màn hình chính
3. Quét QR code → Tự động vào menu
4. Thực hiện flow đặt hàng như bình thường

### 3. Test các tính năng khác
- **Lịch sử đơn hàng**: Xem đơn hàng demo
- **Hồ sơ**: Xem thông tin và cài đặt
- **Nhà hàng**: Duyệt danh sách nhà hàng

---

## 🧪 Tạo QR Code test

### Sử dụng QR Code Generator online:
1. Vào [QR Code Generator](https://www.qr-code-generator.com/)
2. Nhập text: `test-table-token-123`
3. Generate và scan để test

### Hoặc sử dụng QR code này:
```
┌─────────────────────────────────────┐
│ ████ ▄▄▄▄▄ █▀█ █▄█ ▄▄▄▄▄ ████      │
│ ████ █   █ █▀▀ ▀ █ █   █ ████      │
│ ████ █▄▄▄█ ▀▄█▀▄▀█ █▄▄▄█ ████      │
│ ████▄▄▄▄▄▄▄█▄▀ ▀▄█▄▄▄▄▄▄▄████      │
│ ████▄▄  ▄▀▄▄▄█▄▄▄▄▄▀▄▄█▄▄████      │
│ █████▀▄▄▀▄▄▀██▀▀▀▄▄▄▄▀█▀▄████      │
│ ████▄▄▄▄▄▄▄█▄██▄█▄▄▄▄▄▄▄▄████      │
│ ████ ▄▄▄▄▄ █▄▄▄ ▄ ▄ ▄▄▄▄▄████      │
│ ████ █   █ ██▀▄▄▀▄▄▄█   █████      │
│ ████ █▄▄▄█ █▀▀▄▄▄▄▄▄█▄▄▄█████      │
│ ████▄▄▄▄▄▄▄█▄▄▄█▄█▄▄▄▄▄▄▄▄████      │
└─────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Lỗi thường gặp:

#### 1. "Metro bundler failed to start"
```bash
cd FoodStackMobile
npx expo r -c  # Clear cache
npm start
```

#### 2. "Camera permission denied"
- Android: Settings → Apps → Expo Go → Permissions → Camera
- iOS: Settings → Privacy → Camera → Expo Go

#### 3. "Network request failed"
- Kiểm tra backend server đang chạy (port 3000)
- Cập nhật đúng IP address trong API config
- Tắt firewall hoặc antivirus tạm thời

#### 4. "QR Scanner not working"
- Đảm bảo camera permission được cấp
- Test với QR code rõ nét
- Kiểm tra ánh sáng đủ

#### 5. "App crashes on startup"
```bash
cd FoodStackMobile
rm -rf node_modules
npm install
npm start
```

---

## 📱 App Structure & Flow

### 🏠 Home Screen
- **Quét mã QR**: Vào QR Scanner
- **Nhà hàng**: Xem danh sách nhà hàng
- **Lịch sử đơn hàng**: Xem đơn hàng đã đặt
- **Hồ sơ**: Thông tin cá nhân

### 📱 QR Flow
Home → QR Scan → Menu → Food Detail → Cart → Order Status → Payment

### 🏪 Browse Flow  
Home → Restaurant List → Restaurant Detail → Menu → Food Detail → Cart

### 📋 History Flow
Home → Order History → Order Status (nếu đang active)

---

## 🔄 Development Workflow

1. **Start backend server**: `npm start` (trong thư mục root)
2. **Start mobile app**: `npm start` (trong thư mục FoodStackMobile)
3. **Test demo mode**: Không cần backend, dùng data demo
4. **Test QR mode**: Cần backend chạy để validate QR token

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal
2. Test demo mode trước (không cần backend)
3. Kiểm tra network connectivity cho QR mode
4. Restart development servers
5. Clear cache và reinstall dependencies