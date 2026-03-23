# 🏦 PayOS Real Payment Setup

## ✅ HOÀN THÀNH SETUP

Hệ thống đã được cấu hình để sử dụng **PayOS thật**!

### 🔧 ĐÃ CẤU HÌNH:

1. **Environment Variables**:
   ```env
   USE_MOCK_PAYMENT=false  # ✅ Đã tắt mock
   PAYOS_CLIENT_ID=431d4d39-5aaa-498f-b6d6-c8630ccd640f
   PAYOS_API_KEY=511d5416-7d50-4f0f-b8a3-ad6fb64b02e8
   PAYOS_CHECKSUM_KEY=83b2652a4673e9aba4914a7ef3e27e6acffb2eae6ef008328b2478cfd4519b97
   ```

2. **Webhook URLs**:
   ```
   Webhook: https://cd01-14-233-185-238.ngrok-free.app/api/v1/payments/webhook/payos
   Return:  https://cd01-14-233-185-238.ngrok-free.app/payment/success
   Cancel:  https://cd01-14-233-185-238.ngrok-free.app/payment/success?cancel=true
   ```

3. **PayOS Service**: ✅ Sẵn sàng
4. **Webhook Handler**: ✅ Sẵn sàng
5. **Frontend Integration**: ✅ Sẵn sàng

---

## 🚀 CÁCH TEST PAYOS THẬT:

### 1. **Start Server**:
```bash
npm run dev
```

### 2. **Test Payment Flow**:
1. Quét QR code → Vào Table Hub
2. Order món ăn
3. Click "VIEW BILL" → Xem bill summary
4. Click "Pay Now" → Chọn **"PayOS"**
5. Sẽ redirect đến **PayOS thật**
6. Thanh toán với thông tin test của PayOS

### 3. **PayOS Test Cards**:
PayOS cung cấp test cards để test:
- **Test Bank**: Vietcombank
- **Test Account**: 1234567890
- **Test Amount**: Bất kỳ số tiền nào

---

## 🔍 MONITORING & DEBUGGING:

### 1. **Check Logs**:
```bash
# Backend logs
tail -f logs/app.log

# PayOS API calls
console.log trong PayOSService
```

### 2. **Webhook Testing**:
- PayOS sẽ gọi webhook khi thanh toán thành công
- Check console logs để xem webhook data
- Verify signature validation

### 3. **Common Issues**:

**❌ Signature Invalid**:
- Kiểm tra PAYOS_CHECKSUM_KEY
- Đảm bảo webhook URL đúng

**❌ Payment Link Failed**:
- Kiểm tra PAYOS_CLIENT_ID và API_KEY
- Verify amount > 0
- Check orderCode format

**❌ Webhook Not Received**:
- Kiểm tra ngrok URL còn hoạt động
- Verify webhook URL trong PayOS dashboard

---

## 📊 PAYOS DASHBOARD:

### Cần cấu hình trong PayOS:

1. **Vào PayOS Dashboard**: https://my.payos.vn/
2. **Tìm "Webhook" hoặc "Tích hợp"**
3. **Nhập URLs**:
   ```
   Webhook URL: https://cd01-14-233-185-238.ngrok-free.app/api/v1/payments/webhook/payos
   Return URL:  https://cd01-14-233-185-238.ngrok-free.app/payment/success
   Cancel URL:  https://cd01-14-233-185-238.ngrok-free.app/payment/success?cancel=true
   ```

---

## 🎯 PRODUCTION CHECKLIST:

### Khi deploy production:

1. **Update URLs**:
   ```env
   PAYOS_RETURN_URL=https://yourdomain.com/payment/success
   PAYOS_CANCEL_URL=https://yourdomain.com/payment/success?cancel=true
   PAYOS_WEBHOOK_URL=https://yourdomain.com/api/v1/payments/webhook/payos
   ```

2. **Update PayOS Dashboard**:
   - Thay đổi webhook URLs
   - Verify production credentials

3. **Test với số tiền nhỏ** trước khi go live

4. **Monitor transactions** trong PayOS dashboard

---

## 🔄 ROLLBACK TO MOCK:

Nếu cần quay lại mock payment:
```env
USE_MOCK_PAYMENT=true
```

---

**PayOS thật đã sẵn sàng! Bắt đầu test ngay! 🎉**