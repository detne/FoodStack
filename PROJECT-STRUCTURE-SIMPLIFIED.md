# 🏗️ SIMPLIFIED PROJECT STRUCTURE

**Naming Convention:** Đơn giản, dễ đọc, không suffix phức tạp

---

## 📁 FULL STRUCTURE

```
src/
├── configuration/              # Config files
│   ├── database.js
│   ├── redis.js
│   ├── logger.js
│   ├── env.js
│   └── constants.js
│
├── controller/                 # HTTP Controllers
│   ├── auth.js
│   ├── restaurant.js
│   ├── branch.js
│   ├── table.js
│   ├── menu.js
│   ├── order.js
│   └── payment.js
│
├── dto/                        # Data Transfer Objects
│   ├── auth/
│   │   ├── register.js
│   │   ├── login.js
│   │   ├── refresh-token.js
│   │   └── reset-password.js
│   │
│   ├── restaurant/
│   │   ├── create.js
│   │   └── update.js
│   │
│   ├── order/
│   │   ├── create.js
│   │   └── update.js
│   │
│   └── common/
│       ├── pagination.js
│       └── response.js
│
├── entities/                   # Domain Entities
│   ├── user.js
│   ├── restaurant.js
│   ├── branch.js
│   ├── table.js
│   ├── menu.js
│   ├── order.js
│   └── payment.js
│
├── exception/                  # Custom Errors
│   ├── app-error.js
│   ├── validation-error.js
│   ├── not-found-error.js
│   ├── unauthorized-error.js
│   └── index.js
│
├── mapper/                     # Data Mappers
│   ├── user.js
│   ├── restaurant.js
│   ├── order.js
│   └── payment.js
│
├── repository/                 # Data Access Layer
│   ├── user.js
│   ├── restaurant.js
│   ├── branch.js
│   ├── table.js
│   ├── menu.js
│   ├── order.js
│   └── payment.js
│
├── service/                    # Business Services
│   ├── auth.js
│   ├── token.js
│   ├── email.js
│   ├── upload.js
│   ├── payment.js
│   └── cache.js
│
├── utils/                      # Utility Functions
│   ├── jwt.js
│   ├── bcrypt.js
│   ├── token.js
│   ├── date.js
│   ├── validation.js
│   └── encryption.js
│
├── validator/                  # Input Validators (Zod)
│   ├── auth.js
│   ├── restaurant.js
│   ├── order.js
│   ├── payment.js
│   └── menu.js
│
├── middleware/                 # Express Middleware
│   ├── auth.js
│   ├── tenant.js
│   ├── validation.js
│   ├── rate-limit.js
│   ├── error-handler.js
│   └── logger.js
│
├── routes/                     # API Routes
│   ├── v1/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── restaurant.js
│   │   ├── branch.js
│   │   ├── table.js
│   │   ├── menu.js
│   │   ├── order.js
│   │   └── payment.js
│   │
│   └── public/
│       ├── qr.js
│       └── menu.js
│
├── use-cases/                  # Business Use Cases
│   ├── auth/
│   │   ├── register-restaurant.js
│   │   ├── login.js
│   │   ├── refresh-token.js
│   │   ├── logout.js
│   │   ├── forgot-password.js
│   │   ├── reset-password.js
│   │   ├── change-password.js
│   │   └── verify-email.js
│   │
│   ├── restaurant/
│   │   ├── create.js
│   │   ├── update.js
│   │   ├── get-details.js
│   │   └── upload-logo.js
│   │
│   ├── branch/
│   │   ├── create.js
│   │   ├── update.js
│   │   ├── list.js
│   │   └── set-status.js
│   │
│   ├── table/
│   │   ├── create.js
│   │   ├── update.js
│   │   ├── generate-qr.js
│   │   ├── get-by-qr.js
│   │   └── update-status.js
│   │
│   ├── menu/
│   │   ├── create-category.js
│   │   ├── create-item.js
│   │   ├── update-item.js
│   │   ├── get-full-menu.js
│   │   └── update-availability.js
│   │
│   ├── order/
│   │   ├── create.js
│   │   ├── get-details.js
│   │   ├── update-status.js
│   │   ├── add-items.js
│   │   └── cancel.js
│   │
│   └── payment/
│       ├── process.js
│       ├── verify-webhook.js
│       ├── get-details.js
│       └── generate-invoice.js
│
├── app.js                      # Express app setup
└── server.js                   # Server entry point
```

---

## 🎯 SPRINT 1 - AUTH STRUCTURE (Simplified)

```
src/
├── dto/
│   └── auth/
│       ├── register.js              # RegisterRestaurantDto
│       ├── login.js                 # LoginDto
│       ├── refresh-token.js         # RefreshTokenDto
│       ├── forgot-password.js       # ForgotPasswordDto
│       ├── reset-password.js        # ResetPasswordDto
│       ├── change-password.js       # ChangePasswordDto
│       └── verify-email.js          # VerifyEmailDto
│
├── use-cases/
│   └── auth/
│       ├── register-restaurant.js   # AUTH-101 (5 SP)
│       ├── login.js                 # AUTH-102 (3 SP)
│       ├── refresh-token.js         # AUTH-103 (3 SP)
│       ├── logout.js                # AUTH-104 (2 SP)
│       ├── forgot-password.js       # AUTH-105 (3 SP)
│       ├── reset-password.js        # AUTH-106 (3 SP)
│       ├── change-password.js       # AUTH-107 (2 SP)
│       └── verify-email.js          # AUTH-108 (3 SP)
│
├── repository/
│   ├── user.js                      # UserRepository
│   └── restaurant.js                # RestaurantRepository
│
├── service/
│   ├── token.js                     # TokenService (Redis)
│   └── email.js                     # EmailService
│
├── controller/
│   └── auth.js                      # AuthController
│
├── routes/
│   └── v1/
│       └── auth.js                  # Auth routes
│
├── validator/
│   └── auth.js                      # Auth validators (Zod)
│
├── middleware/
│   ├── auth.js                      # Auth middleware
│   └── validation.js                # Validation middleware
│
├── utils/
│   ├── jwt.js                       # JWT utilities
│   ├── bcrypt.js                    # Password hashing
│   └── token.js                     # Token generation
│
└── exception/
    ├── unauthorized-error.js        # UnauthorizedError
    └── validation-error.js          # ValidationError
```

---

## 📝 CODE EXAMPLES (Simplified Naming)

### 1. DTO - register.js

```javascript
// src/dto/auth/register.js
const { z } = require('zod');

const RegisterRestaurantSchema = z.object({
  ownerName: z.string().min(2).max(100),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8).max(100),
  ownerPhone: z.string().regex(/^[0-9]{10,11}$/),
  restaurantName: z.string().min(2).max(200),
  businessType: z.enum(['RESTAURANT', 'CAFE', 'BAR', 'FAST_FOOD']),
  taxCode: z.string().optional(),
  address: z.string().min(10).max(500),
});

module.exports = {
  RegisterRestaurantSchema,
};
```

### 2. Use Case - register-restaurant.js

```javascript
// src/use-cases/auth/register-restaurant.js
const { hashPassword } = require('../../utils/bcrypt');
const { generateToken } = require('../../utils/token');
const { ValidationError } = require('../../exception/validation-error');

class RegisterRestaurantUseCase {
  constructor(userRepository, restaurantRepository, emailService, prisma) {
    this.userRepository = userRepository;
    this.restaurantRepository = restaurantRepository;
    this.emailService = emailService;
    this.prisma = prisma;
  }

  async execute(dto) {
    // 1. Validate unique email
    const existingUser = await this.userRepository.findByEmail(dto.ownerEmail);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // 2. Start transaction
    return await this.prisma.$transaction(async (tx) => {
      // 3. Create restaurant
      const restaurant = await this.restaurantRepository.create({
        name: dto.restaurantName,
        businessType: dto.businessType,
        taxCode: dto.taxCode,
        address: dto.address,
        status: 'PENDING_VERIFICATION',
      }, tx);

      // 4. Hash password
      const hashedPassword = await hashPassword(dto.ownerPassword);

      // 5. Create owner user
      const user = await this.userRepository.create({
        email: dto.ownerEmail,
        password: hashedPassword,
        fullName: dto.ownerName,
        phone: dto.ownerPhone,
        role: 'OWNER',
        restaurantId: restaurant.id,
        emailVerified: false,
      }, tx);

      // 6. Generate verification token
      const verificationToken = generateToken({ 
        userId: user.id, 
        type: 'EMAIL_VERIFICATION' 
      });
      
      // 7. Store token
      await this.userRepository.saveVerificationToken(
        user.id, 
        verificationToken, 
        tx
      );

      // 8. Send verification email
      this.emailService.sendVerificationEmail(
        dto.ownerEmail,
        dto.ownerName,
        verificationToken
      ).catch(err => console.error('Email error:', err));

      return {
        userId: user.id,
        restaurantId: restaurant.id,
        email: user.email,
        message: 'Registration successful. Please verify your email.',
        verificationEmailSent: true,
      };
    });
  }
}

module.exports = { RegisterRestaurantUseCase };
```

### 3. Repository - user.js

```javascript
// src/repository/user.js
class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    return client.user.create({ data });
  }

  async update(id, data) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async saveVerificationToken(userId, token, tx) {
    const client = tx || this.prisma;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    return client.verificationToken.create({
      data: {
        userId,
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      },
    });
  }
}

module.exports = { UserRepository };
```

### 4. Controller - auth.js

```javascript
// src/controller/auth.js
const { RegisterRestaurantSchema } = require('../dto/auth/register');

class AuthController {
  constructor(registerRestaurantUseCase, loginUseCase, /* ... */) {
    this.registerRestaurantUseCase = registerRestaurantUseCase;
    this.loginUseCase = loginUseCase;
  }

  async registerRestaurant(req, res, next) {
    try {
      const dto = RegisterRestaurantSchema.parse(req.body);
      const result = await this.registerRestaurantUseCase.execute(dto);
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };
```

### 5. Routes - auth.js

```javascript
// src/routes/v1/auth.js
const express = require('express');
const { validateRequest } = require('../../middleware/validation');
const { RegisterRestaurantSchema } = require('../../dto/auth/register');
const { LoginSchema } = require('../../dto/auth/login');

function createAuthRoutes(authController) {
  const router = express.Router();

  // POST /api/v1/auth/register
  router.post(
    '/register',
    validateRequest(RegisterRestaurantSchema),
    (req, res, next) => authController.registerRestaurant(req, res, next)
  );

  // POST /api/v1/auth/login
  router.post(
    '/login',
    validateRequest(LoginSchema),
    (req, res, next) => authController.login(req, res, next)
  );

  // POST /api/v1/auth/refresh-token
  router.post('/refresh-token', (req, res, next) => 
    authController.refreshToken(req, res, next)
  );

  // POST /api/v1/auth/logout
  router.post('/logout', (req, res, next) => 
    authController.logout(req, res, next)
  );

  return router;
}

module.exports = { createAuthRoutes };
```

### 6. Utils - jwt.js

```javascript
// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../exception/unauthorized-error');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function generateJWT(payload, expiresIn) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}

module.exports = {
  generateJWT,
  verifyJWT,
};
```

### 7. Utils - bcrypt.js

```javascript
// src/utils/bcrypt.js
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
```

---

## 📊 COMPARISON

### ❌ Old (Complex)
```
RegisterRestaurantUseCase.ts
LoginUseCase.ts
UserRepository.ts
jwt.util.ts
bcrypt.util.ts
UnauthorizedError.ts
```

### ✅ New (Simple)
```
register-restaurant.js
login.js
user.js
jwt.js
bcrypt.js
unauthorized-error.js
```

---

## 🎯 BENEFITS

1. **Dễ đọc hơn:** `login.js` thay vì `LoginUseCase.ts`
2. **Ngắn gọn hơn:** `user.js` thay vì `UserRepository.ts`
3. **Ít typing hơn:** Không cần gõ `.entity`, `.dto`, `.util`
4. **Folder structure rõ ràng:** Biết ngay file ở folder nào
5. **JavaScript friendly:** Không cần TypeScript

---

## 🚀 FINAL STRUCTURE

```
src/
├── configuration/       # Config
├── controller/          # Controllers
├── dto/                 # DTOs
├── entities/            # Domain entities
├── exception/           # Errors
├── mapper/              # Mappers
├── repository/          # Repositories
├── service/             # Services
├── utils/               # Utils
├── validator/           # Validators
├── middleware/          # Middleware
├── routes/              # Routes
└── use-cases/           # Use Cases ⭐
```

**Clean, simple, và dễ maintain!** 🎉
