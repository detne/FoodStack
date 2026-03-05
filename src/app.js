// Use cases
const { GetRestaurantDetailsUseCase } = require('./use-cases/restaurant/get-details');
const { UploadRestaurantLogoUseCase } = require('./use-cases/restaurant/upload-logo');
const { CreateRestaurantUseCase } = require('./use-cases/restaurant/create-restaurant');
const { UpdateRestaurantUseCase } = require('./use-cases/restaurant/update-restaurant'); // ✅ FIX IMPORT

// ... trong createApp()

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

  const updateRestaurantUseCase = new UpdateRestaurantUseCase(
    prisma,
    restaurantRepository,
    userRepository,
    branchRepository
  ); 
  // 👆 tuỳ constructor thật của bạn. Nếu UpdateRestaurantUseCase chỉ cần prisma thì để new UpdateRestaurantUseCase(prisma)

  // ✅ Restaurant controller inject đủ use cases
  const restaurantController = new RestaurantController({
    getRestaurantDetailsUseCase,
    uploadRestaurantLogoUseCase,
    createRestaurantUseCase,
    updateRestaurantUseCase,
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

  // ✅ Initialize menu item use cases
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

  const deleteMenuItemUseCase = new DeleteMenuItemUseCase(
    menuItemRepository,
    userRepository
  );

  const uploadMenuItemImageUseCase = new UploadMenuItemImageUseCase(
    menuItemRepository,
    uploadService,
    userRepository
  );

  // ✅ Menu item controller
  const menuItemController = new MenuItemController({
    createMenuItemUseCase,
    updateMenuItemUseCase,
    deleteMenuItemUseCase,
    uploadMenuItemImageUseCase,
  });