# 🚀 Bắt Đầu Deploy - Đọc File Này Trước!

## 📚 Tài Liệu Deploy

Chọn hướng dẫn phù hợp với bạn:

### 1. ⚡ QUICK_DEPLOY.md (Khuyến nghị)
**Thời gian: 15 phút**
- Hướng dẫn từng bước chi tiết
- Dành cho người mới
- Copy-paste commands
- 👉 [Đọc ngay](./QUICK_DEPLOY.md)

### 2. 📋 DEPLOYMENT_CHECKLIST.md
**Checklist đầy đủ**
- Tick từng bước
- Đảm bảo không bỏ sót
- Dành cho deployment chính thức
- 👉 [Xem checklist](./DEPLOYMENT_CHECKLIST.md)

### 3. 📖 DEPLOY_VERCEL_RENDER.md
**Hướng dẫn chi tiết**
- Giải thích đầy đủ
- Troubleshooting
- Best practices
- 👉 [Đọc chi tiết](./DEPLOY_VERCEL_RENDER.md)

### 4. 📘 DEPLOYMENT_GUIDE.md
**Tổng quan tất cả platforms**
- Nhiều options: AWS, DigitalOcean, Railway...
- Dành cho advanced users
- 👉 [Xem tổng quan](./DEPLOYMENT_GUIDE.md)

---

## 🎯 Bắt Đầu Nhanh (3 Bước)

### Bước 1: Kiểm Tra
```bash
# Kiểm tra deployment readiness
npm run deploy:check

# Tạo production secrets
npm run deploy:secrets
```

### Bước 2: Deploy Backend
1. Đăng nhập https://render.com
2. New Web Service → Connect GitHub
3. Add environment variables
4. Deploy

### Bước 3: Deploy Frontend
1. Đăng nhập https://vercel.com
2. Import Project → Connect GitHub
3. Add environment variable: `VITE_API_BASE_URL`
4. Deploy

---

## 📦 Files Đã Tạo

```
├── QUICK_DEPLOY.md              # ⚡ Bắt đầu từ đây
├── DEPLOYMENT_CHECKLIST.md      # ✅ Checklist đầy đủ
├── DEPLOY_VERCEL_RENDER.md      # 📖 Chi tiết Vercel + Render
├── DEPLOYMENT_GUIDE.md          # 📘 Tổng quan tất cả platforms
├── .env.production.example      # Template production env
├── frontend/.env.production     # Frontend production env
├── render.yaml                  # Render config
└── scripts/
    ├── deploy-check.js          # Kiểm tra trước deploy
    ├── generate-secrets.js      # Tạo JWT secrets
    └── test-deployment.js       # Test sau deploy
```

---

## 🛠️ Commands Hữu Ích

```bash
# Kiểm tra deployment readiness
npm run deploy:check

# Tạo production secrets (JWT, session)
npm run deploy:secrets

# Test deployment
npm run deploy:test https://your-backend.onrender.com https://your-frontend.vercel.app

# Build local để test
npm run build
cd frontend && npm run build
```

---

## 🎯 Stack Deployment

| Component | Platform | Free Tier | Docs |
|-----------|----------|-----------|------|
| Frontend | Vercel | ✅ Yes | [Link](https://vercel.com/docs) |
| Backend | Render | ✅ Yes* | [Link](https://render.com/docs) |
| Database | MongoDB Atlas | ✅ Yes | [Link](https://docs.atlas.mongodb.com) |
| Redis | Redis Cloud | ✅ Yes | [Link](https://redis.io/docs) |
| Storage | Cloudinary | ✅ Yes | [Link](https://cloudinary.com/documentation) |
| Payment | PayOS | ✅ Yes | [Link](https://payos.vn/docs) |

*Render free tier sleeps sau 15 phút không hoạt động

---

## ⚠️ Quan Trọng

### Trước Khi Deploy
1. ✅ Backup database
2. ✅ Test local thành công
3. ✅ Commit & push code
4. ✅ Tạo production secrets mới

### Trong Production
1. ⚠️ KHÔNG dùng JWT secrets mặc định
2. ⚠️ KHÔNG enable Swagger trong production
3. ⚠️ KHÔNG commit secrets vào Git
4. ⚠️ KHÔNG dùng CORS wildcard `*`

---

## 🆘 Cần Giúp Đỡ?

### Lỗi Thường Gặp

**Backend không start**
```bash
# Xem logs trên Render
Dashboard → Service → Logs
```

**CORS Error**
```bash
# Kiểm tra CORS_ORIGIN trong backend env
# Phải match chính xác với Vercel URL
```

**Database connection failed**
```bash
# Test connection string
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK'))"
```

### Tài Liệu
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

---

## 📞 Timeline

| Bước | Thời Gian | Mô Tả |
|------|-----------|-------|
| 1. Chuẩn bị | 5 phút | Check & generate secrets |
| 2. Deploy Backend | 5 phút | Render setup & deploy |
| 3. Deploy Frontend | 5 phút | Vercel setup & deploy |
| 4. Cập nhật URLs | 3 phút | Update CORS & PayOS |
| 5. Testing | 2 phút | Verify deployment |
| **Total** | **~20 phút** | |

---

## 🎉 Sau Khi Deploy

### Lưu Lại
- [ ] Backend URL
- [ ] Frontend URL
- [ ] Production secrets
- [ ] Dashboard logins

### Monitoring
- [ ] Check logs hàng ngày
- [ ] Monitor error rates
- [ ] Track performance

### Next Steps
- [ ] Setup custom domain
- [ ] Enable monitoring
- [ ] Setup backups
- [ ] Document cho team

---

## 🚀 Sẵn Sàng?

**Bắt đầu ngay:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

**Hoặc xem checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**Good luck! 🍀**
