/**
 * Express Application Setup
 * Main application configuration
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

// Import services
const { TokenService } = require('./service/token');

// Import repositories
const { UserRepository } = require('./repository/user');

// Import use cases
const { LoginUseCase } = require('./use-cases/auth/login');

// Import controllers
const { AuthController } = require('./controller/auth');

// Import routes
const { createAuthRoutes } = require('./routes/v1/auth');

const { RefreshTokenUseCase } = require('./use-cases/auth/refresh-token');

const { ChangePasswordUseCase } = require('./use-cases/auth/change-password');
const { createAuthMiddleware } = require('./middleware/auth');

/**
 * Create Express application
 */
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

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // Initialize dependencies
  const prisma = new PrismaClient();
  const tokenService = new TokenService();

  // Initialize repositories
  const userRepository = new UserRepository(prisma);

  // Initialize use cases
  const loginUseCase = new LoginUseCase(userRepository, tokenService);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepository, tokenService);
  const authMiddleware = createAuthMiddleware(tokenService);

  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);

  // Initialize controllers
  const authController = new AuthController(
    loginUseCase,
    null, // registerRestaurantUseCase - TODO
    refreshTokenUseCase, // refreshTokenUseCase - TODO
    null,  // logoutUseCase - TODO
    changePasswordUseCase
  );

  // Routes
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'FoodStack API Server',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        health: '/health',
      },
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/v1/auth', createAuthRoutes(authController, authMiddleware));

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.path,
    });
  });

  // Error Handler
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
