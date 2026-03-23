# ⚡ Quick Deploy Guide - 15 Phút

## 🎯 Mục Tiêu
Deploy dự án lên production trong 15 phút với:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas (đã có)

---

## 📋 Checklist Trước Khi Bắt Đầu

```bash
# 1. Kiểm tra deployment readiness
npm run deploy:check

# 2. Tạo production secrets
npm run deploy:secrets
# Copy output và lưu lại
```

---

## 🚀 BƯỚC 1: Deploy Backend (5 phút)

### 1. Đăng nhập Render
- Truy cập: https://render.com
- Sign up với GitHub

### 2. Tạo Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repo
3. Điền thông tin:
   ```
   Name: qr-service-backend
   Region: Singapore
   Branch: main
   Build Command: npm install && npm run prisma:generate
   Start Command: npm start
   ```

### 3. Add Environment Variables
Copy tất cả từ `.env` và paste vào Render:

**QUAN TRỌNG - Thay đổi những biến này:**
```env
NODE_ENV=production
JWT_SECRET=[paste từ deploy:secrets]
JWT_REFRESH_TOKEN_SECRET=[paste từ deploy:secrets]
LOG_LEVEL=info
ENABLE_SWAGGER=false
DEBUG=false
```

**Giữ nguyên:**
```env
DATABASE_URL=mongodb+srv://...
MONGODB_URI=mongodb+srv://...
REDIS_HOST=redis-18539...
REDIS_PORT=18539
REDIS_PASSWORD=ex10oB4W...
CLOUDINARY_CLOUD_NAME=dbfgkvdu7
CLOUDINARY_API_KEY=635138172262225
CLOUDINARY_API_SECRET=VbCe8dGd...
PAYOS_CLIENT_ID=431d4d39...
PAYOS_API_KEY=511d5416...
PAYOS_CHECKSUM_KEY=83b2652a...
```

**Sẽ cập nhật sau:**
```env
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
PAYOS_RETURN_URL=https://your-frontend.vercel.app/payment/success
PAYOS_CANCEL_URL=https://your-frontend.vercel.app/payment/success?cancel=true
PAYOS_WEBHOOK_URL=https://qr-service-backend.onrender.com/api/v1/payments/webhook/payos
```

### 4. Deploy
- Click **"Create Web Service"**
- Đợi 3-5 phút
- Lấy URL: `https://qr-service-backend.onrender.com`

### 5. Test
```bash
curl https://qr-service-backend.onrender.com/health
```

---

## 🎨 BƯỚC 2: Deploy Frontend (5 phút)

### 1. Cập nhật Frontend Environment
```bash
# Tạo file frontend/.env.production
echo "VITE_API_BASE_URL=https://qr-service-backend.onrender.com/api/v1" > frontend/.env.production
```

### 2. Đăng nhập Vercel
- Truy cập: https://vercel.com
- Sign up với GitHub

### 3. Import Project
1. Click **"Add New..."** → **"Project"**
2. Import GitHub repo
3. Configure:
   ```
   Framework: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

### 4. Add Environment Variable
```
VITE_API_BASE_URL = https://qr-service-backend.onrender.com/api/v1
```

### 5. Deploy
- Click **"Deploy"**
- Đợi 2-3 phút
- Lấy URL: `https://your-project.vercel.app`

---

## 🔄 BƯỚC 3: Cập Nhật URLs (3 phút)

### 1. Cập nhật Backend trên Render
Vào Render → Service → Environment, cập nhật:
```env
CORS_ORIGIN=https://your-project.vercel.app
FRONTEND_URL=https://your-project.vercel.app
PAYOS_RETURN_URL=https://your-project.vercel.app/payment/success
PAYOS_CANCEL_URL=https://your-project.vercel.app/payment/success?cancel=true
```

Save → Service sẽ tự động redeploy

### 2. Cập nhật PayOS Dashboard
1. Đăng nhập: https://payos.vn/portal/settings
2. Cập nhật:
   - Webhook: `https://qr-service-backend.onrender.com/api/v1/payments/webhook/payos`
   - Return URL: `https://your-project.vercel.app/payment/success`

---

## ✅ BƯỚC 4: Test (2 phút)

### Test Backend
```bash
curl https://qr-service-backend.onrender.com/health
```

### Test Frontend
1. Mở: `https://your-project.vercel.app`
2. Test login
3. Test menu browsing

### Test Payment (nếu cần)
1. Tạo order
2. Proceed to payment
3. Verify PayOS redirect

---

## 🎉 Hoàn Thành!

### URLs của bạn:
```
✅ Frontend: https://your-project.vercel.app
✅ Backend:  https://qr-service-backend.onrender.com
✅ API:      https://qr-service-backend.onrender.com/api/v1
```

### Lưu lại thông tin:
1. Backend URL
2. Frontend URL
3. Production secrets (JWT_SECRET, etc.)
4. Render dashboard: https://dashboard.render.com
5. Vercel dashboard: https://vercel.com/dashboard

---

## 🔧 Troubleshooting Nhanh

### Backend không start
```bash
# Xem logs trên Render
Dashboard → Service → Logs

# Common fix: Kiểm tra PORT binding
# Đảm bảo app.listen(process.env.PORT)
```

### CORS Error
```bash
# Kiểm tra CORS_ORIGIN trong Render environment
# Phải match chính xác với Vercel URL
```

### Build Failed
```bash
# Test build local
cd frontend
npm run build

# Nếu OK, check Vercel logs
```

---

## 📞 Next Steps

1. ✅ Setup custom domain (optional)
2. ✅ Enable monitoring
3. ✅ Setup backups
4. ✅ Document cho team
5. ✅ Test thoroughly

---

**Chúc mừng! Bạn đã deploy thành công trong 15 phút! 🚀**

Đọc thêm chi tiết: [DEPLOY_VERCEL_RENDER.md](./DEPLOY_VERCEL_RENDER.md)
