# 🚀 Deploy: Vercel + Render + MongoDB Atlas

## 📋 Tổng Quan

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Database**: MongoDB Atlas (đã có)
- **Redis**: Redis Cloud (đã có)
- **Storage**: Cloudinary (đã có)

---

## 🎯 BƯỚC 1: Deploy Backend lên Render

### 1.1. Tạo tài khoản Render
1. Truy cập https://render.com
2. Sign up với GitHub account
3. Authorize Render truy cập repos

### 1.2. Tạo Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect repository của bạn
3. Configure:

```
Name: qr-service-backend
Region: Singapore (gần nhất với VN)
Branch: main
Root Directory: (để trống)
Runtime: Node
Build Command: npm install && npm run prisma:generate
Start Command: node src/server.js
Instance Type: Free
```

### 1.3. Thêm Environment Variables

Click **"Environment"** tab và thêm tất cả biến từ `.env`:

```env
NODE_ENV=production
PORT=3000

# MongoDB
DATABASE_URL=mongodb+srv://quyenptnde180559_db_user:ZHbFe857V9sGw3w2@cluster0.3zp2jjw.mongodb.net/qr_service_platform?retryWrites=true&w=majority&appName=Cluster0
MONGODB_URI=mongodb+srv://quyenptnde180559_db_user:ZHbFe857V9sGw3w2@cluster0.3zp2jjw.mongodb.net/qr_service_platform?retryWrites=true&w=majority&appName=Cluster0

# Redis
REDIS_ENABLED=true
REDIS_HOST=redis-18539.c295.ap-southeast-1-1.ec2.cloud.redislabs.com
REDIS_PORT=18539
REDIS_PASSWORD=ex10oB4WjxueIvGM6mW7yMemBmbHSxlZ

# JWT (QUAN TRỌNG: Thay đổi trong production!)
JWT_SECRET=production_secret_key_min_64_characters_change_this_now_very_secure_2024
JWT_REFRESH_TOKEN_SECRET=production_refresh_secret_key_min_64_characters_change_this_now_2024

# Cloudinary
CLOUDINARY_CLOUD_NAME=dbfgkvdu7
CLOUDINARY_API_KEY=635138172262225
CLOUDINARY_API_SECRET=VbCe8dGdXxulLTNsBHjbddSjI4Q

# PayOS
PAYOS_CLIENT_ID=431d4d39-5aaa-498f-b6d6-c8630ccd640f
PAYOS_API_KEY=511d5416-7d50-4f0f-b8a3-ad6fb64b02e8
PAYOS_CHECKSUM_KEY=83b2652a4673e9aba4914a7ef3e27e6acffb2eae6ef008328b2478cfd4519b97

# CORS (sẽ cập nhật sau khi có Vercel URL)
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

# Logging
LOG_LEVEL=info
ENABLE_SWAGGER=false
DEBUG=false
```

### 1.4. Deploy

1. Click **"Create Web Service"**
2. Đợi build & deploy (3-5 phút)
3. Lấy URL: `https://qr-service-backend.onrender.com`

### 1.5. Test Backend

```bash
# Test health endpoint
curl https://qr-service-backend.onrender.com/health

# Test API
curl https://qr-service-backend.onrender.com/api/v1/health
```

---

## 🎨 BƯỚC 2: Deploy Frontend lên Vercel

### 2.1. Chuẩn bị Frontend

Tạo file `vercel.json` ở root project (đã có):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/frontend/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### 2.2. Cập nhật Frontend Environment

Tạo file `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://qr-service-backend.onrender.com/api/v1
```

### 2.3. Deploy lên Vercel

#### Option A: Qua Vercel Dashboard (Dễ nhất)

1. Truy cập https://vercel.com
2. Sign up với GitHub
3. Click **"Add New..."** → **"Project"**
4. Import repository của bạn
5. Configure:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

6. Add Environment Variables:
```
VITE_API_BASE_URL = https://qr-service-backend.onrender.com/api/v1
```

7. Click **"Deploy"**
8. Đợi deploy (2-3 phút)
9. Lấy URL: `https://your-project.vercel.app`

#### Option B: Qua Vercel CLI

```bash
# Cài Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel

# Làm theo hướng dẫn:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? qr-service-frontend
# - Directory? ./
# - Override settings? No

# Deploy production
vercel --prod
```

### 2.4. Lấy Vercel URL

Sau khi deploy xong, bạn sẽ có URL như:
```
https://qr-service-frontend.vercel.app
```

---

## 🔄 BƯỚC 3: Cập Nhật CORS & URLs

### 3.1. Cập nhật Backend Environment trên Render

1. Vào Render Dashboard
2. Chọn service **qr-service-backend**
3. Vào tab **Environment**
4. Cập nhật:

```env
CORS_ORIGIN=https://qr-service-frontend.vercel.app
FRONTEND_URL=https://qr-service-frontend.vercel.app
PAYOS_RETURN_URL=https://qr-service-frontend.vercel.app/payment/success
PAYOS_CANCEL_URL=https://qr-service-frontend.vercel.app/payment/success?cancel=true
PAYOS_WEBHOOK_URL=https://qr-service-backend.onrender.com/api/v1/payments/webhook/payos
BASE_URL=https://qr-service-backend.onrender.com
```

5. Click **"Save Changes"**
6. Service sẽ tự động redeploy

### 3.2. Cập nhật PayOS Dashboard

1. Đăng nhập https://payos.vn/portal/settings
2. Cập nhật:
   - **Webhook URL**: `https://qr-service-backend.onrender.com/api/v1/payments/webhook/payos`
   - **Return URL**: `https://qr-service-frontend.vercel.app/payment/success`
   - **Cancel URL**: `https://qr-service-frontend.vercel.app/payment/success?cancel=true`
3. Save

---

## ✅ BƯỚC 4: Test Deployment

### 4.1. Test Backend

```bash
# Health check
curl https://qr-service-backend.onrender.com/health

# Test API
curl https://qr-service-backend.onrender.com/api/v1/health
```

### 4.2. Test Frontend

1. Mở browser: `https://qr-service-frontend.vercel.app`
2. Test login
3. Test các features chính

### 4.3. Test Payment Flow

1. Tạo order
2. Proceed to payment
3. Kiểm tra PayOS redirect
4. Test webhook callback

---

## 🔧 BƯỚC 5: Tối Ưu & Monitoring

### 5.1. Setup Custom Domain (Tùy chọn)

#### Vercel (Frontend)
1. Vào Project Settings → Domains
2. Add domain: `app.yourdomain.com`
3. Configure DNS:
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

#### Render (Backend)
1. Vào Service Settings → Custom Domain
2. Add domain: `api.yourdomain.com`
3. Configure DNS:
```
Type: CNAME
Name: api
Value: qr-service-backend.onrender.com
```

### 5.2. Enable Auto-Deploy

#### Vercel
- Tự động deploy khi push lên GitHub
- Production: branch `main`
- Preview: các branch khác

#### Render
1. Vào Settings → Build & Deploy
2. Enable **"Auto-Deploy"**: Yes
3. Branch: `main`

### 5.3. Setup Monitoring

#### Render Dashboard
- Metrics: CPU, Memory, Response time
- Logs: Real-time logs
- Alerts: Email notifications

#### Vercel Analytics
1. Vào Project → Analytics
2. Enable Web Analytics
3. Monitor performance

---

## 🚨 Troubleshooting

### Backend không start trên Render

```bash
# Kiểm tra logs
# Vào Render Dashboard → Service → Logs

# Common issues:
# 1. Port binding
# Đảm bảo app listen trên process.env.PORT
```

Kiểm tra `src/server.js`:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### CORS Error

Kiểm tra backend `.env`:
```env
CORS_ORIGIN=https://qr-service-frontend.vercel.app
```

Kiểm tra `src/app.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### MongoDB Connection Failed

```bash
# Test connection string
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(err => console.error(err))"
```

### Render Free Tier Sleep

Render free tier sleep sau 15 phút không hoạt động.

Giải pháp:
1. Upgrade lên paid plan ($7/month)
2. Hoặc dùng cron job để ping:

```bash
# Tạo cron job trên cron-job.org
URL: https://qr-service-backend.onrender.com/health
Interval: Every 10 minutes
```

### Build Failed trên Vercel

```bash
# Kiểm tra build local
cd frontend
npm run build

# Nếu lỗi, fix rồi push lại
```

---

## 📊 Monitoring & Logs

### Xem Logs

#### Render
```
Dashboard → Service → Logs (real-time)
```

#### Vercel
```
Dashboard → Project → Deployments → View Function Logs
```

### Health Checks

Tạo file `src/routes/health.js`:
```javascript
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1,
    environment: process.env.NODE_ENV
  });
});

module.exports = router;
```

---

## 💰 Chi Phí

### Free Tier
- **Vercel**: Free (Hobby plan)
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  
- **Render**: Free
  - 750 hours/month
  - Sleeps after 15 min inactivity
  - 512MB RAM
  
- **MongoDB Atlas**: Free (M0)
  - 512MB storage
  - Shared cluster
  
- **Redis Cloud**: Free
  - 30MB storage
  - 30 connections

### Paid Plans (Khuyến nghị cho production)
- **Vercel Pro**: $20/month
- **Render Starter**: $7/month (no sleep)
- **MongoDB M10**: $0.08/hour (~$57/month)
- **Redis Cloud**: $5/month (250MB)

**Total**: ~$32-90/month cho production

---

## 🎉 Hoàn Thành!

### URLs của bạn:
```
Frontend: https://qr-service-frontend.vercel.app
Backend:  https://qr-service-backend.onrender.com
API:      https://qr-service-backend.onrender.com/api/v1
```

### Next Steps:
1. ✅ Test tất cả features
2. ✅ Setup custom domain
3. ✅ Enable monitoring
4. ✅ Setup backups
5. ✅ Document cho team

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trên Render/Vercel
2. Test API với Postman
3. Kiểm tra environment variables
4. Verify database connections

---

**Chúc mừng bạn đã deploy thành công! 🚀**
