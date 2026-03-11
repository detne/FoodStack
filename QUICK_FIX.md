# Quick Fix - Prisma "prepared statement already exists"

## 🔴 Problem
```
prepared statement "s0" already exists
PostgresError { code: "42P05" }
```

## ✅ Solution

### Method 1: Use Restart Script (Easiest)

**Windows:**
```bash
.\restart-backend.bat
```

This will:
1. Kill all Node processes
2. Clean Prisma cache
3. Regenerate Prisma client
4. Start backend

### Method 2: Manual Steps

**Step 1: Stop all Node processes**
```bash
# Windows PowerShell
taskkill /F /IM node.exe

# Or press Ctrl+C in terminal
```

**Step 2: Wait 3 seconds**
```bash
# Let Windows release file locks
```

**Step 3: Start backend**
```bash
npm run dev
```

### Method 3: If Still Fails

**Close ALL applications that might lock files:**
- VS Code
- Other IDEs
- File Explorer windows in project folder
- Antivirus real-time scanning (temporarily)

**Then:**
```bash
# Delete node_modules\.prisma manually
# Restart computer if needed
npm run dev
```

## 🧪 Test After Restart

```bash
# Test backend health
curl http://localhost:3000/health

# Test login
node test-login.js test@example.com password123
```

## 💡 Why This Happens

1. **Prisma caches prepared statements** for performance
2. **When code changes**, cache becomes invalid
3. **Windows file locks** prevent automatic cleanup
4. **Solution**: Restart backend to clear cache

## 🚀 Prevention

**Always restart backend after:**
- Changing Prisma schema
- Modifying repository files
- Updating database queries
- Changing environment variables

**Use nodemon for auto-restart:**
```json
// package.json
"scripts": {
  "dev": "nodemon src/server.js"
}
```

## 📝 Current Fix Applied

The code now includes **automatic retry** with reconnection:
- If Prisma error occurs
- Disconnect and reconnect
- Retry query once
- This helps but **restart is still recommended**

## ✅ Checklist

- [ ] All Node processes stopped
- [ ] Waited 3 seconds
- [ ] Started backend with `npm run dev`
- [ ] Tested with `curl http://localhost:3000/health`
- [ ] Tested login with `node test-login.js`
- [ ] Frontend can connect

## 🆘 Still Not Working?

1. **Restart computer** (releases all file locks)
2. **Check antivirus** (may be blocking file operations)
3. **Run as Administrator** (if permission issues)
4. **Delete and reinstall:**
```bash
rm -rf node_modules
npm install
npm run dev
```

---

**Last Updated:** 2024
**Status:** Active Issue - Requires Manual Restart
