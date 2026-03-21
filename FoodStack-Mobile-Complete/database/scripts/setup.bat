@echo off
REM =====================================================
REM QR Service Platform - Database Setup Script (Windows)
REM Description: Automated setup for PostgreSQL & MongoDB
REM Usage: database\scripts\setup.bat
REM =====================================================

echo.
echo ========================================
echo QR Service Platform - Database Setup
echo ========================================
echo.

set DB_NAME=qr_service_platform
set POSTGRES_USER=postgres

REM =====================================================
REM 1. PostgreSQL Setup
REM =====================================================

echo [1/2] Setting up PostgreSQL...
echo.

REM Check if PostgreSQL is running
pg_isready -q
if errorlevel 1 (
    echo [ERROR] PostgreSQL is not running!
    echo Please start PostgreSQL and try again.
    pause
    exit /b 1
)

echo [OK] PostgreSQL is running
echo.

REM Create database
echo Creating database '%DB_NAME%'...
psql -U %POSTGRES_USER% -c "DROP DATABASE IF EXISTS %DB_NAME%;"
psql -U %POSTGRES_USER% -c "CREATE DATABASE %DB_NAME%;"

if errorlevel 1 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)

echo [OK] Database created
echo.

REM Run migrations
echo Running PostgreSQL migrations...
echo.

echo   - Running 001_initial_schema.sql...
psql -U %POSTGRES_USER% -d %DB_NAME% -f database\migrations\postgresql\001_initial_schema.sql > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to run 001_initial_schema.sql
    pause
    exit /b 1
)
echo   [OK] Schema created

echo   - Running 002_triggers_and_functions.sql...
psql -U %POSTGRES_USER% -d %DB_NAME% -f database\migrations\postgresql\002_triggers_and_functions.sql > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to run 002_triggers_and_functions.sql
    pause
    exit /b 1
)
echo   [OK] Triggers and functions created

echo   - Running 003_indexes_optimization.sql...
psql -U %POSTGRES_USER% -d %DB_NAME% -f database\migrations\postgresql\003_indexes_optimization.sql > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to run 003_indexes_optimization.sql
    pause
    exit /b 1
)
echo   [OK] Indexes optimized

echo.
echo [OK] PostgreSQL setup complete!
echo.

REM =====================================================
REM 2. MongoDB Setup
REM =====================================================

echo [2/2] Setting up MongoDB...
echo.

REM Check if MongoDB is running
mongosh --quiet --eval "db.adminCommand('ping')" > nul 2>&1
if errorlevel 1 (
    echo [ERROR] MongoDB is not running!
    echo Please start MongoDB and try again.
    pause
    exit /b 1
)

echo [OK] MongoDB is running
echo.

REM Run MongoDB migrations
echo Running MongoDB migrations...
mongosh --quiet < database\migrations\mongodb\001_collections_setup.js

if errorlevel 1 (
    echo [ERROR] Failed to run MongoDB migrations
    pause
    exit /b 1
)

echo [OK] MongoDB setup complete!
echo.

REM =====================================================
REM 3. Summary
REM =====================================================

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo PostgreSQL:
echo   Database: %DB_NAME%
echo   Connection: postgresql://%POSTGRES_USER%@localhost:5432/%DB_NAME%
echo.
echo MongoDB:
echo   Database: %DB_NAME%
echo   Connection: mongodb://localhost:27017/%DB_NAME%
echo.
echo ========================================
echo.
echo Next steps:
echo 1. Update your .env file with database credentials
echo 2. Run: npm install
echo 3. Run: npm run dev
echo.
pause
