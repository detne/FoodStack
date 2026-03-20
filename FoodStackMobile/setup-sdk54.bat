@echo off
echo Setting up FoodStack Mobile with Expo SDK 50 (compatible with SDK 54)...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Make sure you're in the FoodStackMobile directory.
    pause
    exit /b 1
)

REM Remove node_modules and package-lock.json
echo Cleaning up old dependencies...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json
if exist "yarn.lock" del yarn.lock

REM Install dependencies
echo Installing dependencies for SDK 50 (SDK 54 compatible)...
npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.
echo Next steps:
echo 1. Update your computer's IP address in src/services/api-config.ts
echo 2. Start the backend server: npm run dev (in the root directory)
echo 3. Start Expo: npm start
echo 4. Scan QR code with Expo Go app on your phone (SDK 54 compatible)
echo.
pause