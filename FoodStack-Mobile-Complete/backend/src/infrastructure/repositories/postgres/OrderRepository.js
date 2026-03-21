/**
 * Order Repository
 * Data access layer for orders (PostgreSQL)
 */

const { prisma } = require('../../../config/database.config');
const { BaseRepository } = require('../BaseRepository');
const { NotFoundError, DatabaseError } = require('../../../core/errors');

class OrderRepository extends BaseRepository {
  constructor() {
    super(prisma.order);
  }

  /**
   * Find order by ID with full details (items, customizations)
   * @param {string} orderId
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async findByIdWithDetails(orderId, restaurantId) {
    try {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          restaurantId,
        },
        include: {
          orderItems: {
            include: {
              menuItem: true,
              orderItemCustomizations: {
                include: {
                  customizationOption: true,
                },
              },
            },
          },
          table: {
            include: {
              area: true,
            },
          },
          payment: true,
        },
      });

      if (!order) {
        throw new NotFoundError('Order', orderId);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'findByIdWithDetails');
    }
  }

  /**
   * Find active orders by branch
   * @param {string} branchId
   * @param {string} restaurantId
   * @returns {Promise<Object[]>}
   */
  async findActiveByBranch(branchId, restaurantId) {
    try {
      return await prisma.order.findMany({
        where: {
          branchId,
          restaurantId,
          status: {
            in: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Served'],
          },
        },
        include: {
          table: true,
          orderItems: {
            include: {
              menuItem: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'findActiveByBranch');
    }
  }

  /**
   * Find orders by table
   * @param {string} tableId
   * @param {string} restaurantId
   * @returns {Promise<Object[]>}
   */
  async findByTable(tableId, restaurantId) {
    try {
      return await prisma.order.findMany({
        where: {
          tableId,
          restaurantId,
        },
        include: {
          orderItems: {
            include: {
              menuItem: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'findByTable');
    }
  }

  /**
   * Create order with items (Transaction)
   * @param {Object} orderData
   * @param {Object[]} items
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async createWithItems(orderData, items, restaurantId) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create order
        const order = await tx.order.create({
          data: {
            ...orderData,
            restaurantId,
          },
        });

        // Create order items
        const orderItems = await Promise.all(
          items.map((item) =>
            tx.orderItem.create({
              data: {
                orderId: order.id,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                basePrice: item.basePrice,
                notes: item.notes,
              },
            })
          )
        );

        // Create customizations if any
        for (const item of items) {
          if (item.customizations && item.customizations.length > 0) {
            const orderItem = orderItems.find(
              (oi) => oi.menuItemId === item.menuItemId
            );
            
            if (orderItem) {
              await Promise.all(
                item.customizations.map((custom) =>
                  tx.orderItemCustomization.create({
                    data: {
                      orderItemId: orderItem.id,
                      optionId: custom.optionId,
                      priceDelta: custom.priceDelta,
                    },
                  })
                )
              );
            }
          }
        }

        // Update table status to Occupied
        await tx.table.update({
          where: { id: orderData.tableId },
          data: { status: 'Occupied' },
        });

        // Return order with items
        return await tx.order.findUnique({
          where: { id: order.id },
          include: {
            orderItems: {
              include: {
                menuItem: true,
                orderItemCustomizations: {
                  include: {
                    customizationOption: true,
                  },
                },
              },
            },
          },
        });
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'createWithItems');
    }
  }

  /**
   * Update order status
   * @param {string} orderId
   * @param {string} status
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async updateStatus(orderId, status, restaurantId) {
    try {
      const order = await prisma.order.findFirst({
        where: { id: orderId, restaurantId },
      });

      if (!order) {
        throw new NotFoundError('Order', orderId);
      }

      return await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'updateStatus');
    }
  }

  /**
   * Get order statistics by date range
   * @param {string} restaurantId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getStatistics(restaurantId, startDate, endDate) {
    try {
      const [totalOrders, totalRevenue, avgOrderValue] = await Promise.all([
        prisma.order.count({
          where: {
            restaurantId,
            status: 'Paid',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.order.aggregate({
          where: {
            restaurantId,
            status: 'Paid',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            totalAmount: true,
          },
        }),
        prisma.order.aggregate({
          where: {
            restaurantId,
            status: 'Paid',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _avg: {
            totalAmount: true,
          },
        }),
      ]);

      return {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        avgOrderValue: avgOrderValue._avg.totalAmount || 0,
      };
    } catch (error) {
      throw new DatabaseError(error.message, 'getStatistics');
    }
  }
}

module.exports = { OrderRepository };
