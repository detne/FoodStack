const { NotFoundError, ForbiddenError, BadRequestError } = require('../../exception/http-errors');
const { v4: uuidv4 } = require('uuid');

class PublishBranchUseCase {
  constructor(branchRepository, restaurantRepository, menuItemRepository, prisma) {
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.menuItemRepository = menuItemRepository;
    this.prisma = prisma;
  }

  async execute(branchId, isPublished, context) {
    const { userId, role } = context;

    // Get branch details
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    // Get restaurant details to verify ownership
    const restaurant = await this.restaurantRepository.findById(branch.restaurant_id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    // Verify user owns this branch
    if (restaurant.owner_id !== userId) {
      throw new ForbiddenError('You do not have permission to publish/unpublish this branch');
    }

    // If publishing, validate branch has required information
    if (isPublished) {
      await this.validateBranchForPublishing(branch);
    }

    // Update branch publish status
    const updatedBranch = await this.updateBranchPublishStatus(branchId, isPublished);

    // Generate public URL if published
    const publicUrl = isPublished && updatedBranch.slug 
      ? `${process.env.PUBLIC_BASE_URL || 'https://yourapp.com'}/r/${updatedBranch.slug}`
      : null;

    // Log activity
    await this.logActivity({
      userId,
      restaurantId: restaurant.id,
      branchId,
      action: isPublished ? 'PUBLISH_BRANCH' : 'UNPUBLISH_BRANCH',
      entityType: 'BRANCH',
      entityId: branchId,
      oldValues: { is_published: branch.is_published },
      newValues: { is_published: isPublished }
    });

    return {
      branchId: updatedBranch.id,
      isPublished: updatedBranch.is_published,
      publicUrl
    };
  }

  async validateBranchForPublishing(branch) {
    const errors = [];

    // Check basic information
    if (!branch.name || branch.name.trim() === '') {
      errors.push('Branch name is required');
    }

    if (!branch.address || branch.address.trim() === '') {
      errors.push('Branch address is required');
    }

    if (!branch.slug || branch.slug.trim() === '') {
      errors.push('Branch slug is required');
    }

    // Check if branch has at least one menu item
    const menuItemCount = await this.getMenuItemCount(branch.id);
    if (menuItemCount === 0) {
      errors.push('Branch must have at least one menu item to be published');
    }

    // Check if branch has at least one category with menu items
    const categoryCount = await this.getCategoryWithMenuItemsCount(branch.id);
    if (categoryCount === 0) {
      errors.push('Branch must have at least one category with menu items to be published');
    }

    if (errors.length > 0) {
      throw new BadRequestError(`Cannot publish branch: ${errors.join(', ')}`);
    }
  }

  async getMenuItemCount(branchId) {
    try {
      const count = await this.prisma.menu_items.count({
        where: {
          categories: {
            branch_id: branchId
          },
          deleted_at: null,
          available: true
        }
      });
      return count;
    } catch (error) {
      console.error('Error counting menu items:', error);
      return 0;
    }
  }

  async getCategoryWithMenuItemsCount(branchId) {
    try {
      const count = await this.prisma.categories.count({
        where: {
          branch_id: branchId,
          deleted_at: null,
          menu_items: {
            some: {
              deleted_at: null,
              available: true
            }
          }
        }
      });
      return count;
    } catch (error) {
      console.error('Error counting categories with menu items:', error);
      return 0;
    }
  }

  async updateBranchPublishStatus(branchId, isPublished) {
    const updateData = {
      is_published: isPublished,
      updated_at: new Date()
    };

    // If unpublishing, we might want to clear some public-facing data
    if (!isPublished) {
      // Optionally clear custom domain when unpublishing
      // updateData.custom_domain = null;
    }

    const updatedBranch = await this.branchRepository.update(branchId, updateData);
    return updatedBranch;
  }

  async logActivity(activityData) {
    await this.prisma.activity_logs.create({
      data: {
        id: uuidv4(),
        user_id: activityData.userId,
        restaurant_id: activityData.restaurantId,
        branch_id: activityData.branchId,
        action: activityData.action,
        entity_type: activityData.entityType,
        entity_id: activityData.entityId,
        old_values: activityData.oldValues,
        new_values: activityData.newValues,
        created_at: new Date()
      }
    });
  }
}

module.exports = { PublishBranchUseCase };