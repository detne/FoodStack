/**
 * Express Application Setup
 * Main application configuration
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

// Import services
const { TokenService } = require('./service/token');
const { EmailService } = require('./service/email');
const { UploadService } = require('./service/upload');

// Import repositories
const { UserRepository } = require('./repository/user');
const { RestaurantRepository } = require('./repository/restaurant');

// Import use cases
const { LoginUseCase } = require('./use-cases/auth/login');
const { RegisterRestaurantUseCase } = require('./use-cases/auth/register-restaurant');
const { UploadRestaurantLogoUseCase } = require('./use-cases/restaurant/upload-logo');

// Import controllers
const { AuthController } = require('./controller/auth');
const { RestaurantController } = require('./controller/restaurant');

// Import routes
const { createAuthRoutes } = require('./routes/v1/auth');
const { createRestaurantRoutes } = require('./routes/v1/restaurant');

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
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  // Handle Prisma disconnect on app shutdown
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
  
  const tokenService = new TokenService();
  const emailService = new EmailService();
  const uploadService = new UploadService();
  
  // Initialize repositories
  const userRepository = new UserRepository(prisma);
  const restaurantRepository = new RestaurantRepository(prisma);
  
  // Initialize use cases
  const loginUseCase = new LoginUseCase(userRepository, tokenService);
  const registerRestaurantUseCase = new RegisterRestaurantUseCase(
    userRepository,
    restaurantRepository,
    emailService,
    prisma
  );
  const uploadRestaurantLogoUseCase = new UploadRestaurantLogoUseCase(
    restaurantRepository,
    uploadService
  );
  
  // Initialize controllers
  const authController = new AuthController(
    loginUseCase,
    registerRestaurantUseCase,
    null, // refreshTokenUseCase - TODO
    null, // logoutUseCase - TODO
    null, // forgotPasswordUseCase - TODO
    null  // resetPasswordUseCase - TODO
  );
  const restaurantController = new RestaurantController(uploadRestaurantLogoUseCase);
  
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
  app.use('/api/v1/auth', createAuthRoutes(authController));
  app.use('/api/v1/restaurants', createRestaurantRoutes(restaurantController));

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
