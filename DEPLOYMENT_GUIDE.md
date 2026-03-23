# 🚀 Hướng Dẫn Deploy QR Service Platform

## 📋 Mục Lục
1. [Chuẩn Bị](#chuẩn-bị)
2. [Deploy Backend](#deploy-backend)
3. [Deploy Frontend](#deploy-frontend)
4. [Deploy Mobile App](#deploy-mobile-app)
5. [Cấu Hình Database](#cấu-hình-database)
6. [Cấu Hình Services](#cấu-hình-services)
7. [Checklist Trước Khi Deploy](#checklist-trước-khi-deploy)

---

## 🎯 Chuẩn Bị

### Yêu Cầu
- ✅ Node.js 20+
- ✅ MongoDB Atlas account (đã có)
- ✅ PostgreSQL/Supabase (đã có)
- ✅ Redis Cloud account (đã có)
- ✅ Cloudinary account (đã có)
- ✅ PayOS account (đã có)
- ✅ Domain name (tùy chọn)

### Checklist Trước Deploy
```bash
# 1. Test local
npm run dev:backend
cd frontend && npm run dev

# 2. Build test
npm run build
cd frontend && npm run build

# 3. Kiểm tra environment variables
npm run payos:check
```

---

## 🔧 Deploy Backend

### Option 1: Railway (Khuyến Nghị - Dễ Nhất)

#### Bước 1: Cài đặt Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### Bước 2: Khởi tạo project
```bash
railway init
railway link
```

#### Bước 3: Thêm environment variables
```bash
# Tự động từ .env
railway variables set $(cat .env | grep -v '^#' | xargs)

# Hoặc thủ công trên dashboard
railway open
# Vào Settings > Variables > Add all from .env
```

#### Bước 4: Deploy
```bash
railway up
```

#### Bước 5: Lấy URL
```bash
railway domain
# Hoặc tạo custom domain
railway domain add yourdomain.com
```

### Option 2: Render

#### Bước 1: Tạo file render.yaml
```yaml
# render.yaml (tạo ở root)
services:
  - type: web
    name: qr-service-backend
    env: node
    buildCommand: npm install && npm run prisma:generate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: MONGODB_URI
        sync: false
      - key: REDIS_HOST
        sync: false
      # ... thêm tất cả env vars
```

#### Bước 2: Deploy
1. Đăng nhập https://render.com
2. New > Web Service
3. Connect GitHub repo
4. Chọn branch main
5. Thêm environment variables
6. Deploy

### Option 3: Vercel (Backend API)

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
cd backend
vercel

# Production
vercel --prod
```

### Option 4: DigitalOcean App Platform

1. Đăng nhập https://cloud.digitalocean.com
2. Create > Apps
3. Connect GitHub
4. Configure:
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - Port: 3000
5. Add environment variables
6. Deploy

### Option 5: AWS (EC2)

```bash
# SSH vào EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone your-repo-url
cd FoodStack-new

# Cài dependencies
npm install

# Setup PM2
npm install -g pm2
pm2 start src/server.js --name qr-backend
pm2 startup
pm2 save

# Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🎨 Deploy Frontend

### Option 1: Vercel (Khuyến Nghị)

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Production
vercel --prod
```

Hoặc qua GitHub:
1. Đăng nhập https://vercel.com
2. Import Project
3. Connect GitHub repo
4. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api/v1
   ```
6. Deploy

### Option 2: Netlify

```bash
# Cài Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

Hoặc qua GitHub:
1. Đăng nhập https://netlify.com
2. New site from Git
3. Connect GitHub
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Add environment variables
6. Deploy

### Option 3: Cloudflare Pages

```bash
# Cài Wrangler CLI
npm install -g wrangler

# Deploy
cd frontend
npm run build
wrangler pages deploy dist
```

### Option 4: AWS S3 + CloudFront

```bash
# Build
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## 📱 Deploy Mobile App

### iOS (App Store)

```bash
cd FoodStackMobile

# Build production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android (Google Play)

```bash
cd FoodStackMobile

# Build production
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### Expo Go (Development)

```bash
cd FoodStackMobile
npx expo start
```

---

## 💾 Cấu Hình Database

### MongoDB Atlas (Đã Setup)
✅ Connection string đã có trong .env
```
mongodb+srv://quyenptnde180559_db_user:***@cluster0.3zp2jjw.mongodb.net/
```

### PostgreSQL/Supabase (Đã Setup)
✅ Connection string đã có trong .env

### Redis Cloud (Đã Setup)
✅ Connection đã có trong .env

### Migrations

```bash
# Chạy migrations trước khi deploy
npm run prisma:generate
npm run prisma:push

# Hoặc trên production
railway run npm run prisma:push
```

---

## ⚙️ Cấu Hình Services

### 1. PayOS Webhook URL

Sau khi deploy backend, cập nhật webhook URL:

```bash
# Lấy production URL
PROD_URL="https://your-backend-url.com"

# Cập nhật trong .env production
PAYOS_WEBHOOK_URL=$PROD_URL/api/v1/payments/webhook/payos
PAYOS_RETURN_URL=https://your-frontend-url.com/payment/success
PAYOS_CANCEL_URL=https://your-frontend-url.com/payment/success?cancel=true
```

Cập nhật trên PayOS Dashboard:
1. Đăng nhập https://payos.vn/portal/settings
2. Webhook URL: `https://your-backend-url.com/api/v1/payments/webhook/payos`
3. Return URL: `https://your-frontend-url.com/payment/success`

### 2. CORS Configuration

Cập nhật CORS trong production .env:
```env
CORS_ORIGIN=https://your-frontend-url.com
FRONTEND_URL=https://your-frontend-url.com
```

### 3. Cloudinary

✅ Đã setup, không cần thay đổi

### 4. Redis

✅ Đã setup, không cần thay đổi

---

## 📝 Environment Variables Production

### Backend (.env.production)
```env
NODE_ENV=production
PORT=3000
APP_URL=https://your-backend-url.com

# Database
DATABASE_URL=mongodb+srv://...
MONGODB_URI=mongodb+srv://...
POSTGRES_DATABASE_URL=postgresql://...
REDIS_HOST=redis-18539.c295.ap-southeast-1-1.ec2.cloud.redislabs.com
REDIS_PORT=18539
REDIS_PASSWORD=***

# JWT (THAY ĐỔI TRONG PRODUCTION!)
JWT_SECRET=your_production_secret_min_64_characters_very_secure
JWT_REFRESH_TOKEN_SECRET=your_production_refresh_secret_min_64_characters

# PayOS
PAYOS_WEBHOOK_URL=https://your-backend-url.com/api/v1/payments/webhook/payos
PAYOS_RETURN_URL=https://your-frontend-url.com/payment/success
PAYOS_CANCEL_URL=https://your-frontend-url.com/payment/success?cancel=true

# CORS
CORS_ORIGIN=https://your-frontend-url.com
FRONTEND_URL=https://your-frontend-url.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=dbfgkvdu7
CLOUDINARY_API_KEY=635138172262225
CLOUDINARY_API_SECRET=***

# Logging
LOG_LEVEL=info
LOG_QUERIES=false
ENABLE_SWAGGER=false
DEBUG=false
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
```

---

## ✅ Checklist Trước Khi Deploy

### Security
- [ ] Thay đổi JWT_SECRET trong production
- [ ] Thay đổi JWT_REFRESH_TOKEN_SECRET
- [ ] Kiểm tra CORS_ORIGIN
- [ ] Disable ENABLE_SWAGGER=false
- [ ] Set LOG_LEVEL=info
- [ ] Set DEBUG=false

### Database
- [ ] Chạy migrations
- [ ] Backup database
- [ ] Test connection strings

### Services
- [ ] Cập nhật PayOS webhook URL
- [ ] Test payment flow
- [ ] Test Cloudinary upload
- [ ] Test Redis connection

### Testing
- [ ] Test API endpoints
- [ ] Test authentication
- [ ] Test payment flow
- [ ] Test file upload
- [ ] Test WebSocket connections

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Setup logging
- [ ] Setup uptime monitoring
- [ ] Setup performance monitoring

---

## 🚀 Quick Deploy Script

Tạo file `deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Deploying QR Service Platform..."

# Backend
echo "📦 Building backend..."
npm install
npm run prisma:generate

# Frontend
echo "🎨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy
echo "🌐 Deploying to production..."
# Thêm deploy commands của platform bạn chọn

echo "✅ Deployment complete!"
```

Chạy:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 Monitoring & Maintenance

### Health Check Endpoint
```javascript
// src/routes/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1,
    redis: redisClient.status === 'ready'
  });
});
```

### Logs
```bash
# Railway
railway logs

# Render
render logs

# PM2
pm2 logs qr-backend
```

---

## 🆘 Troubleshooting

### Backend không start
```bash
# Kiểm tra logs
railway logs
# Hoặc
pm2 logs

# Kiểm tra env vars
railway variables
```

### Database connection failed
```bash
# Test MongoDB
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK'))"

# Test PostgreSQL
psql $POSTGRES_DATABASE_URL
```

### CORS errors
- Kiểm tra CORS_ORIGIN trong backend .env
- Kiểm tra VITE_API_BASE_URL trong frontend .env

### Payment webhook không hoạt động
- Kiểm tra PAYOS_WEBHOOK_URL
- Kiểm tra PayOS dashboard settings
- Test với ngrok local trước

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs
2. Kiểm tra environment variables
3. Test local trước
4. Kiểm tra network/firewall

---

## 🎉 Hoàn Thành!

Sau khi deploy xong:
1. ✅ Test tất cả features
2. ✅ Setup monitoring
3. ✅ Setup backups
4. ✅ Document production URLs
5. ✅ Train team

**Production URLs:**
- Backend: https://your-backend-url.com
- Frontend: https://your-frontend-url.com
- API Docs: https://your-backend-url.com/api-docs (nếu enable)

---

**Happy Deploying! 🚀**
