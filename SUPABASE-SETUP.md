# 🚀 SETUP DATABASE VỚI SUPABASE (KHUYẾN NGHỊ)

## 🎯 TẠI SAO DÙNG SUPABASE?

### So sánh với AWS

| Feature | Supabase | AWS RDS |
|---------|----------|---------|
| **Chi phí** | FREE (2 projects) | ~$15/tháng |
| **Setup time** | 2 phút | 10 phút |
| **PostgreSQL** | ✅ Included | ✅ |
| **Realtime** | ✅ Built-in | ❌ Cần setup riêng |
| **Auth** | ✅ Built-in | ❌ Cần Cognito |
| **Storage** | ✅ Built-in | ❌ Cần S3 |
| **API** | ✅ Auto-generated | ❌ Tự code |
| **Dashboard** | ✅ Đẹp, dễ dùng | ⚠️ Phức tạp |
| **Backup** | ✅ Automatic | ✅ |
| **SSL** | ✅ Free | ✅ |

### Kết luận: Supabase WIN! 🏆

---

## 💰 CHI PHÍ

### Free Tier (Đủ cho Development)
```
✅ PostgreSQL Database:        FREE
✅ 500 MB Database space:      FREE
✅ 1 GB File storage:          FREE
✅ 2 GB Bandwidth:             FREE
✅ 50,000 Monthly Active Users: FREE
✅ Realtime connections:       FREE
✅ Auth (unlimited users):     FREE
✅ 2 Projects:                 FREE

Tổng: $0/tháng 🎉
```

### Pro Tier (Khi scale)
```
⚠️ $25/tháng per project
✅ 8 GB Database space
✅ 100 GB File storage
✅ 250 GB Bandwidth
✅ No project limit
✅ Daily backups
✅ Priority support

Tổng: $25/tháng (khi cần)
```

---

## 🎯 KIẾN TRÚC ĐỀ XUẤT

```
Supabase (All-in-one)
├── PostgreSQL Database      ✅ FREE
├── Realtime (WebSocket)     ✅ FREE
├── Auth (JWT)               ✅ FREE
├── Storage (Images)         ✅ FREE
└── Auto REST API            ✅ FREE

MongoDB Atlas               ✅ FREE (M0)
└── Event Store & Logs

Redis Cloud                 ✅ FREE (30MB)
└── Cache & Sessions

Team Members
├── Dev 1 → Connect to Supabase
├── Dev 2 → Connect to Supabase
└── Dev 3 → Connect to Supabase
```

**Tổng chi phí: $0/tháng** 🎉

---

## 📝 HƯỚNG DẪN SETUP CHI TIẾT

### BƯỚC 1: Tạo Supabase Project (2 phút)

#### 1.1. Sign Up

```
1. Vào https://supabase.com
2. Click "Start your project"
3. Sign up với GitHub (khuyến nghị)
```

#### 1.2. Tạo Organization

```
1. Create a new organization
2. Organization name: FoodStack
3. Plan: Free
```

#### 1.3. Tạo Project

```
1. New Project
2. Settings:
   - Name: foodstack-dev
   - Database Password: [Generate strong password]
   - Region: Southeast Asia (Singapore)
   - Pricing Plan: Free
   
3. Create new project (2-3 phút)
```

---

### BƯỚC 2: Lấy Connection Info

#### 2.1. Database Connection

```
1. Project Settings → Database
2. Connection string → URI

Copy:
postgresql://postgres:[YOUR-PASSWORD]@db.abc123xyz.supabase.co:5432/postgres

Hoặc Connection pooling (Khuyến nghị):
postgresql://postgres:[YOUR-PASSWORD]@db.abc123xyz.supabase.co:6543/postgres?pgbouncer=true
```

#### 2.2. API Keys

```
1. Project Settings → API
2. Copy:
   - Project URL: https://abc123xyz.supabase.co
   - anon public key: eyJhbGc...
   - service_role key: eyJhbGc... (secret)
```

---

### BƯỚC 3: Setup Database Schema

#### 3.1. Option A: Qua Supabase Dashboard (Dễ nhất)

```
1. Table Editor → New table
2. Hoặc SQL Editor → New query
3. Paste schema từ database/schema_complete.sql
4. Run
```

#### 3.2. Option B: Qua Prisma (Khuyến nghị)

**File: `.env`**
```bash
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.abc123xyz.supabase.co:6543/postgres?pgbouncer=true"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.abc123xyz.supabase.co:5432/postgres"
```

**File: `prisma/schema.prisma`**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Run migrations:**
```bash
npm run prisma:generate
npm run prisma:migrate dev
```

---

### BƯỚC 4: Setup MongoDB Atlas (FREE)

```
# Giống như hướng dẫn AWS
1. Vào https://www.mongodb.com/cloud/atlas/register
2. Create Free M0 cluster
3. Region: Singapore
4. Copy connection string:

mongodb+srv://foodstack_admin:PASSWORD@foodstack-dev.abc123.mongodb.net/foodstack_dev
```

---

### BƯỚC 5: Setup Redis Cloud (FREE)

```
# Giống như hướng dẫn AWS
1. Vào https://redis.com/try-free/
2. Create Free 30MB database
3. Region: Singapore
4. Copy connection info:

redis://default:PASSWORD@redis-12345.c123.ap-southeast-1-1.ec2.cloud.redislabs.com:12345
```

---

### BƯỚC 6: Tạo .env.shared cho Team

**File: `.env.shared`**

```bash
# =====================================================
# SUPABASE - FREE TIER
# =====================================================

# PostgreSQL (Supabase)
DATABASE_URL="postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.abc123xyz.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.abc123xyz.supabase.co:5432/postgres"

# Supabase API
SUPABASE_URL="https://abc123xyz.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Secret!

# MongoDB Atlas (FREE M0)
MONGODB_URI="mongodb+srv://foodstack_admin:YOUR_MONGO_PASSWORD@foodstack-dev.abc123.mongodb.net/foodstack_dev"

# Redis Cloud (FREE 30MB)
REDIS_HOST="redis-12345.c123.ap-southeast-1-1.ec2.cloud.redislabs.com"
REDIS_PORT="12345"
REDIS_PASSWORD="YOUR_REDIS_PASSWORD"

# =====================================================
# LOCAL DEVELOPMENT
# =====================================================

NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# JWT
JWT_SECRET="dev_jwt_secret_shared_key_min_32_chars"
JWT_REFRESH_TOKEN_SECRET="dev_refresh_secret_shared_key_min_32_chars"

# Cloudinary (Hoặc dùng Supabase Storage)
CLOUDINARY_CLOUD_NAME="your_cloud"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"

# PayOS (Test)
PAYOS_CLIENT_ID="test_client_id"
PAYOS_API_KEY="test_api_key"
PAYOS_CHECKSUM_KEY="test_checksum_key"
```

---

## 🎁 BONUS: Supabase Features

### 1. Realtime Database (Thay WebSocket)

**Không cần Socket.io!** Supabase có built-in realtime.

```javascript
// Thay vì Socket.io
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Listen to order changes
supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Order changed:', payload)
      // Update UI real-time
    }
  )
  .subscribe()
```

### 2. Auth (Thay JWT custom)

**Không cần code auth!** Supabase có built-in auth.

```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get user
const { data: { user } } = await supabase.auth.getUser()
```

### 3. Storage (Thay Cloudinary)

**Không cần Cloudinary!** Supabase có built-in storage.

```javascript
// Upload image
const { data, error } = await supabase.storage
  .from('menu-images')
  .upload('dish-1.jpg', file)

// Get public URL
const { data } = supabase.storage
  .from('menu-images')
  .getPublicUrl('dish-1.jpg')
```

### 4. Auto REST API

**Không cần code API!** Supabase tự generate REST API.

```javascript
// GET /rest/v1/menu_items
const { data, error } = await supabase
  .from('menu_items')
  .select('*')
  .eq('branch_id', branchId)

// POST /rest/v1/orders
const { data, error } = await supabase
  .from('orders')
  .insert({ table_id: 1, total: 100 })
```

---

## 🔧 CẤU HÌNH CODE

### Update database.config.js

```javascript
// src/config/database.config.js

const { createClient } = require('@supabase/supabase-js');

// Supabase client (optional, nếu dùng Supabase features)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for backend
);

// Prisma vẫn dùng như cũ
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  prisma,
  supabase, // Export nếu cần dùng Supabase features
  // ... MongoDB, Redis như cũ
};
```

---

## 📊 SUPABASE DASHBOARD

### Những gì có thể làm:

```
✅ Table Editor
   - Xem/edit data trực tiếp
   - Giống phpMyAdmin
   
✅ SQL Editor
   - Run SQL queries
   - Save queries
   
✅ Database
   - View schema
   - Manage indexes
   - View relationships
   
✅ Auth
   - Manage users
   - View sessions
   - Configure providers
   
✅ Storage
   - Browse files
   - Manage buckets
   - Set policies
   
✅ Logs
   - View API logs
   - Database logs
   - Auth logs
   
✅ API Docs
   - Auto-generated
   - Interactive
```

---

## 🚀 HƯỚNG DẪN TEAM SETUP

**File: `TEAM-SETUP-SUPABASE.md`**

```markdown
# 🚀 SETUP VỚI SUPABASE (5 PHÚT)

## Bước 1: Clone & Install
```bash
git clone https://github.com/your-org/foodstack.git
cd foodstack
npm install
```

## Bước 2: Setup Environment
```bash
# Copy .env.shared (từ Slack/Discord)
cp .env.shared .env
```

## Bước 3: Generate Prisma Client
```bash
npm run prisma:generate
```

## Bước 4: Run Dev Server
```bash
npm run dev
```

## Bước 5: Test Connection
```bash
node test-db-connection.js
```

**Expected:**
```
✅ PostgreSQL (Supabase): Connected
✅ MongoDB: Connected
✅ Redis: Connected
```

## ✅ DONE! Start coding!

## 🎁 Bonus: Supabase Dashboard

Access: https://app.supabase.com/project/YOUR_PROJECT_ID

- View data: Table Editor
- Run queries: SQL Editor
- Check logs: Logs
```

---

## 🔒 BẢO MẬT

### Row Level Security (RLS)

Supabase có built-in RLS (tốt hơn custom middleware):

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their restaurant's orders
CREATE POLICY "Users can view own restaurant orders"
ON orders FOR SELECT
USING (restaurant_id = auth.jwt() ->> 'restaurant_id');

-- Policy: Only authenticated users can insert
CREATE POLICY "Authenticated users can insert orders"
ON orders FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

### API Keys

```
⚠️ NEVER commit:
   - service_role key (có full access)
   - Database password

✅ OK to commit:
   - anon public key (safe, có RLS protection)
   - Supabase URL
```

---

## 📈 MONITORING

### Supabase Dashboard

```
1. Project → Reports
2. View:
   - API requests
   - Database size
   - Bandwidth usage
   - Active connections
   
3. Alerts:
   - Email khi gần limit
   - Slack integration
```

### Database Performance

```
1. Database → Query Performance
2. View:
   - Slow queries
   - Most frequent queries
   - Index suggestions
```

---

## 🚨 TROUBLESHOOTING

### Lỗi: Connection pooling timeout

```bash
# Solution: Dùng direct connection cho migrations
DIRECT_URL="postgresql://postgres:PASSWORD@db.abc123xyz.supabase.co:5432/postgres"
```

### Lỗi: Too many connections

```bash
# Solution: Dùng connection pooling (port 6543)
DATABASE_URL="postgresql://postgres:PASSWORD@db.abc123xyz.supabase.co:6543/postgres?pgbouncer=true"
```

### Lỗi: RLS blocking queries

```sql
-- Disable RLS for development
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Or create permissive policy
CREATE POLICY "Allow all for development"
ON table_name FOR ALL
USING (true);
```

---

## 💡 BEST PRACTICES

### Development

```
✅ Dùng connection pooling (port 6543)
✅ Enable RLS cho production
✅ Dùng Supabase Storage thay Cloudinary
✅ Dùng Supabase Auth thay JWT custom
✅ Dùng Supabase Realtime thay Socket.io
```

### Database

```
✅ Backup trước khi migrate
✅ Test queries trong SQL Editor
✅ Monitor slow queries
✅ Create indexes cho foreign keys
```

### Security

```
✅ Enable RLS cho production
✅ Rotate service_role key định kỳ
✅ Limit API rate trong dashboard
✅ Enable email verification
```

---

## 🎯 MIGRATION TỪ AWS

Nếu đã setup AWS RDS, migrate sang Supabase:

```bash
# 1. Export data từ AWS RDS
pg_dump -h AWS_ENDPOINT -U postgres -d foodstack_dev > backup.sql

# 2. Import vào Supabase
psql "postgresql://postgres:PASSWORD@db.abc123xyz.supabase.co:5432/postgres" < backup.sql

# 3. Update .env
DATABASE_URL="postgresql://postgres:PASSWORD@db.abc123xyz.supabase.co:6543/postgres?pgbouncer=true"

# 4. Test
npm run dev
```

---

## 📊 SO SÁNH CUỐI CÙNG

### AWS RDS
```
✅ Pros:
   - Enterprise-grade
   - Nhiều options
   - Scalable

❌ Cons:
   - Chi phí: $15/tháng
   - Setup phức tạp
   - Cần setup Auth, Storage riêng
   - Dashboard khó dùng
```

### Supabase
```
✅ Pros:
   - FREE tier hào phóng
   - Setup 2 phút
   - All-in-one (DB, Auth, Storage, Realtime)
   - Dashboard đẹp, dễ dùng
   - Auto REST API
   - Built-in Realtime

❌ Cons:
   - Ít options hơn AWS
   - Vendor lock-in (nhưng có thể export)
```

### Kết luận: Supabase WIN cho Development! 🏆

---

## 🎯 CHECKLIST

### Admin Setup (1 lần)

```
☐ Tạo Supabase account
☐ Tạo project (2 phút)
☐ Copy connection strings
☐ Run migrations
☐ Seed data
☐ Tạo .env.shared
☐ Share với team
☐ Test connections
```

### Team Members

```
☐ Clone repo
☐ npm install
☐ Copy .env.shared → .env
☐ npm run prisma:generate
☐ npm run dev
☐ Test connection
☐ Start coding!
```

---

## 📞 RESOURCES

- Supabase Docs: https://supabase.com/docs
- Supabase Dashboard: https://app.supabase.com
- Community: https://github.com/supabase/supabase/discussions
- Discord: https://discord.supabase.com

---

**Chi phí: $0/tháng** 🎉  
**Setup time: 2 phút**  
**Team onboarding: 5 phút/người**  

✅ **HIGHLY RECOMMENDED!** Supabase là lựa chọn tốt nhất cho development!
