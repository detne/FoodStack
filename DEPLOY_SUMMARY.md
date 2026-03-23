# 📋 Tóm Tắt Deploy - Vercel + Render + MongoDB Atlas

## 🎯 Tổng Quan

```
Frontend (React + Vite)  →  Vercel
Backend (Node.js)        →  Render  
Database                 →  MongoDB Atlas (đã có)
Redis                    →  Redis Cloud (đã có)
Storage                  →  Cloudinary (đã có)
Payment                  →  PayOS (đã có)
```

---

## ⚡ Quick Start (Copy & Paste)

### 1. Chuẩn Bị (2 phút)
```bash
# Kiểm tra
npm run deploy:check

# Tạo secrets
npm run deploy:secrets
# → Copy output và lưu lại
```

### 2. Deploy Backend - Render (5 phút)

**URL:** https://render.com

**Config:**
```
Name: qr-service-backend
Region: Singapore
Build: npm install && npm run prisma:generate
Start: npm start
```

**Environment Variables:** Copy từ `.env` + thay đổi:
```env
NODE_ENV=production
JWT_SECRET=[từ deploy:secrets]
JWT_REFRESH_TOKEN_SECRET=[từ deploy:secrets]
LOG_LEVEL=info
ENABLE_SWAGGER=false
DEBUG=false
```

**Lấy URL:** `https://qr-service-backend.onrender.com`

### 3. Deploy Frontend - Vercel (5 phút)

**URL:** https://vercel.com

**Config:**
```
Framework: Vite
Root: frontend
Build: npm run build
Output: dist
```

**Environment Variable:**
```env
VITE_API_BASE_URL=https://qr-service-backend.onrender.com/api/v1
```

**Lấy URL:** `https://your-project.vercel.app`

### 4. Cập Nhật URLs (3 phút)

**Render → Environment:**
```env
CORS_ORIGIN=https://your-project.vercel.app
FRONTEND_URL=https://your-project.vercel.app
PAYOS_RETURN_URL=https://your-project.vercel.app/payment/success
PAYOS_CANCEL_URL=https://your-project.vercel.app/payment/success?cancel=true
PAYOS_WEBHOOK_URL=https://qr-service-backend.onrender.com/api/v1/payments/webhook/payos
```

**PayOS Dashboard:** https://payos.vn/portal/settings
```
Webhook: https://qr-service-backend.onrender.com/api/v1/payments/webhook/payos
Return: https://your-project.vercel.app/payment/success
```

### 5. Test (2 phút)
```bash
# Backend
curl https://qr-service-backend.onrender.com/health

# Frontend
open https://your-project.vercel.app
```

---

## 📁 Files Tạo Sẵn

| File | Mục Đích |
|------|----------|
| `START_DEPLOYMENT.md` | 🚀 Bắt đầu từ đây |
| `QUICK_DEPLOY.md` | ⚡ Hướng dẫn 15 phút |
| `DEPLOYMENT_CHECKLIST.md` | ✅ Checklist đầy đủ |
| `DEPLOY_VERCEL_RENDER.md` | 📖 Chi tiết kỹ thuật |
| `.env.production.example` | 📝 Template production |
| `render.yaml` | ⚙️ Render config |
| `scripts/deploy-check.js` | 🔍 Pre-deploy check |
| `scripts/generate-secrets.js` | 🔐 Tạo JWT secrets |
| `scripts/test-deployment.js` | 🧪 Post-deploy test |

---

## 🛠️ Commands

```bash
# Kiểm tra trước deploy
npm run deploy:check

# Tạo production secrets
npm run deploy:secrets

# Test sau deploy
npm run deploy:test <backend-url> <frontend-url>

# Build local
npm run build
cd frontend && npm run build
```

---

## ✅ Checklist Nhanh

### Trước Deploy
- [ ] `npm run deploy:check` pass
- [ ] Đã tạo production secrets
- [ ] Code đã commit & push
- [ ] Database đã backup

### Deploy Backend (Render)
- [ ] Tạo Web Service
- [ ] Add environment variables
- [ ] Deploy thành công
- [ ] Test health endpoint

### Deploy Frontend (Vercel)
- [ ] Import project
- [ ] Add VITE_API_BASE_URL
- [ ] Deploy thành công
- [ ] Test homepage

### Cập Nhật
- [ ] Update CORS_ORIGIN trên Render
- [ ] Update PayOS webhook URL
- [ ] Test API calls
- [ ] Test payment flow

---

## 🎯 URLs Sau Deploy

```
✅ Frontend: https://your-project.vercel.app
✅ Backend:  https://qr-service-backend.onrender.com
✅ API:      https://qr-service-backend.onrender.com/api/v1
```

**Dashboards:**
- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard
- MongoDB: https://cloud.mongodb.com
- PayOS: https://payos.vn/portal

---

## 💰 Chi Phí

### Free Tier (Đủ cho testing)
- Vercel: Free
- Render: Free (sleeps sau 15 phút)
- MongoDB Atlas: Free (512MB)
- Redis Cloud: Free (30MB)
- Cloudinary: Free
- PayOS: Free

### Production (Khuyến nghị)
- Vercel Pro: $20/tháng
- Render Starter: $7/tháng (no sleep)
- MongoDB M10: ~$57/tháng
- Redis: $5/tháng

**Total:** ~$32-90/tháng

---

## 🆘 Troubleshooting

| Vấn Đề | Giải Pháp |
|--------|-----------|
| Backend không start | Check logs trên Render Dashboard |
| CORS error | Verify CORS_ORIGIN = Vercel URL |
| Database connection failed | Test connection string local |
| Build failed | Run `npm run build` local |
| Payment webhook không hoạt động | Check PayOS dashboard settings |

---

## 📞 Cần Giúp?

1. **Đọc docs:** [START_DEPLOYMENT.md](./START_DEPLOYMENT.md)
2. **Follow guide:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
3. **Check list:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. **Chi tiết:** [DEPLOY_VERCEL_RENDER.md](./DEPLOY_VERCEL_RENDER.md)

---

## 🎉 Next Steps

Sau khi deploy thành công:

1. ✅ Test tất cả features
2. ✅ Setup monitoring
3. ✅ Enable custom domain
4. ✅ Setup backups
5. ✅ Document cho team

---

**Thời gian deploy:** ~15-20 phút

**Độ khó:** ⭐⭐☆☆☆ (Dễ)

**Bắt đầu ngay:** [START_DEPLOYMENT.md](./START_DEPLOYMENT.md)

---

**Good luck! 🚀**
