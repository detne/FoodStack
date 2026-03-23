# 🎭 Mock Payment System Guide

## 📋 TỔNG QUAN

Hệ thống thanh toán mock được tạo để phát triển và test ứng dụng mà không cần PayOS thật. Hệ thống mô phỏng toàn bộ flow thanh toán từ tạo link đến webhook.

## 🚀 CÁCH SỬ DỤNG

### 1. Kích hoạt Mock Mode

Trong file `.env`:
```env
USE_MOCK_PAYMENT=true
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### 2. Flow Thanh toán Mock

1. **Tạo đơn hàng** → API tạo mock payment link
2. **Redirect** → Trang thanh toán mock (`/payment/mock-gateway`)
3. **User action** → Click "Thanh toán thành công" hoặc "Hủy"
4. **Auto webhook** → Hệ thống tự gọi webhook
5. **Redirect** → Trang kết quả (`/payment/success`)

### 3. API Endpoints

#### Backend Mock Routes
```
POST /api/v1/mock-payments/create-payment-link
GET  /api/v1/mock-payments/payment-info/:orderCode
POST /api/v1/mock-payments/simulate-payment
POST /api/v1/mock-payments/webhook
```

#### Frontend Mock Pages
```
/payment/mock-gateway    # Trang thanh toán giả lập
/payment/success         # Kết quả thanh toán
/payment/cancel          # Hủy thanh toán (redirect to success)
```

## 🎨 GIAO DIỆN MOCK

### Trang Thanh toán Mock
- Hiển thị thông tin đơn hàng
- 2 nút: "Thanh toán thành công" và "Hủy thanh toán"
- Countdown timer (30s tự động hủy)
- Thông báo đây là hệ thống mock

### Trang Kết quả
- Hiển thị trạng thái thanh toán
- Thông tin giao dịch
- Nút tải hóa đơn (mock)
- Nút quay về trang chủ

## 🔧 TECHNICAL DETAILS

### Mock Payment Controller
```javascript
// Tạo payment link
POST /api/v1/mock-payments/create-payment-link
{
  "amount": 150000,
  "description": "Thanh toán đơn hàng",
  "returnUrl": "http://localhost:5173/payment/success",
  "cancelUrl": "http://localhost:5173/payment/success?cancel=true"
}

// Response
{
  "error": 0,
  "data": {
    "orderCode": "MOCK_1234567890_abc123",
    "checkoutUrl": "http://localhost:5173/payment/mock-gateway?orderCode=...",
    "qrCode": "data:image/png;base64,...",
    "accountNumber": "MOCK_ACCOUNT",
    "accountName": "MOCK PAYMENT GATEWAY"
  }
}
```

### Mock Webhook
```javascript
// Tự động gọi sau khi user click thanh toán
POST /api/v1/payments/webhook/payos
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": "MOCK_1234567890_abc123",
    "amount": 150000,
    "reference": "MOCK_TXN_...",
    "transactionDateTime": "2024-01-01T10:00:00Z"
  }
}
```

## 🔄 CHUYỂN ĐỔI SANG PAYOS

Khi PayOS sẵn sàng:

1. **Cập nhật Environment**:
```env
USE_MOCK_PAYMENT=false
# Cấu hình PayOS credentials
```

2. **Code tự động chuyển**:
```javascript
// Trong ProcessPaymentUseCase
const useMockPayment = process.env.USE_MOCK_PAYMENT === 'true';

if (useMockPayment) {
  gatewayResult = await this.createMockPayment(...);
} else {
  gatewayResult = await this.paymentGatewayService.charge(...);
}
```

3. **Frontend routes giữ nguyên** - chỉ backend thay đổi

## 🎯 TESTING SCENARIOS

### ✅ Test Cases

1. **Thanh toán thành công**:
   - Tạo đơn hàng → Click "Thanh toán thành công"
   - Kiểm tra webhook được gọi
   - Kiểm tra order status = PAID

2. **Hủy thanh toán**:
   - Tạo đơn hàng → Click "Hủy thanh toán"
   - Kiểm tra order status = CANCELLED

3. **Timeout**:
   - Tạo đơn hàng → Chờ 30s
   - Tự động hủy và redirect

4. **Duplicate payment**:
   - Tạo payment với cùng idempotency key
   - Kiểm tra trả về payment cũ

## 🛠️ CUSTOMIZATION

### Thay đổi Timeout
```javascript
// Trong MockPaymentGateway.tsx
const [countdown, setCountdown] = useState(30); // 30 giây
```

### Thêm Payment Methods
```javascript
// Trong mock-payment.js
const paymentMethods = ['MOCK_CARD', 'MOCK_WALLET', 'MOCK_BANK'];
```

### Custom Webhook Delay
```javascript
// Trong simulatePayment
setTimeout(() => {
  this.triggerWebhook(payment);
}, 1000); // 1 giây delay
```

## 🚨 LƯU Ý

### ⚠️ Chỉ dùng cho Development
- Mock system chỉ dành cho development
- Không sử dụng trong production
- Luôn có thông báo "Mock Payment" trên UI

### 🔒 Security
- Mock payment không validate signature
- Không có rate limiting
- Không lưu trữ thông tin thật

### 📊 Monitoring
- Log tất cả mock transactions
- Track conversion rate trong development
- Monitor webhook success rate

## 🎉 BENEFITS

✅ **Immediate Development**: Phát triển ngay không cần chờ PayOS
✅ **Full Flow Testing**: Test toàn bộ payment flow
✅ **Easy Debugging**: Debug dễ dàng với mock data
✅ **Demo Ready**: Có thể demo cho client
✅ **No External Dependencies**: Không phụ thuộc service bên ngoài
✅ **Cost Effective**: Không tốn phí transaction trong development

---

**Happy Coding!** 🚀