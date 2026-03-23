const { z } = require('zod');
const { AppError } = require('../../core/errors/AppError');

/**
 * DTO (Body) - update restaurant info
 * - Chỉ owner mới có thể update
 * - Validate các field được phép update
 * - Logo có thể là URL hoặc file upload
 */
const UpdateRestaurantSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone format').optional(),
    address: z.string().max(255).optional(),
    logo_url: z.string().url('Invalid logo URL').optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  );

class UpdateRestaurantUseCase {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * @param {Object} dto - Update data
   * @param {string} restaurantId - Restaurant ID from URL params
   * @param {Object} context - User context
   * @param {string} context.userId
   * @param {string} context.role
   * @param {string} context.restaurantId - User's restaurant ID
   * @returns {Promise<Object>} Updated restaurant data
   */
  async execute(dto, restaurantId, context) {
    // Chỉ owner mới có thể update restaurant
    if (context.role !== 'OWNER') {
      throw new AppError('Forbidden: Only restaurant owner can update restaurant info', 403);
    }

    if (!restaurantId) {
      throw new AppError('Restaurant ID is required', 400);
    }

    // Verify user sở hữu restaurant này (security check)
    if (context.restaurantId !== restaurantId) {
      throw new AppError('Forbidden: You do not have access to this restaurant', 403);
    }

    // Validate input data
    const validatedData = UpdateRestaurantSchema.parse(dto);

    // Kiểm tra restaurant tồn tại
    const existingRestaurant = await this.prisma.restaurants.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        logo_url: true,
      },
    });

    if (!existingRestaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    // Kiểm tra email unique nếu có thay đổi email
    if (validatedData.email && validatedData.email !== existingRestaurant.email) {
      const emailExists = await this.prisma.restaurants.findUnique({
        where: { email: validatedData.email },
      });
      if (emailExists) {
        throw new AppError('Email already in use by another restaurant', 409);
      }
    }

    // Prepare update data - chỉ update fields được provide
    const updateData = {};
    const oldValues = {};
    const newValues = {};

    // Define allowed fields
    const allowedFields = ['name', 'email', 'phone', 'address', 'logo_url'];

    allowedFields.forEach(key => {
      if (validatedData[key] !== undefined) {
        updateData[key] = validatedData[key];
        oldValues[key] = existingRestaurant[key];
        newValues[key] = validatedData[key];
      }
    });

    // Update restaurant
    const updatedRestaurant = await this.prisma.restaurants.update({
      where: { id: restaurantId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        logo_url: true,
        updated_at: true,
      },
    });

    // Log activity
    await this.prisma.activity_logs.create({
      data: {
        user_id: context.userId,
        restaurant_id: restaurantId,
        action: 'UPDATE',
        entity_type: 'RESTAURANT',
        entity_id: restaurantId,
        old_values: oldValues,
        new_values: newValues,
        created_at: new Date(),
      },
    });

    return {
      restaurant: updatedRestaurant,
      message: 'Restaurant updated successfully',
    };
  }
}

module.exports = {
  UpdateRestaurantUseCase,
  UpdateRestaurantSchema,
};