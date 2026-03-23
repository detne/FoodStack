# ✅ Deployment Checklist

## 📋 Trước Khi Deploy

### Chuẩn Bị
- [ ] Đã test local thành công
- [ ] Đã commit tất cả changes
- [ ] Đã push lên GitHub
- [ ] Đã backup database

### Kiểm Tra Kỹ Thuật
```bash
# Chạy deployment check
npm run deploy:check

# Tạo production secrets
npm run deploy:secrets
# Lưu output vào file an toàn
```

### Tài Khoản
- [ ] Tài khoản GitHub
- [ ] Tài khoản Vercel
- [ ] Tài khoản Render
- [ ] MongoDB Atlas (đã có)
- [ ] Redis Cloud (đã có)
- [ ] Cloudinary (đã có)
- [ ] PayOS (đã có)

---

## 🚀 Deploy Backend (Render)

### Setup
- [ ] Đăng nhập Render.com
- [ ] Connect GitHub repository
- [ ] Tạo Web Service mới

### Configuration
- [ ] Name: `qr-service-backend`
- [ ] Region: Singapore
- [ ] Branch: `main`
- [ ] Build Command: `npm install && npm run prisma:generate`
- [ ] Start Command: `npm start`
- [ ] Instance Type: Free (hoặc Starter $7/month)

### Environment Variables
Copy từ `.env` và cập nhật:

#### Bắt Buộc Thay Đổi
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=[từ deploy:secrets]`
- [ ] `JWT_REFRESH_TOKEN_SECRET=[từ deploy:secrets]`
- [ ] `SESSION_SECRET=[từ deploy:secrets]`
- [ ] `LOG_LEVEL=info`
- [ ] `ENABLE_SWAGGER=false`
- [ ] `DEBUG=false`

#### Giữ Nguyên
- [ ] `DATABASE_URL`
- [ ] `MONGODB_URI`
- [ ] `REDIS_HOST`
- [ ] `REDIS_PORT`
- [ ] `REDIS_PASSWORD`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `PAYOS_CLIENT_ID`
- [ ] `PAYOS_API_KEY`
- [ ] `PAYOS_CHECKSUM_KEY`

#### Cập Nhật Sau
- [ ] `CORS_ORIGIN` (sau khi có Vercel URL)
- [ ] `FRONTEND_URL` (sau khi có Vercel URL)
- [ ] `PAYOS_RETURN_URL` (sau khi có Vercel URL)
- [ ] `PAYOS_CANCEL_URL` (sau khi có Vercel URL)
- [ ] `PAYOS_WEBHOOK_URL` (dùng Render URL)

### Deploy
- [ ] Click "Create Web Service"
- [ ] Đợi build & deploy (3-5 phút)
- [ ] Lưu Backend URL: `https://qr-service-backend.onrender.com`

### Test Backend
```bash
curl https://qr-service-backend.onrender.com/health
```
- [ ] Health check trả về status OK
- [ ] MongoDB connected
- [ ] Redis connected

---

## 🎨 Deploy Frontend (Vercel)

### Setup
- [ ] Đăng nhập Vercel.com
- [ ] Import GitHub repository
- [ ] Chọn project

### Configuration
- [ ] Framework: Vite
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Environment Variables
- [ ] `VITE_API_BASE_URL=https://qr-service-backend.onrender.com/api/v1`

### Deploy
- [ ] Click "Deploy"
- [ ] Đợi build & deploy (2-3 phút)
- [ ] Lưu Frontend URL: `https://your-project.vercel.app`

### Test Frontend
- [ ] Mở browser: `https://your-project.vercel.app`
- [ ] Trang load thành công
- [ ] Không có console errors

---

## 🔄 Cập Nhật URLs

### Backend Environment (Render)
Vào Render → Service → Environment, cập nhật:
- [ ] `CORS_ORIGIN=https://your-project.vercel.app`
- [ ] `FRONTEND_URL=https://your-project.vercel.app`
- [ ] `PAYOS_RETURN_URL=https://your-project.vercel.app/payment/success`
- [ ] `PAYOS_CANCEL_URL=https://your-project.vercel.app/payment/success?cancel=true`
- [ ] Save Changes (service sẽ tự động redeploy)

### PayOS Dashboard
Đăng nhập https://payos.vn/portal/settings:
- [ ] Webhook URL: `https://qr-service-backend.onrender.com/api/v1/payments/webhook/payos`
- [ ] Return URL: `https://your-project.vercel.app/payment/success`
- [ ] Cancel URL: `https://your-project.vercel.app/payment/success?cancel=true`
- [ ] Save

---

## ✅ Testing

### Backend Tests
```bash
# Health check
curl https://qr-service-backend.onrender.com/health

# API root
curl https://qr-service-backend.onrender.com/api/v1
```

- [ ] Health endpoint OK
- [ ] API responds
- [ ] Database connected
- [ ] Redis connected

### Frontend Tests
- [ ] Homepage loads
- [ ] Login page accessible
- [ ] API calls work
- [ ] No CORS errors
- [ ] Images load (Cloudinary)

### Integration Tests
- [ ] User registration
- [ ] User login
- [ ] JWT token works
- [ ] Menu browsing
- [ ] Order creation
- [ ] Payment flow (PayOS)
- [ ] Webhook callback

---

## 📊 Monitoring Setup

### Render
- [ ] Enable email notifications
- [ ] Check metrics dashboard
- [ ] Setup uptime monitoring

### Vercel
- [ ] Enable Web Analytics
- [ ] Check deployment logs
- [ ] Monitor performance

### External
- [ ] Setup UptimeRobot (optional)
- [ ] Setup Sentry error tracking (optional)

---

## 🔒 Security

### Secrets
- [ ] JWT secrets đã thay đổi
- [ ] Secrets được lưu an toàn
- [ ] Không commit secrets vào Git

### CORS
- [ ] CORS_ORIGIN chỉ cho phép frontend domain
- [ ] Không dùng wildcard `*` trong production

### API
- [ ] Rate limiting enabled
- [ ] Helmet security headers
- [ ] HTTPS enforced

---

## 📝 Documentation

### URLs
Lưu lại các URLs:
```
Frontend: https://your-project.vercel.app
Backend:  https://qr-service-backend.onrender.com
API:      https://qr-service-backend.onrender.com/api/v1
```

### Dashboards
- [ ] Render: https://dashboard.render.com
- [ ] Vercel: https://vercel.com/dashboard
- [ ] MongoDB Atlas: https://cloud.mongodb.com
- [ ] Redis Cloud: https://app.redislabs.com
- [ ] PayOS: https://payos.vn/portal

### Credentials
Lưu an toàn:
- [ ] Production JWT secrets
- [ ] Database credentials
- [ ] API keys
- [ ] Dashboard logins

---

## 🎉 Post-Deployment

### Team
- [ ] Share URLs với team
- [ ] Document deployment process
- [ ] Train team on monitoring

### Monitoring
- [ ] Check logs daily
- [ ] Monitor error rates
- [ ] Track performance metrics

### Maintenance
- [ ] Setup backup schedule
- [ ] Plan for scaling
- [ ] Document troubleshooting

---

## 🆘 Rollback Plan

Nếu có vấn đề:

### Render
1. Vào Dashboard → Service
2. Click "Manual Deploy"
3. Chọn commit trước đó
4. Deploy

### Vercel
1. Vào Dashboard → Deployments
2. Chọn deployment trước đó
3. Click "Promote to Production"

### Database
1. Restore từ backup
2. Verify data integrity

---

## 📞 Support Contacts

- Render Support: https://render.com/docs
- Vercel Support: https://vercel.com/support
- MongoDB Support: https://www.mongodb.com/support
- PayOS Support: https://payos.vn/support

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Backend URL**: _____________

**Frontend URL**: _____________

**Notes**: _____________

---

✅ **Deployment Complete!**
