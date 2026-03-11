# 🔴 FINAL FIX - Prisma "prepared statement already exists"

## ⚠️ Vấn đề

Lỗi này xảy ra do:
1. Windows file locks không cho phép xóa Prisma cache
2. Prisma DLL files bị lock bởi Node process
3. Multiple Node instances đang chạy

## ✅ GIẢI PHÁP CUỐI CÙNG

### Option 1: RESTART MÁY TÍNH (Khuyến nghị)

**Đây là cách CHẮC CHẮN NHẤT:**

1. Save tất cả files
2. Close VS Code hoàn toàn
3. Restart máy tính
4. Mở project lại
5. Chạy: `npm run dev`

✅ **Lý do:** Restart giải phóng TẤT CẢ file locks

---

### Option 2: Force Clean Script

**Nếu không muốn restart máy:**

1. **ĐÓNG VS CODE HOÀN TOÀN**
2. Mở PowerShell/CMD **AS ADMINISTRATOR**
3. Navigate to project:
```bash
cd D:\SP26\SDN302\FoodStack
```
4. Chạy script:
```bash
.\force-clean-restart.bat
```

---

### Option 3: Manual Steps

**Làm từng bước:**

1. **Close VS Code**
2. **Open Task Manager** (Ctrl+Shift+Esc)
3. **End ALL Node.js processes**
4. **Wait 10 seconds**
5. **Open PowerShell AS ADMIN**
6. **Run:**
```powershell
cd D:\SP26\SDN302\FoodStack

# Kill any remaining Node
taskkill /F /IM node.exe

# Wait
Start-Sleep -Seconds 5

# Try to delete Prisma cache
Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue

# Regenerate
npx prisma generate

# Start
npm run dev
```

---

### Option 4: Nuclear Option

**Nếu tất cả đều fail:**

```bash
# 1. Backup .env file
copy .env .env.backup

# 2. Delete node_modules
rmdir /s /q node_modules

# 3. Clean npm cache
npm cache clean --force

# 4. Reinstall
npm install

# 5. Generate Prisma
npx prisma generate

# 6. Start
npm run dev
```

---

## 🎯 PREVENTION - Ngăn chặn lỗi này

### Sử dụng Nodemon

1. **Install:**
```bash
npm install -D nodemon
```

2. **Update package.json:**
```json
{
  "scripts": {
    "dev": "nodemon --exec node src/server.js",
    "start": "node src/server.js"
  }
}
```

3. **Create nodemon.json:**
```json
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["*.test.js"],
  "delay": "1000"
}
```

### Hoặc dùng PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name foodstack

# Restart when needed
pm2 restart foodstack

# View logs
pm2 logs foodstack
```

---

## 🔍 Kiểm tra sau khi fix

```bash
# 1. Test health
curl http://localhost:3000/health

# 2. Test register
node test-login.js test@example.com password123

# 3. Check processes
Get-Process -Name node
```

---

## 💡 Tại sao lỗi này khó fix?

1. **Windows File Locking:**
   - Windows locks DLL files khi đang sử dụng
   - Không thể xóa file đang được process sử dụng

2. **Prisma Architecture:**
   - Prisma sử dụng native binary (DLL)
   - Binary được load vào memory
   - Không thể unload cho đến khi process kết thúc

3. **Node.js Process:**
   - Node giữ reference đến Prisma client
   - Prisma client giữ reference đến binary
   - Binary lock file trên disk

---

## 🚀 RECOMMENDED WORKFLOW

**Để tránh lỗi này trong tương lai:**

1. **Luôn dùng Nodemon** - Auto restart khi code thay đổi
2. **Hoặc dùng PM2** - Process manager tốt hơn
3. **Restart backend** sau mỗi lần sửa repository code
4. **Đóng VS Code** trước khi restart nếu có vấn đề
5. **Restart máy** 1 lần/ngày khi develop

---

## ⚡ QUICK COMMANDS

```bash
# Kill all Node
taskkill /F /IM node.exe

# Clean and restart
.\force-clean-restart.bat

# Check if backend is running
curl http://localhost:3000/health

# View Node processes
Get-Process -Name node
```

---

## 📞 Nếu vẫn không work

1. ✅ Restart máy tính
2. ✅ Disable antivirus temporarily
3. ✅ Run as Administrator
4. ✅ Check Windows Defender isn't scanning project folder
5. ✅ Move project to different drive (if on external drive)

---

## 🎯 TÓM TẮT

**Cách nhanh nhất:**
1. Close VS Code
2. Restart máy
3. `npm run dev`

**Cách không cần restart:**
1. Close VS Code
2. Kill all Node processes
3. Run `.\force-clean-restart.bat`

**Cách lâu dài:**
- Dùng Nodemon hoặc PM2
- Restart backend sau mỗi code change

---

**Last Updated:** 2024  
**Status:** Known Issue - Requires Manual Intervention
