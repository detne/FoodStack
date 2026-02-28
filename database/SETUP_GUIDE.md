# 🚀 Database Setup Guide

## Tổng quan

Dự án sử dụng **Polyglot Persistence**:
- **PostgreSQL**: Dữ liệu cốt lõi (ACID transactions)
- **MongoDB**: Logs, events, analytics

---

## 📊 PostgreSQL Setup

### Bước 1: Tạo Database

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE qr_service_platform;

# Thoát
\q
```

### Bước 2: Chạy Schema

```bash
# Windows
psql -U postgres -d qr_service_platform -f database/schema_complete.sql

# Linux/Mac
psql -U postgres -d qr_service_platform < database/schema_complete.sql
```

### Bước 3: Verify

```bash
psql -U postgres -d qr_service_platform
```

```sql
-- Kiểm tra tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Kiểm tra số lượng
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Kết quả mong đợi: ~25 tables
```

---

## 🍃 MongoDB Setup

### Bước 1: Kết nối MongoDB

```bash
mongosh
```

### Bước 2: Chạy Schema

```bash
# Trong mongosh
load("database/mongodb_complete.js")

# Hoặc từ terminal
mongosh < database/mongodb_complete.js
```

### Bước 3: Verify

```javascript
// Trong mongosh
use qr_service_platform

// Kiểm tra collections
db.getCollectionNames()

// Kiểm tra indexes của một collection
db.order_events.getIndexes()

// Kết quả mong đợi: 10 collections
```

---

## 🔧 Quick Setup Script

### Windows

```batch
@echo off
echo Setting up PostgreSQL...
psql -U postgres -c "DROP DATABASE IF EXISTS qr_service_platform;"
psql -U postgres -c "CREATE DATABASE qr_service_platform;"
psql -U postgres -d qr_service_platform -f database/schema_complete.sql

echo Setting up MongoDB...
mongosh < database/mongodb_complete.js

echo Done!
pause
```

### Linux/Mac

```bash
#!/bin/bash

echo "Setting up PostgreSQL..."
psql -U postgres -c "DROP DATABASE IF EXISTS qr_service_platform;"
psql -U postgres -c "CREATE DATABASE qr_service_platform;"
psql -U postgres -d qr_service_platform < database/schema_complete.sql

echo "Setting up MongoDB..."
mongosh < database/mongodb_complete.js

echo "Done!"
```

---

## 📝 Seed Data (Optional)

Nếu muốn có dữ liệu mẫu để test:

```bash
psql -U postgres -d qr_service_platform -f database/scripts/seed.sql
```

---

## 🔍 Kiểm tra kết nối

### PostgreSQL

```javascript
// Node.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'qr_service_platform',
  user: 'postgres',
  password: 'your_password'
});

pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
```

### MongoDB

```javascript
// Node.js
const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');

async function test() {
  await client.connect();
  const db = client.db('qr_service_platform');
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  await client.close();
}

test();
```

---

## 📊 Database Structure

### PostgreSQL Tables (25 tables)

```
✅ restaurants
✅ subscription_feature_limits
✅ subscriptions
✅ branches
✅ users
✅ areas
✅ tables
✅ categories
✅ menu_items
✅ menu_item_availability
✅ customization_groups
✅ customization_options
✅ item_customizations
✅ order_sessions
✅ orders
✅ order_items
✅ order_item_customizations
✅ payments
✅ invoices
✅ reservations
✅ notifications
✅ promotions
✅ table_merge_history
```

### MongoDB Collections (10 collections)

```
✅ order_events (TTL: 90 days)
✅ service_requests (TTL: 24 hours)
✅ feedbacks
✅ activity_logs (TTL: 365 days)
✅ table_sessions (TTL: 7 days)
✅ realtime_notifications (TTL: 1 hour)
✅ analytics_cache (TTL: 90 days)
✅ customer_behavior (TTL: 30 days)
✅ payment_logs (TTL: 2 years)
✅ qr_scan_logs (TTL: 90 days)
```

---

## 🎯 Connection Strings

### .env Configuration

```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/qr_service_platform

# MongoDB
MONGODB_URI=mongodb://localhost:27017/qr_service_platform
```

---

## 🔄 Reset Database

### PostgreSQL

```sql
-- Drop và tạo lại
DROP DATABASE IF EXISTS qr_service_platform;
CREATE DATABASE qr_service_platform;

-- Chạy lại schema
\i database/schema_complete.sql
```

### MongoDB

```javascript
// Drop database
use qr_service_platform
db.dropDatabase()

// Chạy lại schema
load("database/mongodb_complete.js")
```

---

## 🆘 Troubleshooting

### PostgreSQL không kết nối được

```bash
# Kiểm tra PostgreSQL đang chạy
pg_isready

# Restart PostgreSQL
# Windows: services.msc → PostgreSQL
# Linux: sudo systemctl restart postgresql
# Mac: brew services restart postgresql
```

### MongoDB không kết nối được

```bash
# Kiểm tra MongoDB đang chạy
mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
# Windows: services.msc → MongoDB
# Linux: sudo systemctl restart mongod
# Mac: brew services restart mongodb-community
```

### Permission denied

```bash
# PostgreSQL
sudo -u postgres psql

# MongoDB
sudo mongosh
```

---

## 📚 Next Steps

1. ✅ Setup databases
2. ✅ Verify connections
3. 📝 Update .env file
4. 🚀 Start building backend
5. 🧪 Write tests

---

**Created for:** QR Service Platform  
**Version:** 2.0  
**Last Updated:** 2024
