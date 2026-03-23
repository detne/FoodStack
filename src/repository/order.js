const { PrismaClient } = require('@prisma/client');

class OrderRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  getClient(tx) {
    return tx || this.prisma;
  }

  // Dùng cho delete/disable table
  async countActiveOrdersByTableId(tableId, tx) {
    const client = this.getClient(tx);
    return client.orders.count({
      where: {
        table_id: tableId,
        status: { in: ['PENDING', 'PREPARING', 'SERVED'] }
      }
    });
  }

  // Dùng cho payment / QR tại bàn / đọc chi tiết order cơ bản
  async findById(orderId, tx) {
    const client = this.getClient(tx);
    return client.orders.findUnique({
      where: { id: orderId },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            restaurant_id: true,
          },
        },
        tables: {
          include: {
            areas: {
              select: {
                id: true,
                name: true,
                branch_id: true,
              },
            },
          },
        },
      },
    });
  }

  // Dùng cho payment / update trạng thái order
  async update(orderId, data, tx) {
    const client = this.getClient(tx);
    return client.orders.update({
      where: { id: orderId },
      data,
    });
  }

  async countOrdersToday(branchId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.orders.count({
      where: {
        branch_id: branchId,
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  async createWithItems(orderData) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {          branch_id: orderData.branch_id,
          table_id: orderData.table_id,
          order_number: orderData.order_number,
          status: orderData.status,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          service_charge: orderData.service_charge,
          total: orderData.total,
          payment_status: orderData.payment_status,
          customer_count: orderData.customer_count,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (orderData.items && orderData.items.length > 0) {
        const orderItems = await Promise.all(
          orderData.items.map(async (item) => {
            const orderItem = await tx.order_items.create({
              data: {                order_id: order.id,
                menu_item_id: item.menu_item_id,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                notes: item.notes,
                created_at: new Date(),
              },
            });

            if (item.customizations && item.customizations.length > 0) {
              await Promise.all(
                item.customizations.map((customization) =>
                  tx.order_item_customizations.create({
                    data: {                      order_item_id: orderItem.id,
                      customization_option_id: customization.customization_option_id,
                      price_delta: customization.price_delta,
                      created_at: new Date(),
                    },
                  })
                )
              );
            }

            return orderItem;
          })
        );

        order.order_items = orderItems;
      }

      return order;
    });
  }

  async findByIdWithDetails(orderId, tx) {
    const client = this.getClient(tx);
    return client.orders.findUnique({
      where: { id: orderId },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            restaurant_id: true,
          },
        },
        tables: {
          include: {
            areas: {
              select: {
                id: true,
                name: true,
                branch_id: true,
              },
            },
          },
        },
        order_items: {
          include: {
            menu_items: {
              select: {
                id: true,
                name: true,
                description: true,
                image_url: true,
              },
            },
          },
        },
      },
    });
  }

  async updateStatus(orderId, newStatus, tx) {
    const client = this.getClient(tx);
    return client.orders.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        updated_at: new Date(),
      },
    });
  }

  async updateTableStatus(tableId, status, tx) {
    const client = this.getClient(tx);
    return client.tables.update({
      where: { id: tableId },
      data: { status },
    });
  }

  async addItemsAndUpdateTotal(orderId, orderItems, addedAmount) {
    return this.prisma.$transaction(async (tx) => {
      const addedItems = await Promise.all(
        orderItems.map(async (item) => {
          const { customizations, ...orderItemData } = item;
          const orderItem = await tx.order_items.create({
            data: {
              ...orderItemData,
              created_at: new Date()
            }
          });

          if (customizations && customizations.length > 0) {
            await Promise.all(
              customizations.map((customization) =>
                tx.order_item_customizations.create({
                  data: {                    order_item_id: orderItem.id,
                    customization_option_id: customization.customization_option_id,
                    price_delta: customization.price_delta,
                    created_at: new Date(),
                  },
                })
              )
            );
          }

          return orderItem;
        })
      );

      const currentOrder = await tx.orders.findUnique({
        where: { id: orderId },
      });

      const newSubtotal = parseFloat(currentOrder.subtotal) + addedAmount;
      const newTax = newSubtotal * 0.1;
      const newServiceCharge = newSubtotal * 0.05;
      const newTotal = newSubtotal + newTax + newServiceCharge;

      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: {
          subtotal: newSubtotal,
          tax: newTax,
          service_charge: newServiceCharge,
          total: newTotal,
          updated_at: new Date(),
        },
      });

      return { addedItems, updatedOrder };
    });
  }

  async findOrderItemById(orderItemId) {
    return this.prisma.order_items.findUnique({
      where: { id: orderItemId },
      include: {
        menu_items: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async removeItemAndUpdateTotal(orderId, orderItemId, removedAmount) {
    return this.prisma.$transaction(async (tx) => {
      await tx.order_item_customizations.deleteMany({
        where: { order_item_id: orderItemId },
      });

      await tx.order_items.delete({
        where: { id: orderItemId },
      });

      const currentOrder = await tx.orders.findUnique({
        where: { id: orderId },
      });

      const newSubtotal = Math.max(0, parseFloat(currentOrder.subtotal) - removedAmount);
      const newTax = newSubtotal * 0.1;
      const newServiceCharge = newSubtotal * 0.05;
      const newTotal = newSubtotal + newTax + newServiceCharge;

      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: {
          subtotal: newSubtotal,
          tax: newTax,
          service_charge: newServiceCharge,
          total: newTotal,
          updated_at: new Date(),
        },
      });

      return { updatedOrder };
    });
  }

  async updateOrderItemAndTotal(orderId, orderItemId, newQuantity, newSubtotal, subtotalDifference) {
    return this.prisma.$transaction(async (tx) => {
      await tx.order_items.update({
        where: { id: orderItemId },
        data: {
          quantity: newQuantity,
          subtotal: newSubtotal,
        },
      });

      const currentOrder = await tx.orders.findUnique({
        where: { id: orderId },
      });

      const newOrderSubtotal = parseFloat(currentOrder.subtotal) + subtotalDifference;
      const newTax = newOrderSubtotal * 0.1;
      const newServiceCharge = newOrderSubtotal * 0.05;
      const newTotal = newOrderSubtotal + newTax + newServiceCharge;

      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: {
          subtotal: newOrderSubtotal,
          tax: newTax,
          service_charge: newServiceCharge,
          total: newTotal,
          updated_at: new Date(),
        },
      });

      return { updatedOrder };
    });
  }

  async cancelOrder(orderId, reason) {
    return this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancellation_reason: reason,
        updated_at: new Date(),
      },
    });
  }

  async findActiveOrdersByBranch(branchId, options = {}) {
    const { limit, offset, status, tableId } = options;

    const where = {
      branch_id: branchId,
      status: status ? status : { in: ['PENDING', 'PREPARING', 'SERVED'] },
    };

    if (tableId) {
      where.table_id = tableId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        include: {
          tables: {
            include: {
              areas: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              order_items: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.orders.count({ where }),
    ]);

    return { orders, total };
  }

  async findOrdersByTable(tableId, options = {}) {
    const { limit, offset, startDate, endDate, status } = options;

    const where = {
      table_id: tableId,
    };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        include: {
          _count: {
            select: {
              order_items: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.orders.count({ where }),
    ]);

    return { orders, total };
  }

  async sumRevenueByBranch(branchId, filters = {}) {
    const { from_date, to_date } = filters;

    const where = {
      branch_id: branchId,
      payment_status: 'PAID',
    };

    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = from_date;
      if (to_date) where.created_at.lte = to_date;
    }

    const result = await this.prisma.orders.aggregate({
      where,
      _sum: {
        total: true,
      },
    });

    return Number(result._sum.total || 0);
  }

  async countByBranch(branchId, filters = {}) {
    const { from_date, to_date } = filters;

    const where = {
      branch_id: branchId,
    };

    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = from_date;
      if (to_date) where.created_at.lte = to_date;
    }

    return await this.prisma.orders.count({ where });
  }
}

module.exports = { OrderRepository };