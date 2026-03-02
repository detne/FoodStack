# 🚀 Quick Start Guide - FoodStack Backend

## ✅ Bạn đã hoàn thành:
- ✅ Clone repository từ GitHub
- ✅ Cài đặt dependencies (`npm install`)
- ✅ Tạo file `.env` cơ bản

## 📋 Các bước tiếp theo:

### 1. Setup Database (PostgreSQL)

Bạn có 2 lựa chọn:

#### Option A: Sử dụng Supabase (Khuyến nghị - Miễn phí)

1. Truy cập https://supabase.com
2. Tạo tài khoản và project mới
3. Vào **Settings** → **Database**
4. Copy **Connection string** (URI)
5. Paste vào file `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
   ```

#### Option B: Cài đặt PostgreSQL Local

1. Download PostgreSQL: https://www.postgresql.org/download/
2. Cài đặt với password: `postgres`
3. Tạo database:
   ```bash
   psql -U postgres
   CREATE DATABASE foodstack;
   \q
   ```
4. File `.env` đã có sẵn config cho local

### 2. Chạy Prisma Migrations

```bash
cd FoodStack-new
npx prisma generate
npx prisma migrate dev
```

Lệnh này sẽ:
- Generate Prisma Client
- Tạo tables trong database
- Seed dữ liệu mẫu (nếu có)

### 3. Khởi động Backend Server

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

### 4. Test API

Mở browser hoặc Postman:
- **Health Check**: http://localhost:3000/health
- **API Docs (Swagger)**: http://localhost:3000/api-docs

### 5. (Optional) Setup MongoDB & Redis

Nếu bạn muốn đầy đủ tính năng:

**MongoDB Atlas (Free):**
1. https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Copy connection string vào `.env`

**Redis Cloud (Free):**
1. https://redis.com/try-free
2. Tạo database miễn phí
3. Copy connection string vào `.env`

## 🎯 Các API Endpoints chính:

### Authentication
- `POST /api/v1/auth/register` - Đăng ký restaurant
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh` - Refresh token

### Restaurants
- `GET /api/v1/restaurants` - Danh sách restaurants
- `POST /api/v1/restaurants` - Tạo restaurant mới
- `GET /api/v1/restaurants/:id` - Chi tiết restaurant

### Branches
- `GET /api/v1/branches` - Danh sách chi nhánh
- `POST /api/v1/branches` - Tạo chi nhánh mới

### Menu
- `GET /api/v1/menu/categories` - Danh mục món ăn
- `GET /api/v1/menu/items` - Danh sách món ăn
- `POST /api/v1/menu/items` - Tạo món ăn mới

## 🔧 Troubleshooting

### Lỗi: "Cannot connect to database"
- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo PostgreSQL đang chạy
- Test connection: `npx prisma db push`

### Lỗi: "Port 3000 already in use"
- Đổi port trong `.env`: `PORT=3001`
- Hoặc kill process: `npx kill-port 3000`

### Lỗi: "Prisma Client not generated"
- Chạy: `npx prisma generate`

## 📚 Tài liệu tham khảo:

- **README.md** - Tổng quan dự án
- **SETUP-COMPLETE-GUIDE.md** - Hướng dẫn chi tiết
- **SPRINT1-AUTH-CODE-STRUCTURE.md** - Cấu trúc code Sprint 1
- **DATABASE-SCHEMA.md** - Schema database

## 🎉 Bước tiếp theo:

1. Đọc **SPRINT1-AUTH-CODE-STRUCTURE.md** để hiểu cấu trúc code
2. Test các API endpoints với Postman
3. Xem Prisma Studio: `npx prisma studio`
4. Bắt đầu code tính năng mới!

## 💡 Tips:

- Sử dụng **Prisma Studio** để xem database: `npx prisma studio`
- Xem logs realtime: `npm run dev` (đã có nodemon)
- Format code: `npm run format`
- Lint code: `npm run lint`

---

**Happy Coding! 🚀**
