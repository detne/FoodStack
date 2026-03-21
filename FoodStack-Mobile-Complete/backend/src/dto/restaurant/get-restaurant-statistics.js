const { z } = require('zod');
const { AppError } = require('../../core/errors/AppError');

/**
 * DTO (Query) - filter theo thời gian
 * - from/to là ISO datetime: 2026-03-01T00:00:00.000Z
 * - nếu thiếu -> default 7 ngày gần nhất
 *
 * Nếu bạn muốn YYYY-MM-DD thì nói mình đổi schema.
 */
const GetRestaurantStatisticsQuerySchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (!data.from || !data.to) return true;
      return new Date(data.from).getTime() <= new Date(data.to).getTime();
    },
    { message: '`from` must be <= `to`' }
  );

function resolveRange(dto) {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const from = dto.from ? new Date(dto.from) : defaultFrom;
  const to = dto.to ? new Date(dto.to) : now;

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new AppError('Invalid date range', 400);
  }

  return { from, to };
}

class GetRestaurantStatisticsUseCase {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * @param {{ from?: string, to?: string }} dto
   * @param {{ userId: string, role: string, restaurantId: string }} context
   */
  async execute(dto, context) {
    // Owner, Manager, Staff có quyền xem statistics
    if (!['RESTAURANT_OWNER', 'OWNER', 'MANAGER', 'STAFF', 'ADMIN'].includes(context.role)) {
      throw new AppError('Forbidden', 403);
    }

    let restaurantId = context.restaurantId;
    if (!restaurantId) {
      const user = await this.prisma.users.findUnique({
        where: { id: context.userId },
        include: {
          restaurants: { select: { id: true } },
        },
      });

      restaurantId = user?.restaurants?.id || null;
    }

    if (!restaurantId) {
      // Return empty statistics instead of error for better UX
      return {
        restaurantId: null,
        range: {
          from: resolveRange(dto).from.toISOString(),
          to: resolveRange(dto).to.toISOString(),
        },
        todayOrders: 0,
        todayRevenue: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeTables: 0,
        pendingOrders: 0,
        totalMenuItems: 0,
        avgServiceTime: '0m',
        revenueChange: 0,
        ordersChange: 0,
      };
    }
    
    const { from, to } = resolveRange(dto);

    // Get today's date range
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const orderWhere = {
      branches: {
        restaurant_id: restaurantId,
      },
      created_at: { gte: from, lte: to },
      status: { in: ['PAID', 'COMPLETED'] },
    };

    const todayOrderWhere = {
      branches: {
        restaurant_id: restaurantId,
      },
      created_at: { gte: todayStart, lte: todayEnd },
    };

    const [
      totalOrdersCount, 
      totalRevenueAgg, 
      todayOrdersCount,
      todayRevenueAgg,
      activeTables,
      pendingOrders,
      totalMenuItems
    ] = await Promise.all([
      this.prisma.orders.count({ where: orderWhere }),
      this.prisma.orders.aggregate({
        where: orderWhere,
        _sum: { total: true },
      }),
      this.prisma.orders.count({ where: todayOrderWhere }),
      this.prisma.orders.aggregate({
        where: { ...todayOrderWhere, status: { in: ['PAID', 'COMPLETED'] } },
        _sum: { total: true },
      }),
      this.prisma.tables.count({
        where: {
          areas: {
            branches: {
              restaurant_id: restaurantId,
            },
          },
          status: { in: ['AVAILABLE', 'OCCUPIED'] },
        },
      }),
      this.prisma.orders.count({
        where: {
          branches: {
            restaurant_id: restaurantId,
          },
          status: 'PENDING',
        },
      }),
      this.prisma.menu_items.count({
        where: {
          categories: {
            branches: {
              restaurant_id: restaurantId,
            },
          },
          deleted_at: null,
        },
      }),
    ]);

    return {
      restaurantId,
      range: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      todayOrders: todayOrdersCount,
      todayRevenue: Number(todayRevenueAgg?._sum?.total ?? 0),
      totalOrders: totalOrdersCount,
      totalRevenue: Number(totalRevenueAgg?._sum?.total ?? 0),
      activeTables,
      pendingOrders,
      totalMenuItems,
      avgServiceTime: '15m 30s', // Mock for now
      revenueChange: 12.5, // Mock for now
      ordersChange: 8.2, // Mock for now
    };
  }
}

module.exports = {
  GetRestaurantStatisticsUseCase,
  GetRestaurantStatisticsQuerySchema,
};