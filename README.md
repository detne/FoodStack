# 🍽️ FoodStack - QR Service Platform

**Multi-tenant QR-based restaurant ordering system**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io/)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Documentation](#documentation)
- [Team](#team)

---

## ✨ Features

### MVP (Sprint 1-6)
- ✅ **Authentication** - JWT-based auth with email verification
- ✅ **Restaurant Management** - Multi-tenant restaurant setup
- ✅ **Branch Management** - Multiple branch support
- ✅ **Table & QR System** - Dynamic QR code generation
- ✅ **Menu Management** - Categories, items, customizations
- ✅ **Order System** - Real-time order processing
- ✅ **Payment Integration** - PayOS payment gateway

### Future Features (Sprint 7-9)
- 🔄 Staff Management
- 🔄 Service Requests
- 🔄 Reservations
- 🔄 Subscriptions
- 🔄 Analytics Dashboard
- 🔄 Notifications

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** JavaScript (ES6+)
- **Architecture:** Clean Architecture

### Databases
- **PostgreSQL** - Primary database (Supabase)
- **MongoDB** - Event store & logs
- **Redis** - Cache & session store

### External Services
- **Cloudinary** - Image storage
- **PayOS** - Payment gateway
- **SMTP** - Email service

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 15+ (or Supabase account)
- **MongoDB** 6+ (or MongoDB Atlas account)
- **Redis** 7+ (or Redis Cloud account)

**🪟 Windows Users:** See [WINDOWS-SETUP.md](./WINDOWS-SETUP.md) for detailed instructions

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-org/foodstack-backend.git
cd foodstack-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your credentials
# See SETUP-COMPLETE-GUIDE.md for detailed instructions
```

### 4. Setup databases

```bash
# Run PostgreSQL migrations
npx prisma migrate dev

# Seed initial data
npm run seed
```

### 5. Start development server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── configuration/       # Config files
├── controller/          # HTTP controllers
├── dto/                 # Data Transfer Objects
├── entities/            # Domain entities
├── exception/           # Custom errors
├── mapper/              # Data mappers
├── repository/          # Data access layer
├── service/             # Business services
├── utils/               # Utility functions
├── validator/           # Input validators
├── middleware/          # Express middleware
├── routes/              # API routes
└── use-cases/           # Business use cases ⭐
```

See [PROJECT-STRUCTURE-SIMPLIFIED.md](./PROJECT-STRUCTURE-SIMPLIFIED.md) for details.

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run dev:debug        # Start with debugger

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier

# Build
npm run build            # Build for production
npm start                # Start production server
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/AUTH-101-register

# Make changes and commit
git add .
git commit -m "feat(auth): implement register restaurant use case"

# Push to remote
git push origin feature/AUTH-101-register

# Create Pull Request on GitHub
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add login use case
fix(order): resolve payment timeout issue
docs(readme): update setup instructions
refactor(menu): simplify category logic
test(payment): add webhook verification tests
```

---

## 📚 Documentation

- **[SETUP-COMPLETE-GUIDE.md](./SETUP-COMPLETE-GUIDE.md)** - Detailed setup instructions
- **[SPRINT1-AUTH-CODE-STRUCTURE.md](./SPRINT1-AUTH-CODE-STRUCTURE.md)** - Sprint 1 implementation guide
- **[JIRA-MANUAL-INPUT-GUIDE.md](./JIRA-MANUAL-INPUT-GUIDE.md)** - Jira stories guide
- **[SUPABASE-SETUP.md](./SUPABASE-SETUP.md)** - Supabase configuration
- **[DATABASE-SCHEMA.md](./database/docs/SCHEMA_DIAGRAM.md)** - Database schema

### API Documentation

Once server is running, visit:
- **Swagger UI:** `http://localhost:3000/api-docs`
- **Postman Collection:** [Download](./docs/postman-collection.json)

---

## 🏗️ Architecture

This project follows **Clean Architecture** principles:

```
┌─────────────────────────────────────┐
│  Presentation Layer (Controllers)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Application Layer (Use Cases)      │  ← Business Logic
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Domain Layer (Entities)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Infrastructure Layer (Repositories) │
└─────────────────────────────────────┘
```

**Benefits:**
- ✅ Testable
- ✅ Maintainable
- ✅ Scalable
- ✅ Independent of frameworks

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests (isolated)
├── integration/    # Integration tests (with DB)
└── e2e/            # End-to-end tests (full flow)
```

---

## 🚢 Deployment

### Environment Setup

1. **Development:** Local machine
2. **Staging:** Heroku/Railway
3. **Production:** AWS/GCP/Azure

### Deploy to Production

```bash
# Build
npm run build

# Set production env vars
export NODE_ENV=production
export DATABASE_URL=your_production_db_url

# Start
npm start
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

---

## 🔐 Security

### Important Notes

- ⚠️ **Never commit `.env` file**
- ⚠️ **Generate new secrets for production**
- ⚠️ **Use HTTPS in production**
- ⚠️ **Enable rate limiting**
- ⚠️ **Validate all inputs**
- ⚠️ **Sanitize user data**

### Generate Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 👥 Team

### Development Team

- **Backend Lead:** [Your Name]
- **Frontend Lead:** [Name]
- **DevOps:** [Name]
- **QA:** [Name]

### Sprint Planning

- **Sprint Duration:** 2 weeks
- **Total Sprints:** 9
- **Current Sprint:** Sprint 1 - Authentication
- **Next Sprint:** Sprint 2 - Restaurant & Branch

See [JIRA Board](https://your-jira-url.atlassian.net) for details.

---

## 📝 License

This project is proprietary and confidential.

---

## 🤝 Contributing

### Setup Development Environment

1. Fork the repository
2. Clone your fork
3. Create feature branch
4. Make changes
5. Write tests
6. Submit Pull Request

### Code Review Process

1. All PRs require 2 approvals
2. All tests must pass
3. Code coverage must be > 80%
4. Follow coding standards

---

## 📞 Support

### Need Help?

- **Documentation:** Check docs folder
- **Issues:** [GitHub Issues](https://github.com/your-org/foodstack-backend/issues)
- **Slack:** #foodstack-dev channel
- **Email:** dev@foodstack.com

---

## 🎯 Roadmap

### Q1 2024
- ✅ Sprint 1-3: Core MVP
- 🔄 Sprint 4-6: Payment & Orders

### Q2 2024
- 🔄 Sprint 7-9: Advanced Features
- 🔄 Production Launch

---

## 📊 Project Status

- **Version:** 0.1.0 (MVP Development)
- **Status:** 🟡 In Development
- **Last Updated:** 2024-01-XX

---

**Built with ❤️ by FoodStack Team**
