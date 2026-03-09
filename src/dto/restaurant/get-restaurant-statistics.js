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
    // Owner có quyền xem
    if (context.role !== 'OWNER') {
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
      throw new AppError('Restaurant not found for this user', 400);
    }
    const { from, to } = resolveRange(dto);

    /**
     * ⚠️ QUAN TRỌNG:
     * Bạn cần chỉnh đúng tên model/field theo Prisma schema của bạn.
     * Mình đang giả sử:
     * - orders: branch_id, status, total, created_at
     * - branches: restaurant_id
     * - tables: area_id, status
     * - areas: branch_id
     */
    const orderWhere = {
      branches: {
        restaurant_id: restaurantId,
      },
      created_at: { gte: from, lte: to },
      status: { in: ['PAID', 'COMPLETED'] },
    };

    const [ordersCount, revenueAgg, activeTables] = await Promise.all([
      this.prisma.orders.count({ where: orderWhere }),
      this.prisma.orders.aggregate({
        where: orderWhere,
        _sum: { total: true },
      }),
      this.prisma.tables.count({
        where: {
          areas: {
            branches: {
              restaurant_id: restaurantId,
            },
          },
          status: { in: ['ACTIVE', 'OCCUPIED'] }, // chỉnh theo schema bạn
        },
      }),
    ]);

    return {
      restaurantId,
      range: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      orders: { total: ordersCount },
      revenue: { total: revenueAgg?._sum?.total ?? 0 },
      tables: { active: activeTables },
    };
  }
}

module.exports = {
  GetRestaurantStatisticsUseCase,
  GetRestaurantStatisticsQuerySchema,
};