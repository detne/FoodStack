# FoodStack Mobile - Hướng dẫn Setup và Test API

## 🚀 Cài đặt và Chạy ứng dụng

### 1. Cài đặt dependencies
```bash
cd FoodStackMobile
npm install
```

### 2. Cấu hình IP Backend
Mở file `config.js` và thay đổi `BACKEND_IP` theo IP của máy chạy backend:

```javascript
export const CONFIG = {
  BACKEND_IP: '192.168.1.100', // THAY ĐỔI IP NÀY
  BACKEND_PORT: '3000',
  // ...
};
```

#### Cách tìm IP của máy:
- **Windows**: Mở Command Prompt và chạy `ipconfig`
- **Mac/Linux**: Mở Terminal và chạy `ifconfig` hoặc `ip addr show`
- Tìm địa chỉ IPv4 của card mạng đang sử dụng (thường là 192.168.x.x)

### 3. Chạy ứng dụng
```bash
npm start
```

### 4. Test trên Expo Go
1. Cài đặt Expo Go trên điện thoại
2. Quét QR code từ terminal
3. Đảm bảo điện thoại và máy tính cùng mạng WiFi

## 🧪 Test API

### Truy cập màn hình Test
1. Mở ứng dụng trên Expo Go
2. Từ màn hình Home, nhấn nút "API Test" (chỉ hiện trong development mode)
3. Hoặc navigate trực tiếp đến màn hình APITest

### Các test có sẵn:
1. **Test Kết nối**: Kiểm tra kết nối cơ bản với backend
2. **Test QR Token**: Test việc lấy thông tin bàn từ QR code
3. **Test Menu**: Test việc lấy menu của nhà hàng
4. **Test Session**: Test việc tạo session đặt hàng
5. **Test Order**: Test việc tạo đơn hàng

### Chạy tất cả test:
Nhấn nút "Chạy Tất Cả Test" để chạy toàn bộ test sequence.

## 🔧 Troubleshooting

### Lỗi kết nối API:
1. Kiểm tra backend có đang chạy không (port 3000)
2. Kiểm tra IP trong `config.js` có đúng không
3. Kiểm tra firewall có block port 3000 không
4. Đảm bảo điện thoại và máy tính cùng mạng WiFi

### Lỗi Expo SDK:
- Ứng dụng đã được cấu hình cho Expo SDK 52 (tương thích với Expo Go)
- Nếu gặp lỗi version, hãy cập nhật Expo Go app

### Lỗi Metro bundler:
```bash
# Clear cache và restart
npm start -- --clear
```

## 📱 Các màn hình chính

1. **Home**: Màn hình chính với quick actions
2. **QR Scan**: Quét mã QR bàn
3. **Menu**: Hiển thị menu nhà hàng
4. **Cart**: Giỏ hàng
5. **Order Status**: Trạng thái đơn hàng
6. **API Test**: Màn hình test API (development only)

## 🔗 API Endpoints được test

- `GET /api/v1/health` - Health check
- `GET /api/v1/public/tables/{qrToken}` - Lấy thông tin bàn
- `GET /api/v1/public/branches/{branchId}/menu` - Lấy menu
- `POST /api/v1/customer-orders/sessions` - Tạo session
- `POST /api/v1/customer-orders` - Tạo đơn hàng

## 📝 Notes

- App sử dụng React Query để cache API calls
- AsyncStorage để lưu session token
- Axios để gọi API với interceptors
- Tất cả API calls có timeout 15 giây
- Error handling và logging đầy đủ

## 🎯 Next Steps

Sau khi test API thành công, bạn có thể:
1. Tích hợp thêm các API endpoints khác
2. Cải thiện UI/UX
3. Thêm push notifications
4. Tích hợp payment gateway
5. Thêm real-time updates với WebSocket