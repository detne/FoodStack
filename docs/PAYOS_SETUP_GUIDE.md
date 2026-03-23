# 💳 PayOS Setup Guide

## 🎭 MOCK PAYMENT (HIỆN TẠI)

**Trạng thái**: ✅ **HOÀN THÀNH** - Hệ thống mock payment đã sẵn sàng!

### Cách sử dụng Mock Payment:

1. **Kích hoạt Mock Mode** (đã cấu hình):
```env
USE_MOCK_PAYMENT=true
```

2. **Test Payment Flow**:
   - Tạo đơn hàng bình thường
   - Chọn thanh toán QR Pay
   - Sẽ redirect đến trang mock payment
   - Click "Thanh toán thành công" để test

3. **Mock Features**:
   - ✅ Trang thanh toán giả lập
   - ✅ Webhook tự động
   - ✅ Success/Cancel pages
   - ✅ Order status update
   - ✅ Countdown timer

📖 **Chi tiết**: Xem `docs/MOCK_PAYMENT_GUIDE.md`

---

## 🏦 PAYOS THẬT (TƯƠNG LAI)

Khi cần chuyển sang PayOS thật:

### Bước 1: Đăng ký PayOS
1. Truy cập: https://payos.vn/
2. Đăng ký tài khoản business
3. Xác thực thông tin doanh nghiệp

### Bước 2: Lấy API Credentials
1. Vào Dashboard: https://my.payos.vn/
2. Tìm "Developer" hoặc "Tích hợp"
3. Lấy:
   - Client ID
   - API Key  
   - Checksum Key

### Bước 3: Cấu hình Webhook
Tại https://my.payos.vn/settings/webhook:

```
Webhook URL: https://yourdomain.com/api/v1/payments/webhook/payos
Return URL:  https://yourdomain.com/payment/success
Cancel URL:  https://yourdomain.com/payment/success?cancel=true
```

### Bước 4: Cập nhật Environment
```env
USE_MOCK_PAYMENT=false
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

### Bước 5: Test Production
- Code tự động chuyển từ mock sang PayOS
- Không cần thay đổi frontend
- Test với số tiền nhỏ trước

---

## 🔄 MIGRATION PLAN

### Phase 1: Mock Development ✅
- [x] Mock payment system
- [x] Full payment flow
- [x] Webhook simulation
- [x] UI/UX complete

### Phase 2: PayOS Integration (Khi cần)
- [ ] PayOS account setup
- [ ] API credentials
- [ ] Webhook configuration
- [ ] Production testing

### Phase 3: Go Live
- [ ] Switch environment variable
- [ ] Monitor transactions
- [ ] Handle edge cases

---

## 🎯 CURRENT STATUS

**✅ READY FOR DEVELOPMENT**
- Mock payment system hoạt động 100%
- Có thể phát triển và test tất cả tính năng
- Demo được cho client
- Không cần PayOS ngay lập tức

**🔄 NEXT STEPS**
- Hoàn thiện các tính năng khác
- Test thoroughly với mock system
- Khi cần production → setup PayOS

---

## 🚀 QUICK START

1. **Start Development Server**:
```bash
npm run dev
```

2. **Test Payment**:
   - Tạo đơn hàng
   - Chọn QR Pay
   - Test mock payment flow

3. **Check Logs**:
   - Xem console logs
   - Kiểm tra webhook calls
   - Monitor order status

**Everything is ready! Start coding! 🎉**