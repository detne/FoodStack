# Hướng Dẫn Migration từ PostgreSQL sang MongoDB

## Tổng Quan

Dự án đã được cấu hình để chuyển từ PostgreSQL (Supabase) sang MongoDB với ít thay đổi code nhất có thể. Tất cả business logic và API endpoints giữ nguyên.

## Các Thay Đổi Chính

### 1. Prisma Schema
- Đã chuyển provider từ `postgresql` sang `mongodb`
- Tất cả ID fields sử dụng `@db.ObjectId`
- Decimal fields chuyển thành Float
- Thêm `@map("_id")` cho primary keys
- Thêm `@updatedAt` cho updated_at fields

### 2. Database Configuration
- DATABASE_URL giờ trỏ đến MongoDB
- Loại bỏ DIRECT_URL (không cần cho MongoDB)
- Giữ lại PostgreSQL config để migration

### 3. Scripts Migration
- `scripts/migrate-postgres-to-mongodb.js`: Migration data
- `scripts/setup-mongodb.js`: Setup initial data

## Các Bước Migration

### Bước 1: Cài Đặt MongoDB
```bash
# Cài đặt MongoDB locally hoặc sử dụng MongoDB Atlas
# Cập nhật DATABASE_URL trong .env
DATABASE_URL="mongodb://localhost:27017/qr_service_platform"
```

### Bước 2: Generate Prisma Client
```bash
npm run prisma:generate
```

### Bước 3: Push Schema to MongoDB
```bash
npm run prisma:push
```

### Bước 4: Setup Initial Data
```bash
npm run db:setup
```

### Bước 5: Migration Data (Nếu có data cũ)
```bash
# Migration từ PostgreSQL sang MongoDB
npm run db:migrate

# Verify migration
npm run db:migrate:verify
```

### Bước 6: Test Application
```bash
npm run dev
```

## Những Gì Không Thay Đổi

✅ **Business Logic**: Tất cả use cases giữ nguyên
✅ **API Endpoints**: Không thay đổi routes
✅ **Frontend/Mobile**: Không cần update
✅ **Authentication**: JWT logic giữ nguyên
✅ **File Upload**: Cloudinary integration giữ nguyên
✅ **Payment**: PayOS integration giữ nguyên

## Những Gì Thay Đổi

🔄 **Database Provider**: PostgreSQL → MongoDB
🔄 **ID Format**: UUID → ObjectId
🔄 **Decimal Fields**: Decimal → Float
🔄 **Database Config**: Connection string và health checks

## Rollback Plan

Nếu cần rollback về PostgreSQL:

1. Đổi lại `provider = "postgresql"` trong schema.prisma
2. Đổi lại DATABASE_URL trong .env
3. Chạy `npm run prisma:generate`
4. Restore data từ backup

## Performance Considerations

### MongoDB Advantages
- Flexible schema cho JSON fields
- Better performance cho read-heavy workloads
- Horizontal scaling
- Native JSON support

### Monitoring
- Sử dụng MongoDB Compass để monitor
- Enable slow query logging
- Monitor connection pool usage

## Troubleshooting

### Common Issues

1. **Connection Error**
   ```
   Error: P1001: Can't reach database server
   ```
   - Kiểm tra MongoDB service đang chạy
   - Verify connection string

2. **Schema Sync Error**
   ```
   Error: Schema is not in sync
   ```
   - Chạy `npm run prisma:push` để sync schema

3. **Migration Error**
   ```
   Error: Decimal conversion failed
   ```
   - Kiểm tra data types trong migration script

### Debug Commands
```bash
# Check MongoDB connection
npm run prisma:studio

# Verify data
npm run db:migrate:verify

# Check logs
tail -f logs/app.log
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
```

### Deployment Steps
1. Setup MongoDB Atlas cluster
2. Update production environment variables
3. Run migration scripts
4. Deploy application
5. Monitor performance

## Support

Nếu gặp vấn đề trong quá trình migration:
1. Kiểm tra logs trong `logs/` directory
2. Verify database connections
3. Check Prisma schema syntax
4. Test với sample data trước

---

**Lưu Ý**: Migration này được thiết kế để minimize code changes. Tất cả existing functionality sẽ hoạt động như cũ sau khi migration hoàn tất.