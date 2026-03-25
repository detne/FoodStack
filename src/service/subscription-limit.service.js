/**
 * Subscription Limit Service
 * Kiểm tra giới hạn của từng gói subscription
 */

const { PrismaClient } = require('@prisma/client');

class SubscriptionLimitService {
  constructor(prisma = new PrismaClient()) {
    this.prisma = prisma;
  }

  /**
   * Lấy subscription hiện tại của restaurant
   */
  async getCurrentSubscription(restaurantId) {
    // Tìm subscription active
    const subscription = await this.prisma.subscriptions.findFirst({
      where: {
        restaurant_id: restaurantId,
        status: 'ACTIVE'
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Xác định plan type (mặc định là free nếu không có subscription)
    const planType = subscription?.plan_type || 'free';

    // Lấy thông tin plan từ subscription_plans table
    const plan = await this.prisma.subscription_plans.findFirst({
      where: { name: planType }
    });

    if (!plan) {
      // Fallback nếu không tìm thấy plan trong database
      console.warn(`Plan ${planType} not found in subscription_plans table, using hardcoded defaults`);
      return {
        plan_type: planType,
        max_branches: planType === 'free' ? 3 : -1,
        max_tables: planType === 'free' ? 10 : -1,
        max_menu_items: planType === 'free' ? 50 : -1
      };
    }

    return {
      plan_type: planType,
      max_branches: plan.max_branches,
      max_tables: plan.max_tables,
      max_menu_items: plan.max_menu_items
    };
  }

  /**
   * Kiểm tra có thể tạo branch mới không
   */
  async canCreateBranch(restaurantId) {
    const subscription = await this.getCurrentSubscription(restaurantId);
    
    // Nếu unlimited (-1), cho phép
    if (subscription.max_branches === -1) {
      return { allowed: true };
    }

    // Đếm số branch hiện tại (không bị xóa)
    // MongoDB: deleted_at null hoặc không tồn tại đều là active
    const allBranches = await this.prisma.branches.findMany({
      where: {
        restaurant_id: restaurantId
      },
      select: {
        id: true,
        deleted_at: true
      }
    });
    
    const currentCount = allBranches.filter(b => !b.deleted_at || b.deleted_at === null).length;

    const allowed = currentCount < subscription.max_branches;

    return {
      allowed,
      current: currentCount,
      limit: subscription.max_branches,
      plan: subscription.plan_type,
      message: allowed 
        ? null 
        : `Gói ${subscription.plan_type} chỉ cho phép tối đa ${subscription.max_branches} chi nhánh. Vui lòng nâng cấp gói để tạo thêm.`
    };
  }

  /**
   * Kiểm tra có thể tạo menu item mới không
   */
  async canCreateMenuItem(restaurantId) {
    const subscription = await this.getCurrentSubscription(restaurantId);
    
    // Nếu unlimited (-1), cho phép
    if (subscription.max_menu_items === -1) {
      return { allowed: true };
    }

    // Đếm số menu items hiện tại (không bị xóa)
    const categories = await this.prisma.categories.findMany({
      where: {
        restaurant_id: restaurantId
      },
      select: { id: true, deleted_at: true }
    });

    const activeCategories = categories.filter(c => !c.deleted_at);
    const categoryIds = activeCategories.map(c => c.id);

    if (categoryIds.length === 0) {
      return {
        allowed: true,
        current: 0,
        limit: subscription.max_menu_items,
        plan: subscription.plan_type
      };
    }

    const allMenuItems = await this.prisma.menu_items.findMany({
      where: {
        category_id: { in: categoryIds }
      },
      select: {
        id: true,
        deleted_at: true
      }
    });

    const currentCount = allMenuItems.filter(m => !m.deleted_at).length;

    const allowed = currentCount < subscription.max_menu_items;

    return {
      allowed,
      current: currentCount,
      limit: subscription.max_menu_items,
      plan: subscription.plan_type,
      message: allowed 
        ? null 
        : `Gói ${subscription.plan_type} chỉ cho phép tối đa ${subscription.max_menu_items} món ăn. Vui lòng nâng cấp gói để tạo thêm.`
    };
  }

  /**
   * Kiểm tra có thể tạo table mới không (trong một branch)
   */
  async canCreateTable(branchId) {
    // Lấy restaurant ID từ branch
    const branch = await this.prisma.branches.findUnique({
      where: { id: branchId },
      select: { restaurant_id: true }
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    const subscription = await this.getCurrentSubscription(branch.restaurant_id);
    
    // Nếu unlimited (-1), cho phép
    if (subscription.max_tables === -1) {
      return { allowed: true };
    }

    // Đếm số tables hiện tại trong branch này (không bị xóa)
    const areas = await this.prisma.areas.findMany({
      where: {
        branch_id: branchId
      },
      select: { id: true, deleted_at: true }
    });

    const activeAreas = areas.filter(a => !a.deleted_at);
    const areaIds = activeAreas.map(a => a.id);

    if (areaIds.length === 0) {
      return {
        allowed: true,
        current: 0,
        limit: subscription.max_tables,
        plan: subscription.plan_type
      };
    }

    const allTables = await this.prisma.tables.findMany({
      where: {
        area_id: { in: areaIds }
      },
      select: {
        id: true,
        deleted_at: true
      }
    });

    const currentCount = allTables.filter(t => !t.deleted_at).length;

    const allowed = currentCount < subscription.max_tables;

    return {
      allowed,
      current: currentCount,
      limit: subscription.max_tables,
      plan: subscription.plan_type,
      message: allowed 
        ? null 
        : `Gói ${subscription.plan_type} chỉ cho phép tối đa ${subscription.max_tables} bàn mỗi chi nhánh. Vui lòng nâng cấp gói để tạo thêm.`
    };
  }

  /**
   * Lấy thông tin giới hạn hiện tại
   */
  async getLimitsInfo(restaurantId) {
    const subscription = await this.getCurrentSubscription(restaurantId);

    // Đếm branches (không bị xóa)
    const allBranches = await this.prisma.branches.findMany({
      where: {
        restaurant_id: restaurantId
      },
      select: {
        id: true,
        deleted_at: true
      }
    });
    const branchCount = allBranches.filter(b => !b.deleted_at).length;

    // Đếm menu items (không bị xóa)
    const categories = await this.prisma.categories.findMany({
      where: {
        restaurant_id: restaurantId
      },
      select: { id: true, deleted_at: true }
    });

    const activeCategories = categories.filter(c => !c.deleted_at);
    const categoryIds = activeCategories.map(c => c.id);

    let menuItemCount = 0;
    if (categoryIds.length > 0) {
      const allMenuItems = await this.prisma.menu_items.findMany({
        where: {
          category_id: { in: categoryIds }
        },
        select: {
          id: true,
          deleted_at: true
        }
      });
      menuItemCount = allMenuItems.filter(m => !m.deleted_at).length;
    }

    return {
      plan: subscription.plan_type,
      branches: {
        current: branchCount,
        limit: subscription.max_branches,
        unlimited: subscription.max_branches === -1
      },
      menuItems: {
        current: menuItemCount,
        limit: subscription.max_menu_items,
        unlimited: subscription.max_menu_items === -1
      },
      tables: {
        limit: subscription.max_tables,
        unlimited: subscription.max_tables === -1
      }
    };
  }
}

module.exports = { SubscriptionLimitService };
