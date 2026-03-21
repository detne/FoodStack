# 📱 FoodStack Mobile Complete

## 🏗️ Project Structure

```
FoodStack-Mobile-Complete/
├── 📱 mobile-app/          # React Native Mobile App
├── 🖥️  backend/            # Node.js Backend API
├── 🗄️  database/           # Database scripts & migrations
├── 📚 docs/               # Documentation
└── 🔧 scripts/            # Setup & deployment scripts
```

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Mobile App Setup  
```bash
cd mobile-app
npm install
npx expo start
```

### 3. Database Setup
```bash
cd database
# Run setup scripts
```

## 📋 Features

### 🎭 Multi-Role Support
- 👑 **Admin** - System management
- 🏪 **Restaurant Owner** - Restaurant management
- 👨‍💼 **Manager** - Branch operations  
- 👥 **Staff** - Daily operations
- 👤 **Customer** - Order & browse

### 🔧 Core Functionality
- ✅ QR Code scanning for table ordering
- ✅ Menu browsing and management
- ✅ Order placement and tracking
- ✅ Multi-restaurant support
- ✅ Real-time order updates
- ✅ Role-based access control

## 🛠️ Tech Stack

### Mobile App
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **AsyncStorage** for local data
- **Expo Camera** for QR scanning

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM with PostgreSQL
- **JWT** authentication
- **Zod** for validation

### Database
- **PostgreSQL** main database
- **Redis** for caching (optional)
- **Prisma** migrations

## 📱 Mobile App Features

### Customer Flow
1. **QR Scan** → Table identification
2. **Browse Menu** → Select items
3. **Add to Cart** → Customize orders
4. **Checkout** → Place order
5. **Track Order** → Real-time updates

### Staff Flow
1. **Login** → Role-based access
2. **Order Management** → Process orders
3. **Table Management** → Manage tables
4. **Menu Updates** → Update availability

## 🔐 Authentication

### Bypass Login (Development)
For testing purposes, the app includes bypass login functionality:
- Quick role switching
- No backend dependency for UI testing
- Fake tokens for API simulation

### Production Login
- JWT-based authentication
- Role-based permissions
- Secure token storage
- Auto-refresh tokens

## 🌐 API Integration

### Base Configuration
```typescript
// Mobile app connects to backend
const API_BASE_URL = 'http://192.168.1.123:3000';
const API_VERSION = '/api/v1';
```

### Key Endpoints
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/restaurants` - Restaurant list
- `GET /api/v1/branches/{id}/menu` - Menu items
- `POST /api/v1/orders` - Place order
- `GET /api/v1/orders/{id}` - Order status

## 🧪 Testing

### Mobile App Testing
1. **API Test Screen** - Test backend connectivity
2. **Role Testing** - Test different user roles
3. **Feature Testing** - Test core functionality
4. **UI/UX Testing** - Test user interface

### Backend Testing
- Unit tests with Jest
- Integration tests for APIs
- Database migration tests
- Authentication flow tests

## 📦 Deployment

### Mobile App
```bash
# Development
npx expo start

# Build for production
npx expo build:android
npx expo build:ios
```

### Backend
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for seamless restaurant ordering experience**