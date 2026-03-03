/**
 * Express Application Setup
 * Main application configuration
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

// Services
const { TokenService } = require('./service/token');
const { EmailService } = require('./service/email');

// Repositories
const { UserRepository } = require('./repository/user');
const { RestaurantRepository } = require('./repository/restaurant');
const { BranchRepository } = require('./repository/branch');

// Use cases
const { LoginUseCase } = require('./use-cases/auth/login');
const { RefreshTokenUseCase } = require('./use-cases/auth/refresh-token');
const { ChangePasswordUseCase } = require('./use-cases/auth/change-password');
const { RegisterRestaurantUseCase } = require('./use-cases/auth/register-restaurant');

const { GetRestaurantDetailsUseCase } = require('./use-cases/restaurant/get-details');

// Controllers
const { AuthController } = require('./controller/auth');
const { RestaurantController } = require('./controller/restaurant');

// Routes
const { createAuthRoutes } = require('./routes/v1/auth');
const { createRestaurantRoutes } = require('./routes/v1/restaurants');

// Middleware
const { createAuthMiddleware } = require('./middleware/auth');

function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // Prisma
  const prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
    log: ['error', 'warn'],
  });

  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  // Services
  const tokenService = new TokenService();
  const emailService = new EmailService();

  // Repos
  const userRepository = new UserRepository(prisma);
  const restaurantRepository = new RestaurantRepository(prisma);
  const branchRepository = new BranchRepository(prisma);

  // Use cases (auth)
  const loginUseCase = new LoginUseCase(userRepository, tokenService);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepository, tokenService);
  const registerRestaurantUseCase = new RegisterRestaurantUseCase(
    userRepository,
    restaurantRepository,
    emailService,
    prisma
  );

  // Auth middleware
  const authMiddleware = createAuthMiddleware(tokenService);

  // Controller (auth) — signature đúng với controller hiện tại của bạn
  const authController = new AuthController(
    loginUseCase,
    registerRestaurantUseCase,
    refreshTokenUseCase,
    null, // logoutUseCase - TODO
    changePasswordUseCase
  );

  // Use case + controller (restaurants)
  const getRestaurantDetailsUseCase = new GetRestaurantDetailsUseCase(restaurantRepository, branchRepository);
  const restaurantController = new RestaurantController(getRestaurantDetailsUseCase);

  // Routes
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'FoodStack API Server',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        restaurants: '/api/v1/restaurants',
        health: '/health',
      },
    });
  });

  app.get('/health', (req, res) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', createAuthRoutes(authController, authMiddleware));
  app.use('/api/v1/restaurants', createRestaurantRoutes(restaurantController));

  // 404
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found', path: req.path });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  return app;
}

module.exports = { createApp };