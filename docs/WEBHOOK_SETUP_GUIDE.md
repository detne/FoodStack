# Hướng dẫn cấu hình Webhook PayOS

## Tổng quan
Webhook là cơ chế để PayOS thông báo cho server của bạn khi có sự kiện thanh toán xảy ra (thành công, thất bại, hủy).

## Các bước cấu hình

### 1. Xác định Webhook URL

Webhook URL của bạn sẽ là:
```
https://your-domain.com/api/v1/subscription/webhook
```

**Lưu ý quan trọng:**
- URL phải là HTTPS (không chấp nhận HTTP)
- URL phải public và có thể truy cập từ internet
- Không được có authentication (PayOS sẽ verify bằng signature)

### 2. Cấu hình trong PayOS Dashboard

1. Đăng nhập vào [PayOS Dashboard](https://my.payos.vn)
2. Vào **Settings** → **Webhook**
3. Thêm webhook URL mới:
   ```
   https://your-domain.com/api/v1/subscription/webhook
   ```
4. Chọn các events cần nhận:
   - ✅ Payment Success
   - ✅ Payment Failed
   - ✅ Payment Cancelled
5. Lưu cấu hình

### 3. Development với ngrok

Khi develop local, bạn cần expose localhost ra internet bằng ngrok:

#### Bước 1: Cài đặt ngrok
```bash
# Download từ https://ngrok.com/download
# Hoặc dùng npm
npm install -g ngrok
```

#### Bước 2: Chạy ngrok
```bash
# Expose port 3000 (backend port)
ngrok http 3000
```

Output sẽ như:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

#### Bước 3: Cập nhật webhook URL trong PayOS
```
https://abc123.ngrok-free.app/api/v1/subscription/webhook
```

#### Bước 4: Cập nhật .env
```env
# Cập nhật return URL với ngrok domain
PAYOS_RETURN_URL=https://abc123.ngrok-free.app/payment/success
PAYOS_CANCEL_URL=https://abc123.ngrok-free.app/payment/success?cancel=true
```

**Lưu ý:** Mỗi lần restart ngrok, URL sẽ thay đổi. Bạn cần cập nhật lại trong PayOS dashboard.

### 4. Kiểm tra Webhook hoạt động

#### Test với PayOS Ping
PayOS sẽ gửi một ping request khi bạn lưu webhook URL:
```json
{
  "data": {
    "orderCode": "0"
  }
}
```

Server sẽ trả về:
```json
{
  "message": "Webhook confirmed"
}
```

#### Test với thanh toán thực
1. Tạo một subscription payment từ frontend
2. Hoàn tất thanh toán trên PayOS
3. Kiểm tra logs:
   ```bash
   # Xem logs backend
   tail -f logs/combined.log
   
   # Hoặc xem console output
   ```

Bạn sẽ thấy log:
```
SUBSCRIPTION WEBHOOK RAW: {
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": "123456789012345",
    ...
  },
  "signature": "..."
}
✅ Subscription xxx activated successfully
```

### 5. Xử lý lỗi thường gặp

#### Lỗi: "Invalid webhook signature"
**Nguyên nhân:** Checksum key không đúng hoặc webhook body bị modify

**Giải pháp:**
1. Kiểm tra `PAYOS_CHECKSUM_KEY` trong .env
2. Đảm bảo không có middleware nào modify request body
3. Verify signature logic trong `src/service/payos.js`

#### Lỗi: "Payment not found"
**Nguyên nhân:** OrderCode không khớp với payment trong database

**Giải pháp:**
1. Kiểm tra orderCode trong webhook body
2. Query database để tìm payment:
   ```javascript
   db.payments.findOne({ transaction_ref: "orderCode" })
   ```
3. Verify rằng payment được tạo trước khi webhook đến

#### Lỗi: Webhook không được gọi
**Nguyên nhân:** URL không accessible hoặc chưa cấu hình đúng

**Giải pháp:**
1. Test URL từ bên ngoài:
   ```bash
   curl -X POST https://your-domain.com/api/v1/subscription/webhook \
     -H "Content-Type: application/json" \
     -d '{"data":{"orderCode":"0"}}'
   ```
2. Kiểm tra firewall/security groups
3. Verify URL trong PayOS dashboard
4. Kiểm tra ngrok đang chạy (nếu dùng ngrok)

### 6. Security Best Practices

#### Verify Signature
Luôn verify signature từ PayOS:
```javascript
const isValid = payOSService.verifyWebhookSignature(webhookBody);
if (!isValid) {
  throw new Error('Invalid webhook signature');
}
```

#### Log Everything
Log tất cả webhook requests để debug:
```javascript
console.log('WEBHOOK RECEIVED:', JSON.stringify(webhookBody, null, 2));
```

#### Idempotency
Xử lý trường hợp webhook được gọi nhiều lần:
```javascript
if (payment.status === 'PAID') {
  return { message: 'Payment already processed' };
}
```

#### Rate Limiting
Không cần rate limit cho webhook endpoint vì PayOS đã handle.

### 7. Monitoring

#### Check webhook logs
```bash
# Xem logs gần đây
tail -n 100 logs/combined.log | grep WEBHOOK

# Theo dõi real-time
tail -f logs/combined.log | grep WEBHOOK
```

#### Database queries
```javascript
// Kiểm tra payments chưa được xử lý
db.payments.find({
  status: 'PENDING',
  'payos_data.payment_type': 'subscription'
})

// Kiểm tra subscriptions đã activate
db.subscriptions.find({
  status: 'ACTIVE',
  updated_at: { $gte: new Date(Date.now() - 24*60*60*1000) }
})
```

### 8. Production Checklist

- [ ] Webhook URL là HTTPS
- [ ] URL đã được thêm vào PayOS dashboard
- [ ] Checksum key đúng trong .env
- [ ] Test webhook với thanh toán thực
- [ ] Logs được ghi đầy đủ
- [ ] Error handling đầy đủ
- [ ] Monitoring được setup
- [ ] Backup webhook URL (nếu có)

## Tài liệu tham khảo

- [PayOS Webhook Documentation](https://payos.vn/docs/webhook)
- [PayOS API Reference](https://payos.vn/docs/api)
- [ngrok Documentation](https://ngrok.com/docs)

## Liên hệ hỗ trợ

Nếu gặp vấn đề:
1. Check logs: `logs/combined.log`
2. Test webhook URL: `curl -X POST https://your-domain.com/api/v1/subscription/webhook`
3. Liên hệ PayOS support: support@payos.vn
