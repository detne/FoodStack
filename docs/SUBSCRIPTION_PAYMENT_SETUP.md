# Subscription Payment Setup Guide

## Overview
Hệ thống thanh toán subscription sử dụng PayOS API để xử lý thanh toán gói Pro và VIP.

## Database Setup

1. Chạy migration để tạo bảng subscription:
```bash
psql -h db.pyrsmlesndslcvfpregt.supabase.co -U postgres -d postgres -f database/migrations/postgresql/007_subscription_system.sql
```

Hoặc copy nội dung file và chạy trong Supabase SQL Editor.

## PayOS Configuration

### 1. Cập nhật Return URL trong .env

Thêm return URL cho subscription payment:
```env
# Subscription Payment Return URL
PAYOS_SUBSCRIPTION_RETURN_URL=http://localhost:5173/payment/subscription/success
PAYOS_SUBSCRIPTION_CANCEL_URL=http://localhost:5173/payment/subscription/success?cancel=true
```

### 2. Cập nhật Webhook URL

Trong PayOS Dashboard, thêm webhook URL mới:
```
https://your-domain.com/api/v1/subscription/webhook
```

Hoặc dùng ngrok cho development:
```bash
ngrok http 3000
# Copy URL và thêm vào PayOS webhook settings
https://xxxx-xxx-xxx-xxx.ngrok-free.app/api/v1/subscription/webhook
```

## API Endpoints

### Get Subscription Plans
```http
GET /api/v1/subscription/plans
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "free",
      "display_name": "Free",
      "price": 0,
      "features": {...},
      "limits": {...}
    },
    ...
  ]
}
```

### Get Current Subscription
```http
GET /api/v1/subscription/current
Authorization: Bearer <token>
```

### Create Subscription Payment
```http
POST /api/v1/subscription/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "planName": "pro",
  "paymentMethod": "momo"
}
```

Response:
```json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "planName": "pro",
    "planDisplayName": "Pro",
    "amount": 4000,
    "vatAmount": 400,
    "totalAmount": 4400,
    "expiresAt": "2024-01-30T00:00:00Z"
  },
  "payment": {
    "id": "uuid",
    "orderCode": "123456789012345",
    "checkoutUrl": "https://pay.payos.vn/...",
    "qrCode": "https://...",
    "accountNumber": "...",
    "accountName": "..."
  }
}
```

### Webhook Handler
```http
POST /api/v1/subscription/webhook
Content-Type: application/json

{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": "123456789012345",
    ...
  },
  "signature": "..."
}
```

## Frontend Integration

### 1. Payment Flow

```typescript
// User clicks "Chọn gói Pro"
navigate('/payment?plan=pro');

// Payment page calls API
const response = await fetch('/api/v1/subscription/payment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    planName: 'pro',
    paymentMethod: 'momo',
  }),
});

const data = await response.json();

// Redirect to PayOS
window.location.href = data.payment.checkoutUrl;
```

### 2. Success Callback

PayOS sẽ redirect về:
```
http://localhost:5173/payment/subscription/success?orderCode=xxx&code=00
```

Component `PaymentSubscriptionSuccess` sẽ:
- Hiển thị trạng thái thanh toán
- Tự động redirect về `/owner` sau 3 giây

## Testing

### 1. Test với Mock Payment

Set trong .env:
```env
USE_MOCK_PAYMENT=true
MOCK_PAYMENT_AUTO_SUCCESS=true
```

### 2. Test với PayOS Sandbox

1. Dùng test credentials từ PayOS
2. Sử dụng test card numbers
3. Check webhook logs

### 3. Verify Subscription Status

```bash
# Check database
psql -h ... -U postgres -d postgres -c "
SELECT 
  rs.*,
  sp.name as plan_name,
  sp.display_name
FROM restaurant_subscriptions rs
JOIN subscription_plans sp ON rs.plan_id = sp.id
WHERE rs.restaurant_id = 'your-restaurant-id'
ORDER BY rs.created_at DESC;
"
```

## Troubleshooting

### Webhook không nhận được

1. Check ngrok đang chạy
2. Verify webhook URL trong PayOS dashboard
3. Check logs: `tail -f logs/combined.log`

### Payment không được activate

1. Check webhook signature
2. Verify orderCode match
3. Check transaction logs trong database

### Frontend không redirect

1. Check CORS settings
2. Verify return URL trong .env
3. Check browser console for errors

## Security Notes

1. Webhook signature MUST be verified
2. Never expose PayOS credentials in frontend
3. Always use HTTPS in production
4. Validate all input data
5. Log all payment transactions

## Production Checklist

- [ ] Update PayOS credentials to production
- [ ] Set correct return URLs (HTTPS)
- [ ] Configure webhook URL (HTTPS)
- [ ] Enable SSL/TLS
- [ ] Set up monitoring and alerts
- [ ] Test payment flow end-to-end
- [ ] Backup database before deployment
- [ ] Document rollback procedure
