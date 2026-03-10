@echo off
echo ========================================
echo Starting FoodStack Frontend
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)

echo.
echo Checking .env file...
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo.
echo Starting frontend on http://localhost:5173
echo Press Ctrl+C to stop
echo.

npm run dev
