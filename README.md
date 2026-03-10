# QRService - Restaurant Management System

Modern restaurant management platform with QR ordering, table management, and analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Backend Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Start backend server
npm start
```

Backend runs on: http://localhost:3000

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with backend API URL

# Start development server
npm run dev
```

Frontend runs on: http://localhost:8081

## 📁 Project Structure

```
FoodStack-new/
├── src/                    # Backend source code
│   ├── controller/         # API controllers
│   ├── routes/            # API routes
│   ├── use-cases/         # Business logic
│   ├── repository/        # Database access
│   ├── dto/               # Data transfer objects
│   ├── service/           # External services
│   └── middleware/        # Express middleware
├── frontend/              # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   └── lib/          # Utilities
├── prisma/               # Database schema & migrations
└── database/             # SQL scripts
```

## 🎯 Features

### Admin Dashboard
- ✅ Dashboard with KPIs and analytics
- ✅ Branch management (CRUD)
- ✅ Menu management (Categories & Items)
- ✅ Table & area management
- ✅ Order management
- ✅ Staff management
- ✅ QR code generation
- ✅ Reservations
- ✅ Reviews & feedback
- ✅ Analytics & reports
- ✅ Settings & configuration

### Customer Features (Mobile)
- QR code scanning
- Digital menu browsing
- Order placement
- Live order tracking
- Service requests
- Payment integration

## 🔧 Tech Stack

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- PayOS Payment Gateway

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- React Query

## 📝 API Documentation

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh-token
```

### Branches
```
GET    /api/v1/branches
POST   /api/v1/branches
PUT    /api/v1/branches/:id
DELETE /api/v1/branches/:id
```

### Categories
```
GET    /api/v1/categories?branch_id=xxx
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

### Menu Items
```
GET    /api/v1/menu-items?category_id=xxx
POST   /api/v1/menu-items
PUT    /api/v1/menu-items/:id
DELETE /api/v1/menu-items/:id
```

## 🧪 Testing

### Test Account
```
Email: test@example.com
Password: Test123456
```

### Run Tests
```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/foodstack"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## 📦 Deployment

### Backend
```bash
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

- Backend: Node.js + Express + Prisma
- Frontend: React + TypeScript + TailwindCSS
- Database: PostgreSQL

## 📞 Support

For support, email support@qrservice.com or open an issue.

---

Built with ❤️ for modern restaurants

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL
- Redis (optional)

### Setup
```bash
# Clone repository
git clone <repo-url>
cd FoodStack-new

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Setup database
cd ..
npm run prisma:migrate

# Start development
npm run dev                    # Backend
cd frontend && npm run dev     # Frontend
```

---

## 🚀 Deployment

### Backend
```bash
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

---

## 📄 License

Proprietary - QR Service Platform Team

---

## 👥 Team

- Backend: Node.js + Express + Prisma
- Frontend: React + TypeScript + shadcn/ui
- Database: PostgreSQL + Redis + MongoDB

---

## 📞 Support

**Gặp vấn đề?**
1. Đọc [START-HERE.md](START-HERE.md)
2. Đọc [QUICK-FIX.md](QUICK-FIX.md)
3. Check [FIX-LOGIN-ERROR.md](FIX-LOGIN-ERROR.md)
4. Cung cấp:
   - Screenshot
   - Console logs
   - Terminal output

---

**Happy Coding! 🎉**
