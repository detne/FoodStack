# Database Migrations

Hệ thống sử dụng **Polyglot Persistence** với PostgreSQL và MongoDB.

## 📁 Cấu trúc

```
database/
├── migrations/
│   ├── postgresql/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_triggers_and_functions.sql
│   │   └── 003_indexes_optimization.sql
│   └── mongodb/
│       └── 001_collections_setup.js
└── README.md
```

## 🗄️ PostgreSQL (Core Relational Data)

### Chạy migrations:

```bash
# Kết nối PostgreSQL
psql -U postgres -d qr_service_platform

# Chạy từng migration theo thứ tự
\i database/migrations/postgresql/001_initial_schema.sql
\i database/migrations/postgresql/002_triggers_and_functions.sql
\i database/migrations/postgresql/003_indexes_optimization.sql
```

### Hoặc dùng script:

```bash
# Windows
type database\migrations\postgresql\001_initial_schema.sql | psql -U postgres -d qr_service_platform
type database\migrations\postgresql\002_triggers_and_functions.sql | psql -U postgres -d qr_service_platform
type database\migrations\postgresql\003_indexes_optimization.sql | psql -U postgres -d qr_service_platform

# Linux/Mac
psql -U postgres -d qr_service_platform < database/migrations/postgresql/001_initial_schema.sql
psql -U postgres -d qr_service_platform < database/migrations/postgresql/002_triggers_and_functions.sql
psql -U postgres -d qr_service_platform < database/migrations/postgresql/003_indexes_optimization.sql
```

### Nội dung PostgreSQL:

**001_initial_schema.sql:**
- ✅ Extensions (uuid-ossp, pg_trgm)
- ✅ ENUM types (13 types)
- ✅ Core tables (20+ tables)
- ✅ Foreign keys & constraints
- ✅ Basic indexes
- ✅ Default data (subscription plans)

**002_triggers_and_functions.sql:**
- ✅ Auto-update `updated_at` timestamps
- ✅ Auto-calculate order totals
- ✅ Auto-update table status
- ✅ Subscription limit validation
- ✅ Prevent double booking
- ✅ Utility functions (stats, availability)

**003_indexes_optimization.sql:**
- ✅ Composite indexes (multi-column)
- ✅ Partial indexes (filtered)
- ✅ Covering indexes (INCLUDE columns)
- ✅ JSONB indexes
- ✅ Full-text search indexes
- ✅ Monitoring views

## 🍃 MongoDB (Flexible & High-Volume Data)

### Chạy migrations:

```bash
# Kết nối MongoDB
mongosh

# Chạy migration
load("database/migrations/mongodb/001_collections_setup.js")
```

### Hoặc:

```bash
mongosh < database/migrations/mongodb/001_collections_setup.js
```

### Nội dung MongoDB:

**001_collections_setup.js:**
- ✅ `order_events` - Order lifecycle tracking (TTL: 90 days)
- ✅ `service_requests` - Customer service requests (TTL: 24 hours)
- ✅ `feedbacks` - Customer ratings and reviews
- ✅ `activity_logs` - System audit trail (TTL: 365 days)
- ✅ `table_sessions` - Real-time table sessions (TTL: 7 days)
- ✅ `realtime_notifications` - WebSocket events (TTL: 1 hour)
- ✅ `analytics_cache` - Pre-calculated metrics (TTL: 90 days)

## 🔄 Data Flow

### PostgreSQL (Source of Truth):
```
restaurants → branches → tables → orders → payments
                      ↓
                   menu_items → order_items
                      ↓
                 subscriptions
```

### MongoDB (Events & Logs):
```
order_events ← Every order change
service_requests ← Customer requests at table
feedbacks ← Post-meal ratings
activity_logs ← Admin actions
table_sessions ← Real-time tracking
```

## 🎯 Khi nào dùng gì?

| Use Case | Database | Lý do |
|----------|----------|-------|
| Tạo order mới | PostgreSQL | ACID transaction |
| Log order status change | MongoDB | High write volume |
| Tính tổng tiền | PostgreSQL | Financial accuracy |
| Track QR scan | MongoDB | Real-time events |
| Lưu menu | PostgreSQL | Relational structure |
| Customer feedback | MongoDB | Flexible schema |
| Payment processing | PostgreSQL | ACID critical |
| Analytics cache | MongoDB | Fast read/write |

## 🚀 Quick Start

### 1. Tạo databases:

```bash
# PostgreSQL
createdb qr_service_platform

# MongoDB (tự động tạo khi insert)
mongosh
use qr_service_platform
```

### 2. Chạy migrations:

```bash
# PostgreSQL
psql -U postgres -d qr_service_platform -f database/migrations/postgresql/001_initial_schema.sql
psql -U postgres -d qr_service_platform -f database/migrations/postgresql/002_triggers_and_functions.sql
psql -U postgres -d qr_service_platform -f database/migrations/postgresql/003_indexes_optimization.sql

# MongoDB
mongosh < database/migrations/mongodb/001_collections_setup.js
```

### 3. Verify:

```sql
-- PostgreSQL: Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

```javascript
// MongoDB: Check collections
db.getCollectionNames()

// Check indexes
db.order_events.getIndexes()
db.service_requests.getIndexes()
```

## 📊 Monitoring

### PostgreSQL:

```sql
-- View index usage
SELECT * FROM v_index_usage ORDER BY index_scans ASC;

-- View table sizes
SELECT * FROM v_table_sizes;

-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

### MongoDB:

```javascript
// Collection stats
db.order_events.stats()

// Index usage
db.order_events.aggregate([{ $indexStats: {} }])

// Current operations
db.currentOp()
```

## 🔧 Rollback

### PostgreSQL:

```sql
-- Drop all tables (CAREFUL!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### MongoDB:

```javascript
// Drop all collections
db.order_events.drop()
db.service_requests.drop()
db.feedbacks.drop()
db.activity_logs.drop()
db.table_sessions.drop()
db.realtime_notifications.drop()
db.analytics_cache.drop()
```

## 📝 Notes

- **PostgreSQL** dùng cho data cần ACID (orders, payments, subscriptions)
- **MongoDB** dùng cho logs, events, và data có schema linh hoạt
- Tất cả migrations đã có **indexes** và **constraints** đầy đủ
- MongoDB collections có **TTL indexes** để tự động xóa data cũ
- PostgreSQL có **triggers** để tự động update timestamps và validate data

## 🎓 Best Practices

1. **Luôn backup trước khi migrate**
2. **Test migrations trên staging trước**
3. **Monitor performance sau khi deploy**
4. **Review index usage định kỳ**
5. **Clean up unused indexes**
6. **Archive old data thường xuyên**

## 🆘 Troubleshooting

### PostgreSQL connection error:
```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL
# Windows: services.msc → PostgreSQL
# Linux: sudo systemctl restart postgresql
```

### MongoDB connection error:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
# Windows: services.msc → MongoDB
# Linux: sudo systemctl restart mongod
```

---

**Created for:** QR Service Platform  
**Version:** 1.0.0  
**Last Updated:** 2024
