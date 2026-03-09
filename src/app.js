/**
 * Express Application Setup
 * Main application configuration
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

// Services
const { TokenService } = require('./service/token');
const { EmailService } = require('./service/email');
const { UploadService } = require('./service/upload');

// Repositories
const { UserRepository } = require('./repository/user');
const { RestaurantRepository } = require('./repository/restaurant');
const { BranchRepository } = require('./repository/branch');
const { CategoryRepository } = require('./repository/category');
const { MenuItemRepository } = require('./repository/menu-item');

// Use cases
const { LoginUseCase } = require('./use-cases/auth/login');
const { ForgotPasswordUseCase } = require('./use-cases/auth/forgot-password');
const { ResetPasswordUseCase } = require('./use-cases/auth/reset-password');
const { RefreshTokenUseCase } = require('./use-cases/auth/refresh-token');
const { ChangePasswordUseCase } = require('./use-cases/auth/change-password');
const { RegisterRestaurantUseCase } = require('./use-cases/auth/register-restaurant');
const { VerifyEmailOtpUseCase } = require('./use-cases/auth/verify-email-otp');

const { GetRestaurantDetailsUseCase } = require('./use-cases/restaurant/get-details');
const { UploadRestaurantLogoUseCase } = require('./use-cases/restaurant/upload-logo');
const { CreateRestaurantUseCase } = require('./use-cases/restaurant/create-restaurant');
const { UpdateRestaurantUseCase } = require('./dto/restaurant/update-restaurant');
const { GetRestaurantStatisticsUseCase } = require('./dto/restaurant/get-restaurant-statistics');
const { DeleteRestaurantUseCase } = require('./use-cases/restaurant/delete');

const { GetFullMenuByBranchUseCase } = require('./use-cases/branch/get-full-menu');

const { CreateCategoryUseCase } = require('./use-cases/category/create-category');
const { UpdateCategoryUseCase } = require('./use-cases/category/update-category');
const { DeleteCategoryUseCase } = require('./use-cases/category/delete-category');

const { CreateBranchUseCase } = require('./use-cases/branch/create');
const { UpdateBranchUseCase } = require('./use-cases/branch/update');
const { ListBranchesUseCase } = require('./use-cases/branch/list');
const { DeleteBranchUseCase } = require('./use-cases/branch/delete');
const { GetBranchDetailsUseCase } = require('./use-cases/branch/get-details');

// Controllers
const { AuthController } = require('./controller/auth');
const { RestaurantController } = require('./controller/restaurant');
const { BranchController } = require('./controller/branch');
const { CategoryController } = require('./controller/category');

// Routes
const { createAuthRoutes } = require('./routes/v1/auth');
const { createRestaurantRoutes } = require('./routes/v1/restaurant');
const { createBranchRoutes } = require('./routes/v1/branches');
const { createCategoryRoutes } = require('./routes/v1/category');
const { createPublicRoutes } = require('./routes/v1/public');
const { createCustomerOrderRoutes } = require('./routes/v1/customer-orders');

// Middleware
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

  // Prisma
  const prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
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
  const branchRepository = new BranchRepository(prisma);
  const categoryRepository = new CategoryRepository(prisma);
  const menuItemRepository = new MenuItemRepository(prisma);

  const getRestaurantStatisticsUseCase = new GetRestaurantStatisticsUseCase(prisma);

  // Initialize auth use cases
  const loginUseCase = new LoginUseCase(userRepository, tokenService);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepository, tokenService);
  const verifyEmailOtpUseCase = new VerifyEmailOtpUseCase(userRepository, prisma);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, emailService);
  const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);
  const registerRestaurantUseCase = new RegisterRestaurantUseCase(
    userRepository,
    restaurantRepository,
    emailService,
    prisma
  );

  // Initialize branches use cases
  const createBranchUseCase = new CreateBranchUseCase(branchRepository, restaurantRepository);
  const updateBranchUseCase = new UpdateBranchUseCase(branchRepository);
  const listBranchesUseCase = new ListBranchesUseCase(branchRepository, restaurantRepository);
  const deleteBranchUseCase = new DeleteBranchUseCase(branchRepository);
  const getBranchDetailsUseCase = new GetBranchDetailsUseCase(branchRepository);

  // Auth middleware
  const authMiddleware = createAuthMiddleware(tokenService);

  // Initialize controllers (auth)
  const authController = new AuthController(
    loginUseCase,
    registerRestaurantUseCase,
    refreshTokenUseCase,
    null, // logoutUseCase - TODO
    forgotPasswordUseCase,
    resetPasswordUseCase,
    changePasswordUseCase,
    verifyEmailOtpUseCase
  );

  // ✅ Initialize restaurant use cases
  const getRestaurantDetailsUseCase = new GetRestaurantDetailsUseCase(
    restaurantRepository,
    branchRepository
  );

  const uploadRestaurantLogoUseCase = new UploadRestaurantLogoUseCase(
    restaurantRepository,
    uploadService
  );

  const createRestaurantUseCase = new CreateRestaurantUseCase(
    restaurantRepository,
    userRepository,
    branchRepository,
    prisma
  );

  const updateRestaurantUseCase = new UpdateRestaurantUseCase(prisma);

  // branch menu use case
  const getFullMenuByBranchUseCase = new GetFullMenuByBranchUseCase(
    branchRepository,
    categoryRepository,
    menuItemRepository
  );

  // ✅ Restaurant controller inject đủ 4 use cases (object)
  const deleteRestaurantUseCase = new DeleteRestaurantUseCase(restaurantRepository);

  // ✅ Restaurant controller inject đủ use cases (object)
  const restaurantController = new RestaurantController({
    getRestaurantDetailsUseCase,
    uploadRestaurantLogoUseCase,
    createRestaurantUseCase,
    updateRestaurantUseCase,
    getRestaurantStatisticsUseCase,
    deleteRestaurantUseCase,
  });

  // ✅ Initialize category use cases
  const createCategoryUseCase = new CreateCategoryUseCase(
    categoryRepository,
    branchRepository,
    userRepository
  );

  const updateCategoryUseCase = new UpdateCategoryUseCase(
    categoryRepository,
    userRepository
  );

  const deleteCategoryUseCase = new DeleteCategoryUseCase(
    categoryRepository,
    userRepository
  );

  // ✅ Category controller
  const categoryController = new CategoryController({
    createCategoryUseCase,
    updateCategoryUseCase,
    deleteCategoryUseCase,
  });

  const branchController = new BranchController({
    createBranchUseCase,
    updateBranchUseCase,
    listBranchesUseCase,
    deleteBranchUseCase,
    getBranchDetailsUseCase,
    getFullMenuByBranchUseCase,
  });

  // Routes
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'FoodStack API Server',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        restaurants: '/api/v1/restaurants',
        categories: '/api/v1/categories',
        public: '/api/v1/public',
        customerOrders: '/api/v1/customer-orders',
        health: '/health',
      },
    });
  });

  app.get('/health', (req, res) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/auth', createAuthRoutes(authController, authMiddleware));
  app.use('/api/v1/restaurants', createRestaurantRoutes(restaurantController, authMiddleware));

  app.use('/api/v1/branches', createBranchRoutes(branchController, authMiddleware));
  // ✅ Category routes
  app.use('/api/v1/categories', createCategoryRoutes(categoryController, authMiddleware));
  app.use('/api/v1/public', createPublicRoutes(prisma));
  app.use('/api/v1/customer-orders', createCustomerOrderRoutes(prisma));

  // branch menu endpoint (public)
  app.use('/api/v1/branches', createBranchRoutes(branchController));

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