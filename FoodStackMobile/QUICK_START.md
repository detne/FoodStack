# Quick Start Guide - Expo Go SDK 54

## 🚀 Setup (one time only)

### Option 1: Auto Setup (Recommended)
```bash
cd FoodStackMobile
npm run fix:sdk54
npm run setup:sdk54
```

### Option 2: Manual Setup
```bash
cd FoodStackMobile
rm -rf node_modules package-lock.json
npm install
```

## 📱 Update IP Address

1. Find your computer's IP address:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **macOS**: `ifconfig en0 | grep inet`
   - **Linux**: `ip addr show`

2. Edit `src/services/api-config.ts`:
```typescript
const PHYSICAL_DEVICE_URL = 'http://YOUR_IP:3000/api/v1';
```

Example:
```typescript
const PHYSICAL_DEVICE_URL = 'http://192.168.1.100:3000/api/v1';
```

## 🖥️ Start Backend Server

In the root directory (not FoodStackMobile):
```bash
npm run dev
```

Server will run at: `http://localhost:3000`

## 📱 Start Expo Development Server

In FoodStackMobile directory:
```bash
npm start
```

## 📲 Connect with Expo Go

1. **Install Expo Go** on your phone:
   - Android: Google Play Store
   - iOS: App Store

2. **Ensure same WiFi network**:
   - Phone and computer must be on same WiFi
   - Turn off VPN if enabled

3. **Scan QR Code**:
   - Open Expo Go app
   - Scan QR code from terminal/browser
   - Wait for app to load

## 🧪 Test the App

### Test API Connection:
1. Open app on phone
2. Go to Login screen
3. Tap "🔧 Test API Connection" button
4. Run tests to verify connection

### Test Login:
**Mock Accounts:**
- Email: `customer@test.com`
- Password: `password123`

**Or create new account:**
- Tap "Đăng ký ngay"
- Choose "Đối tác nhà hàng"
- Fill in details

## 🔧 Troubleshooting

### "Network response timed out"
- ✅ Check IP address in `api-config.ts`
- ✅ Ensure backend server is running
- ✅ Check firewall settings (allow port 3000)

### "Unable to resolve host"
- ✅ Verify same WiFi network
- ✅ Try restarting WiFi router
- ✅ Test IP with browser: `http://YOUR_IP:3000`

### "Expo Go can't connect"
- ✅ Restart Expo server: `npm start`
- ✅ Clear cache: `expo start -c`
- ✅ Restart Expo Go app

### "Module not found" errors
- ✅ Run: `npm run reset`
- ✅ Check Node.js version (>= 18)
- ✅ Update Expo CLI: `npm install -g @expo/cli`

## 📋 Useful Commands

```bash
# Check compatibility
npm run check:compatibility

# Clean install
npm run reset

# Start with cache cleared
expo start -c

# View logs
expo start --dev-client
```

## 🎯 Development Tips

1. **Live Reload**: Changes auto-reload the app
2. **Developer Menu**: Shake phone to open menu
3. **Debug**: Enable "Debug Remote JS" in dev menu
4. **Logs**: Check terminal for error messages

## 📚 Next Steps

After successful setup:
1. ✅ Test login/register functionality
2. ✅ Test QR code scanning
3. ✅ Explore menu and ordering features
4. ✅ Test on both Android and iOS

## 🆘 Need Help?

1. Check `EXPO_GO_SETUP.md` for detailed instructions
2. Run `npm run check:compatibility` to diagnose issues
3. Ensure all prerequisites are met:
   - Node.js >= 18
   - Expo CLI installed
   - Backend server running
   - Same WiFi network

## 🎉 Success Indicators

✅ Backend server running on port 3000
✅ Expo QR code displayed in terminal
✅ App loads in Expo Go without errors
✅ API test connection succeeds
✅ Login works with test account

Happy coding with SDK 54! 🚀