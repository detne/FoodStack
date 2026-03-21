# 🖥️ FoodStack Backend API

Node.js backend API for the FoodStack mobile restaurant management system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env .env.local
# Edit .env.local with your database credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Server runs on: `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── application/        # Application services & DTOs
│   ├── config/            # Configuration files
│   ├── controller/        # HTTP controllers
│   ├── core/              # Core business logic
│   ├── dto/               # Data Transfer Objects
│   ├── infrastructure/    # External services
│   ├── middleware/        # Express middleware
│   ├── repository/        # Data access layer
│   ├── routes/            # API routes
│   ├── service/           # Business services
│   ├── use-cases/         # Application use cases
│   └── utils/             # Utility functions
├── prisma/                # Database schema & migrations
├── .env                   # Environment configuration
├── package.json           # Dependencies & scripts
└── nodemon.json          # Development configuration
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# JWT Authentication
JWT_SECRET="your_secret_key_min_32_characters"
JWT_ACCESS_TOKEN_EXPIRY="15m"
JWT_REFRESH_TOKEN_SECRET="your_refresh_secret"
JWT_REFRESH_TOKEN_EXPIRY="30d"

# Application
NODE_ENV="development"
PORT=3000
```

### Optional Services

```env
# MongoDB (for logging)
MONGODB_URI="mongodb://localhost:27017/foodstack"

# Redis (for caching)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASSWORD="your_app_password"
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Public Endpoints
- `GET /health` - Health check
- `GET /api/v1/public/qr/{token}` - QR code scanning

### Restaurants
- `GET /api/v1/restaurants` - List restaurants
- `POST /api/v1/restaurants` - Create restaurant
- `GET /api/v1/restaurants/{id}` - Get restaurant details
- `PUT /api/v1/restaurants/{id}` - Update restaurant

### Menu Management
- `GET /api/v1/branches/{id}/menu` - Get branch menu
- `POST /api/v1/menu-items` - Create menu item
- `PUT /api/v1/menu-items/{id}` - Update menu item
- `DELETE /api/v1/menu-items/{id}` - Delete menu item

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/{id}` - Get order details
- `PUT /api/v1/orders/{id}/status` - Update order status
- `GET /api/v1/orders/history` - Get order history

## 🗄️ Database Setup

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE foodstack;

-- Create user (optional)
CREATE USER foodstack_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE foodstack TO foodstack_user;
```

### 3. Run Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed test data
psql -d foodstack -f ../database/quick-test-accounts.sql
```

## 🧪 Testing

### Test Accounts
After running database setup, you'll have these test accounts (password: `123456`):

- **Admin:** `admin@foodstack.com`
- **Owner:** `owner@restaurant.com`
- **Manager:** `manager@restaurant.com`
- **Staff:** `staff@restaurant.com`
- **Customer:** `customer@gmail.com`

### API Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@foodstack.com","password":"123456"}'

# Test QR scanning
curl http://localhost:3000/api/v1/public/qr/test-qr-token-123
```

## 🔧 Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:migrate     # Run migrations
npm run db:seed        # Seed test data
npm run db:reset       # Reset database
npm run db:studio      # Open Prisma Studio
```

## 🏗️ Architecture

### Clean Architecture Layers

1. **Controllers** (`src/controller/`) - HTTP request handling
2. **Use Cases** (`src/use-cases/`) - Business logic orchestration
3. **Services** (`src/service/`) - Business services
4. **Repositories** (`src/repository/`) - Data access abstraction
5. **Infrastructure** (`src/infrastructure/`) - External services

### Key Patterns

- **Dependency Injection** - Services injected into controllers
- **Repository Pattern** - Data access abstraction
- **Use Case Pattern** - Business logic encapsulation
- **DTO Pattern** - Data validation and transformation

## 🔐 Security

### Authentication Flow
1. User submits credentials
2. Server validates against database
3. JWT tokens generated (access + refresh)
4. Tokens stored securely on client
5. Access token used for API requests
6. Refresh token used to renew access

### Security Features
- **Password hashing** with bcrypt
- **JWT tokens** with expiration
- **Role-based access control**
- **Input validation** with Zod
- **CORS protection**
- **Rate limiting**
- **SQL injection prevention** with Prisma

## 📈 Performance

### Optimization Features
- **Database connection pooling**
- **Redis caching** (optional)
- **Query optimization** with Prisma
- **Async/await** for non-blocking operations
- **Compression** middleware
- **Static file serving**

### Monitoring
- **Health check endpoint** (`/health`)
- **Request logging** with Winston
- **Error tracking** with structured logging
- **Performance metrics** (optional)

## 🐛 Troubleshooting

### Common Issues

**Database connection fails:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

**Prisma errors:**
```bash
# Regenerate client
npx prisma generate

# Reset database
npx prisma migrate reset

# Check schema
npx prisma validate
```

**Authentication fails:**
```bash
# Check JWT secret is set
echo $JWT_SECRET

# Verify test users exist
psql -d foodstack -c "SELECT email, role FROM users;"

# Check password hashing
node -e "console.log(require('bcrypt').hashSync('123456', 12))"
```

## 📚 Additional Resources

- **Prisma Documentation:** https://www.prisma.io/docs
- **Fastify Documentation:** https://www.fastify.io/docs
- **JWT Best Practices:** https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/
- **Node.js Security:** https://nodejs.org/en/docs/guides/security/

---

**Need help?** Check the troubleshooting section or create an issue.