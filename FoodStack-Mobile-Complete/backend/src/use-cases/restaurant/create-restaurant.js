// src/use-cases/restaurant/create-restaurant.js

const { v4: uuidv4 } = require('uuid');
const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class CreateRestaurantUseCase {
  constructor(restaurantRepository, userRepository, branchRepository, prisma) {
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
    this.branchRepository = branchRepository;
    this.prisma = prisma;
  }

  async execute(dto) {
    // Validate: Owner có thể tạo restaurant
    // Kiểm tra user tồn tại và có role OWNER
    const owner = await this.userRepository.findById(dto.ownerId);
    if (!owner) {
      throw new UnauthorizedError('User not found');
    }

    if (owner.role !== 'OWNER') {
      throw new UnauthorizedError('Only owners can create restaurants');
    }

    // Validate: Email không trùng (nếu có)
    if (dto.email) {
      const existingRestaurant = await this.prisma.restaurants.findFirst({
        where: {
          email: dto.email,
          deleted_at: null,
        },
      });

      if (existingRestaurant) {
        throw new ValidationError('Email already registered for another restaurant');
      }
    }

    // Transaction: Tạo restaurant + default branch + default settings
    return await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const restaurantId = uuidv4();
      const branchId = uuidv4();

      // 1. Create restaurant
      const restaurant = await tx.restaurants.create({
        data: {
          id: restaurantId,
          name: dto.name,
          email: dto.email,
          phone: dto.phone || null,
          address: dto.address || null,
          logo_url: dto.logoUrl || null,
          email_verified: false,
          created_at: now,
          updated_at: now,
        },
      });

      // 2. Create default main branch
      const branch = await tx.branches.create({
        data: {
          id: branchId,
          restaurant_id: restaurantId,
          name: 'Main Branch',
          address: dto.address || 'Default Address',
          phone: dto.phone || null,
          created_at: now,
          updated_at: now,
        },
      });

      // 3. Update owner's restaurant_id (link owner to restaurant)
      await tx.users.update({
        where: { id: dto.ownerId },
        data: {
          restaurant_id: restaurantId,
          updated_at: now,
        },
      });

      // 4. Create default subscription (BASIC plan, 30 days trial)
      const subscriptionId = uuidv4();
      const startDate = now;
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const subscription = await tx.subscriptions.create({
        data: {
          id: subscriptionId,
          restaurant_id: restaurantId,
          plan_type: 'BASIC',
          start_date: startDate,
          end_date: endDate,
          max_branches: 1,
          max_tables: 10,
          created_at: now,
          updated_at: now,
        },
      });

      return {
        restaurantId: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        logoUrl: restaurant.logo_url,
        defaultBranchId: branch.id,
        defaultBranchName: branch.name,
        subscriptionId: subscription.id,
        subscriptionPlan: subscription.plan_type,
        subscriptionStatus: subscription.status,
        createdAt: restaurant.created_at,
      };
    });
  }
}

module.exports = { CreateRestaurantUseCase };
