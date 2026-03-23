# 💳 Payment Flow Guide

## 🔄 CUSTOMER PAYMENT FLOW

### 1. **Table Hub** (`/t/:qr_token`)
- Khách quét QR code → Vào Table Hub
- Có nút **"VIEW BILL"** để xem tổng bill

### 2. **My Orders** (`/customer/my-order`)
- Xem tất cả orders của bàn
- Có nút **"View Bill & Pay"** (chỉ hiện khi có unpaid orders)
- Có nút **"Pay Now"** cho từng order riêng lẻ

### 3. **Bill Summary** (`/customer/bill`) ⭐ **MỚI**
- Trang tổng hợp tất cả unpaid orders
- Hiển thị:
  - Thông tin bàn & nhà hàng
  - Chi tiết từng order
  - Tính tổng: Subtotal + Tax (10%) + Service Charge (5%)
  - Nút **"Pay Now"** cho toàn bộ bill

### 4. **Payment Page** (`/customer/payment`) ⭐ **CẬP NHẬT**
- Hỗ trợ thanh toán nhiều orders cùng lúc
- 2 phương thức:
  - **Cash Payment**: Thanh toán tại quầy
  - **QR Pay**: Thanh toán qua Mock PayOS
- Hiển thị bill summary hoặc order detail

### 5. **Mock Payment Gateway** (`/payment/mock-gateway`) ⭐ **MỚI**
- Trang thanh toán giả lập
- 2 nút: "Thanh toán thành công" / "Hủy thanh toán"
- Countdown timer 30s
- Auto webhook simulation

### 6. **Payment Success** (`/payment/success`) ⭐ **MỚI**
- Hiển thị kết quả thanh toán
- Thông tin giao dịch
- Nút tải hóa đơn (mock)

## 🎯 PAYMENT METHODS

### 💵 Cash Payment
1. Customer chọn "Cash Payment"
2. Hệ thống tạo payment request
3. Redirect to success page
4. Customer đến quầy thanh toán

### 💳 QR Pay (Mock PayOS)
1. Customer chọn "QR Pay"
2. Hệ thống tạo mock payment link
3. Redirect to Mock Payment Gateway
4. Customer click "Thanh toán thành công"
5. Auto webhook → Update order status
6. Redirect to success page

## 🔧 TECHNICAL IMPLEMENTATION

### Backend APIs
```
POST /api/v1/payments/process
- Tạo payment cho single/multiple orders
- Hỗ trợ CASH và QR_PAY methods

GET /api/v1/customer-orders/table/:tableId
- Lấy tất cả orders của bàn
- Filter unpaid orders cho bill summary

POST /api/v1/mock-payments/create-payment-link
- Tạo mock payment link
- Trả về checkout URL

POST /api/v1/mock-payments/simulate-payment
- Mô phỏng thanh toán thành công/thất bại
- Tự động trigger webhook
```

### Frontend Pages
```
/customer/bill          - Bill summary (mới)
/customer/payment       - Payment checkout (cập nhật)
/payment/mock-gateway   - Mock payment (mới)
/payment/success        - Payment result (mới)
```

## 🎨 UI/UX IMPROVEMENTS

### ✅ Bill Summary Page
- Responsive design
- Clear pricing breakdown
- Multiple orders support
- Restaurant branding

### ✅ Payment Page
- Method selection UI
- Order summary display
- Loading states
- Error handling

### ✅ Mock Payment Gateway
- Realistic payment interface
- Countdown timer
- Success/cancel actions
- Mock branding

## 🚀 BENEFITS

### For Customers:
- ✅ **Clear Bill Overview**: Xem tổng bill trước khi thanh toán
- ✅ **Multiple Payment Options**: Cash hoặc QR Pay
- ✅ **Batch Payment**: Thanh toán nhiều orders cùng lúc
- ✅ **Real-time Updates**: Status updates tức thì

### For Development:
- ✅ **Mock Payment System**: Test không cần PayOS thật
- ✅ **Complete Flow**: Full payment journey
- ✅ **Easy Migration**: Dễ chuyển sang PayOS thật
- ✅ **Webhook Simulation**: Test webhook handling

### For Business:
- ✅ **Better UX**: Customer experience tốt hơn
- ✅ **Reduced Errors**: Ít nhầm lẫn trong thanh toán
- ✅ **Staff Efficiency**: Ít can thiệp từ staff
- ✅ **Demo Ready**: Có thể demo cho client

## 🔄 MIGRATION TO REAL PAYOS

Khi cần chuyển sang PayOS thật:

1. **Update Environment**:
```env
USE_MOCK_PAYMENT=false
PAYOS_CLIENT_ID=real_client_id
PAYOS_API_KEY=real_api_key
PAYOS_CHECKSUM_KEY=real_checksum_key
```

2. **Code tự động chuyển** - không cần thay đổi frontend
3. **Test với số tiền nhỏ** trước khi go live

---

**Payment flow hoàn chỉnh và sẵn sàng sử dụng!** 🎉