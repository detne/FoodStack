/**
 * Express Application Setup
 * Main application configuration
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { prisma } = require('./config/database.config'); // Use singleton Prisma from config

// Services
const { TokenService } = require('./service/token');
const { EmailService } = require('./service/email');
const { UploadService } = require('./service/upload');
const { QrService } = require('./service/qr');
const { CloudinaryUploadService } = require('./service/cloudinary-upload');

// Repositories
const { UserRepository } = require('./repository/user');
const { RestaurantRepository } = require('./repository/restaurant');
const { BranchRepository } = require('./repository/branch');
const { CategoryRepository } = require('./repository/category');
const { AreaRepository } = require('./repository/area');
const { MenuItemRepository } = require('./repository/menu-item');
const { CustomizationRepository } = require('./repository/customization');
const { ReservationRepository } = require('./repository/reservation');
const { TableRepository } = require('./repository/table');
const { OrderRepository } = require('./repository/order');

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

const { CreateAreaUseCase } = require('./use-cases/area/create-area');
const { GetListAreaUseCase } = require('./use-cases/area/list-by-branch');
const { UpdateAreaUseCase } = require('./use-cases/area/update-area');
const { DeleteAreaUseCase } = require('./use-cases/area/delete-area');

const { CreateTableUseCase } = require('./use-cases/table/create');
const { UpdateTableUseCase } = require('./use-cases/table/update');
const { DeleteTableUseCase } = require('./use-cases/table/delete');

const { CreateMenuItemUseCase } = require('./use-cases/menu-item/create-menu-item');
const { UpdateMenuItemUseCase } = require('./use-cases/menu-item/update-menu-item');
const { DeleteMenuItemUseCase } = require('./use-cases/menu-item/delete-menu-item');
const { UploadMenuItemImageUseCase } = require('./use-cases/menu-item/upload-menu-item-image');
const { UpdateMenuItemAvailabilityUseCase } = require('./use-cases/menu-item/update-availability');
const { SearchMenuItemsUseCase } = require('./use-cases/menu-item/search-menu-items');

const { CreateCustomizationGroupUseCase } = require('./use-cases/customization/create-customization-group');
const { AddCustomizationOptionUseCase } = require('./use-cases/customization/add-customization-option');

const { CreateStaffUseCase } = require('./use-cases/staff/create-staff');
const { UpdateStaffUseCase } = require('./use-cases/staff/update-staff');
const { UpdateStaffRoleUseCase } = require('./use-cases/staff/update-staff-role');
const { DeleteStaffUseCase } = require('./use-cases/staff/delete-staff');

const { CreateReservationUseCase } = require('./use-cases/reservation/create-reservation');
const { UpdateReservationUseCase } = require('./use-cases/reservation/update-reservation');
const { CancelReservationUseCase } = require('./use-cases/reservation/cancel-reservation');
const { ConfirmReservationUseCase } = require('./use-cases/reservation/confirm-reservation');
const { GetReservationDetailsUseCase } = require('./use-cases/reservation/get-details');
const { ListReservationsUseCase } = require('./use-cases/reservation/list-reservations');
const { CheckTableAvailabilityUseCase } = require('./use-cases/reservation/check-availability');

// Controllers
const { AuthController } = require('./controller/auth');
const { StaffController } = require('./controller/staff');
const { RestaurantController } = require('./controller/restaurant');
const { BranchController } = require('./controller/branch');
const { CategoryController } = require('./controller/category');
const { AreaController } = require('./controller/area');
const { MenuItemController } = require('./controller/menu-item');
const { CustomizationController } = require('./controller/customization');
const { ReservationController } = require('./controller/reservation');
const { TableController } = require('./controller/table');

// Routes
const { createAuthRoutes } = require('./routes/v1/auth');
const { createRestaurantRoutes } = require('./routes/v1/restaurant');
const { createBranchRoutes } = require('./routes/v1/branches');
const { createCategoryRoutes } = require('./routes/v1/category');
const { createMenuItemRoutes } = require('./routes/v1/menu-item');
const { createCustomizationRoutes } = require('./routes/v1/customization');
const { createStaffRoutes } = require('./routes/v1/staff');
const { createPublicRoutes } = require('./routes/v1/public');
const { createCustomerOrderRoutes } = require('./routes/v1/customer-orders');

const { createAreaRoutes } = require('./routes/v1/areas');
const { createReservationRoutes } = require('./routes/v1/reservation');
const { createTableRoutes } = require('./routes/v1/tables');

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
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Idempotency-Key, X-Idempotency-Key'
    );

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Use singleton Prisma instance from config
  // No need to create new PrismaClient here

  // Services
  const tokenService = new TokenService();
  const emailService = new EmailService();
  const uploadService = new UploadService();
  const qrService = new QrService();
  const cloudinaryUploadService = new CloudinaryUploadService();

  // Repositories
  const userRepository = new UserRepository(prisma);
  const restaurantRepository = new RestaurantRepository(prisma);
  const branchRepository = new BranchRepository(prisma);
  const categoryRepository = new CategoryRepository(prisma);
  const areaRepository = new AreaRepository(prisma);
  const menuItemRepository = new MenuItemRepository(prisma);
  const customizationRepository = new CustomizationRepository(prisma);
  const reservationRepository = new ReservationRepository(prisma);
  const tableRepository = new TableRepository(prisma);
  const orderRepository = new OrderRepository(prisma);

  // Use cases (misc)
  const getRestaurantStatisticsUseCase = new GetRestaurantStatisticsUseCase(prisma);

  // Auth use cases
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

  // Branch use cases
  const createBranchUseCase = new CreateBranchUseCase(branchRepository, restaurantRepository);
  const updateBranchUseCase = new UpdateBranchUseCase(branchRepository);
  const listBranchesUseCase = new ListBranchesUseCase(branchRepository, restaurantRepository);
  const deleteBranchUseCase = new DeleteBranchUseCase(branchRepository);
  const getBranchDetailsUseCase = new GetBranchDetailsUseCase(branchRepository);

  // Auth middleware
  const authMiddleware = createAuthMiddleware(tokenService);

  // Controllers (auth)
  const authController = new AuthController(
    loginUseCase,
    registerRestaurantUseCase,
    refreshTokenUseCase,
    null,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    changePasswordUseCase,
    verifyEmailOtpUseCase
  );

  // Restaurant use cases
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
  const deleteRestaurantUseCase = new DeleteRestaurantUseCase(restaurantRepository);

  // Branch menu use case
  const getFullMenuByBranchUseCase = new GetFullMenuByBranchUseCase(
    branchRepository,
    categoryRepository,
    menuItemRepository
  );

  // Restaurant controller
  const restaurantController = new RestaurantController({
    getRestaurantDetailsUseCase,
    uploadRestaurantLogoUseCase,
    createRestaurantUseCase,
    updateRestaurantUseCase,
    getRestaurantStatisticsUseCase,
    deleteRestaurantUseCase,
  });

  // Category use cases + controller
  const createCategoryUseCase = new CreateCategoryUseCase(
    categoryRepository,
    branchRepository,
    userRepository
  );
  const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository, userRepository);
  const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository, userRepository);

  const categoryController = new CategoryController({
    createCategoryUseCase,
    updateCategoryUseCase,
    deleteCategoryUseCase,
    categoryRepository,
  });

  // Branch controller
  const branchController = new BranchController({
    createBranchUseCase,
    updateBranchUseCase,
    listBranchesUseCase,
    deleteBranchUseCase,
    getBranchDetailsUseCase,
    getFullMenuByBranchUseCase,
  });

  // Area use cases + controller
  const createAreaUseCase = new CreateAreaUseCase(
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository,
    prisma
  );

  const getListAreaUseCase = new GetListAreaUseCase(
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository
  );

  const updateAreaUseCase = new UpdateAreaUseCase(
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository
  );

  const deleteAreaUseCase = new DeleteAreaUseCase(
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository
  );

  const areaController = new AreaController(
    createAreaUseCase,
    getListAreaUseCase,
    updateAreaUseCase,
    deleteAreaUseCase
  );

  // Menu item use cases + controller
  const createMenuItemUseCase = new CreateMenuItemUseCase(
    menuItemRepository,
    categoryRepository,
    userRepository
  );
  const updateMenuItemUseCase = new UpdateMenuItemUseCase(
    menuItemRepository,
    categoryRepository,
    userRepository
  );
  const deleteMenuItemUseCase = new DeleteMenuItemUseCase(menuItemRepository, userRepository);
  const uploadMenuItemImageUseCase = new UploadMenuItemImageUseCase(
    menuItemRepository,
    uploadService,
    userRepository
  );
  const updateMenuItemAvailabilityUseCase = new UpdateMenuItemAvailabilityUseCase(
    menuItemRepository,
    userRepository
  );
  const searchMenuItemsUseCase = new SearchMenuItemsUseCase(menuItemRepository);

  const menuItemController = new MenuItemController({
    createMenuItemUseCase,
    updateMenuItemUseCase,
    deleteMenuItemUseCase,
    uploadMenuItemImageUseCase,
    updateMenuItemAvailabilityUseCase,
    searchMenuItemsUseCase,
  });

  // Customization use cases + controller
  const createCustomizationGroupUseCase = new CreateCustomizationGroupUseCase(
    menuItemRepository,
    customizationRepository,
    userRepository
  );
  const addCustomizationOptionUseCase = new AddCustomizationOptionUseCase(
    customizationRepository,
    userRepository
  );

  const customizationController = new CustomizationController({
    createCustomizationGroupUseCase,
    addCustomizationOptionUseCase,
  });

  // Staff use cases + controller
  const createStaffUseCase = new CreateStaffUseCase(
    userRepository,
    restaurantRepository,
    branchRepository,
    emailService,
    prisma
  );
  const updateStaffUseCase = new UpdateStaffUseCase(userRepository, prisma);
  const deleteStaffUseCase = new DeleteStaffUseCase(userRepository, tokenService);

  // ✅ Table use case + controller
  const createTableUseCase = new CreateTableUseCase(
    tableRepository,
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository,
    qrService,
    cloudinaryUploadService
  );

  const updateTableUseCase = new UpdateTableUseCase(
    tableRepository,
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository
  );

  const deleteTableUseCase = new DeleteTableUseCase(
    tableRepository,
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository,
    orderRepository
  );

  const tableController = new TableController(createTableUseCase, updateTableUseCase, deleteTableUseCase);

  // Staff use cases with role update
  const updateStaffRoleUseCase = new UpdateStaffRoleUseCase(
    userRepository,
    prisma
  );

  // ✅ Staff controller with all use cases
  const staffController = new StaffController(
    createStaffUseCase,
    updateStaffUseCase,
    updateStaffRoleUseCase,
    deleteStaffUseCase
  );

  // ✅ Initialize reservation use cases
  const createReservationUseCase = new CreateReservationUseCase(
    reservationRepository,
    branchRepository,
    tableRepository
  );

  const updateReservationUseCase = new UpdateReservationUseCase(
    reservationRepository,
    tableRepository
  );

  const cancelReservationUseCase = new CancelReservationUseCase(
    reservationRepository
  );

  const confirmReservationUseCase = new ConfirmReservationUseCase(
    reservationRepository
  );

  const getReservationDetailsUseCase = new GetReservationDetailsUseCase(
    reservationRepository
  );

  const listReservationsUseCase = new ListReservationsUseCase(
    reservationRepository,
    branchRepository
  );

  const checkTableAvailabilityUseCase = new CheckTableAvailabilityUseCase(
    reservationRepository,
    branchRepository
  );

  // ✅ Reservation controller
  const reservationController = new ReservationController({
    createReservationUseCase,
    updateReservationUseCase,
    cancelReservationUseCase,
    confirmReservationUseCase,
    getReservationDetailsUseCase,
    listReservationsUseCase,
    checkTableAvailabilityUseCase,
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
        branches: '/api/v1/branches',
        categories: '/api/v1/categories',
        'menu-items': '/api/v1/menu-items',
        customizations: '/api/v1/customizations',
        staff: '/api/v1/staff',
        areas: '/api/v1/areas',
        reservations: '/api/v1/reservations',
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

  app.use('/api/v1/branches', createBranchRoutes(branchController, areaController, authMiddleware));

  // Areas routes (PATCH/DELETE /areas/:areaId)
  app.use('/api/v1/areas', createAreaRoutes(areaController, authMiddleware));

  // ✅ Tables routes (POST /areas/:areaId/tables)
  app.use('/api/v1', createTableRoutes(tableController, authMiddleware));

  // Category/menu/customization/staff
  app.use('/api/v1/categories', createCategoryRoutes(categoryController, authMiddleware));
  app.use('/api/v1/menu-items', createMenuItemRoutes(menuItemController, authMiddleware));
  app.use('/api/v1/customizations', createCustomizationRoutes(customizationController, authMiddleware));
  app.use('/api/v1/staff', createStaffRoutes(staffController, authMiddleware));
  app.use('/api/v1/reservations', createReservationRoutes(reservationController, authMiddleware));
  app.use('/api/v1/public', createPublicRoutes(prisma));
  app.use('/api/v1/customer-orders', createCustomerOrderRoutes(prisma));

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