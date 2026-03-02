# 🪟 Windows Setup Guide

**Hướng dẫn setup project trên Windows**

---

## ⚠️ LỖI THƯỜNG GẶP

### Lỗi 1: `bcrypt` không compile được

```
gyp ERR! find Python
gyp ERR! Could not find any Python installation to use
```

**Nguyên nhân:** Package `bcrypt` cần Python và build tools để compile trên Windows.

**✅ Giải pháp:** Project đã chuyển sang dùng `bcryptjs` (pure JavaScript, không cần compile)

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Bước 1: Kiểm tra Node.js version

```bash
node --version
# Cần >= 20.0.0
```

Nếu chưa có hoặc version cũ, download tại: https://nodejs.org/

### Bước 2: Clone project

```bash
git clone https://github.com/detne/FoodStack.git
cd FoodStack
```

### Bước 3: Xóa node_modules cũ (nếu có)

```bash
# PowerShell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# hoặc CMD
rmdir /s /q node_modules
del package-lock.json
```

### Bước 4: Install dependencies

```bash
npm install
```

**Lưu ý:** Nếu vẫn gặp lỗi với package nào đó, thử:

```bash
npm install --legacy-peer-deps
```

### Bước 5: Copy .env file

```bash
# PowerShell
Copy-Item .env.example .env

# hoặc CMD
copy .env.example .env
```

Sau đó edit file `.env` với thông tin của bạn.

### Bước 6: Setup database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed data (optional)
npm run db:seed
```

### Bước 7: Start development server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

---

## 🔧 TROUBLESHOOTING

### Lỗi: `ENOTFOUND github.com`

**Nguyên nhân:** Không kết nối được internet hoặc bị chặn firewall.

**Giải pháp:**
1. Kiểm tra kết nối internet
2. Tắt VPN/Proxy
3. Thử lại sau vài phút

### Lỗi: `EPERM: operation not permitted`

**Nguyên nhân:** File đang được sử dụng bởi process khác.

**Giải pháp:**
1. Đóng tất cả terminal/IDE
2. Tắt antivirus tạm thời
3. Chạy terminal với quyền Administrator
4. Xóa `node_modules` và install lại

### Lỗi: `prisma command not found`

**Giải pháp:**

```bash
# Install Prisma globally
npm install -g prisma

# Hoặc dùng npx
npx prisma generate
```

### Lỗi: Deprecated packages warnings

**Warnings như:**
- `deprecated inflight@1.0.6`
- `deprecated glob@7.2.3`
- `deprecated eslint@8.57.1`

**Giải pháp:** Đây chỉ là warnings, không ảnh hưởng chức năng. Có thể ignore hoặc update sau:

```bash
npm update
```

---

## 🐍 NẾU MUỐN DÙNG `bcrypt` THAY VÌ `bcryptjs`

### Cài đặt Python và Build Tools

#### Option 1: Dùng windows-build-tools (Khuyến nghị)

```bash
# Chạy PowerShell với quyền Administrator
npm install --global windows-build-tools
```

#### Option 2: Cài đặt thủ công

1. **Cài Python 3.11+**
   - Download: https://www.python.org/downloads/
   - ✅ Check "Add Python to PATH"

2. **Cài Visual Studio Build Tools**
   - Download: https://visualstudio.microsoft.com/downloads/
   - Chọn "Desktop development with C++"

3. **Verify installation**

```bash
python --version
# Python 3.11.x

npm config get python
# C:\Python311\python.exe
```

4. **Install bcrypt**

```bash
npm install bcrypt
```

---

## 📦 PACKAGE ALTERNATIVES

Nếu gặp vấn đề với package nào, có thể thay thế:

| Package gốc | Alternative | Lý do |
|------------|-------------|-------|
| `bcrypt` | `bcryptjs` | Không cần compile |
| `node-gyp` | Pure JS packages | Tránh build errors |
| `sharp` | `jimp` | Image processing |

---

## 🎯 CHECKLIST SAU KHI SETUP

- [ ] `node --version` >= 20.0.0
- [ ] `npm install` thành công
- [ ] File `.env` đã được tạo và config
- [ ] `npx prisma generate` thành công
- [ ] `npm run dev` chạy được
- [ ] Truy cập `http://localhost:3000` OK

---

## 💡 TIPS

### 1. Dùng nvm-windows để quản lý Node.js versions

Download: https://github.com/coreybutler/nvm-windows

```bash
# Install Node.js 20
nvm install 20

# Use Node.js 20
nvm use 20
```

### 2. Dùng Git Bash thay vì CMD

Git Bash có nhiều command giống Linux, dễ dùng hơn.

### 3. Config npm để tránh lỗi

```bash
# Set registry (nếu bị chặn)
npm config set registry https://registry.npmjs.org/

# Increase timeout
npm config set fetch-timeout 60000

# Ignore scripts (nếu cần)
npm install --ignore-scripts
```

### 4. Clear npm cache nếu gặp lỗi lạ

```bash
npm cache clean --force
```

---

## 📞 HỖ TRỢ

Nếu vẫn gặp vấn đề:

1. Check [GitHub Issues](https://github.com/detne/FoodStack/issues)
2. Hỏi trên Slack channel #foodstack-dev
3. Liên hệ team lead

---

**Happy Coding! 🚀**
