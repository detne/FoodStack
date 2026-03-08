/**
 * Branch Controller
 * Handles branch management endpoints
 */

class BranchController {
  constructor(branchRepository, prisma) {
    this.branchRepository = branchRepository;
    this.prisma = prisma;
  }

  /**
   * Get all branches for a restaurant
   */
  async list(req, res, next) {
    try {
      const { restaurant_id } = req.query;
      const userId = req.user?.userId; // From JWT payload

      // Get user's restaurant if not provided
      let restaurantId = restaurant_id;
      if (!restaurantId && userId) {
        const user = await this.prisma.users.findUnique({
          where: { id: userId },
          select: { restaurant_id: true },
        });
        restaurantId = user?.restaurant_id;
      }

      // If still no restaurant_id, try from JWT payload
      if (!restaurantId) {
        restaurantId = req.user?.restaurantId;
      }

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID is required. Please complete restaurant setup first.',
        });
      }

      const branches = await this.branchRepository.findByRestaurantId(restaurantId);

      // Return branches with basic info (skip stats for now to avoid complexity)
      const branchesWithStats = branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        status: branch.status || 'ACTIVE',
        created_at: branch.created_at,
        updated_at: branch.updated_at,
        tables_count: 0, // TODO: Calculate via areas
        staff_count: 0,  // TODO: Calculate
        orders_today: 0, // TODO: Calculate
        revenue_today: 0, // TODO: Calculate
      }));

      res.json({
        success: true,
        data: branchesWithStats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single branch details
   */
  async getDetails(req, res, next) {
    try {
      const { id } = req.params;

      const branch = await this.branchRepository.findById(id);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      res.json({
        success: true,
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new branch
   */
  async create(req, res, next) {
    try {
      const userId = req.user?.userId; // From JWT payload
      const {
        name,
        address,
        city,
        state,
        zip_code,
        country,
        phone,
        email,
        status,
        opening_time,
        closing_time,
        manager_name,
        manager_phone,
        manager_email,
        description,
      } = req.body;

      // Get user's restaurant - use userId from JWT
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { restaurant_id: true, email: true },
      });

      console.log('[DEBUG] User found:', { userId, email: user?.email, restaurant_id: user?.restaurant_id });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!user.restaurant_id) {
        return res.status(400).json({
          success: false,
          message: 'User must belong to a restaurant. Please complete restaurant setup first.',
        });
      }

      // Create branch
      const { v4: uuidv4 } = require('uuid');
      const branch = await this.prisma.branches.create({
        data: {
          id: uuidv4(),
          restaurant_id: user.restaurant_id,
          name,
          address,
          phone,
          status: status || 'ACTIVE',
          updated_at: new Date(),
        },
      });

      res.status(201).json({
        success: true,
        data: branch,
        message: 'Branch created successfully',
      });
    } catch (error) {
      console.error('[ERROR] Create branch failed:', error);
      next(error);
    }
  }

  /**
   * Update branch
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if branch exists
      const existingBranch = await this.branchRepository.findById(id);
      if (!existingBranch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      // Update branch using repository
      const branch = await this.branchRepository.update(id, {
        ...updateData,
        updated_at: new Date(),
      });

      res.json({
        success: true,
        data: branch,
        message: 'Branch updated successfully',
      });
    } catch (error) {
      console.error('[ERROR] Update branch failed:', error);
      next(error);
    }
  }

  /**
   * Delete branch
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Check if branch exists
      const existingBranch = await this.branchRepository.findById(id);
      if (!existingBranch) {
        return res.status(404).json({
          success: false,
          message: 'Branch not found',
        });
      }

      // Soft delete using repository
      await this.branchRepository.delete(id);

      res.json({
        success: true,
        message: 'Branch deleted successfully',
      });
    } catch (error) {
      console.error('[ERROR] Delete branch failed:', error);
      next(error);
    }
  }
}

module.exports = BranchController;
