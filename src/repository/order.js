const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

class OrderRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  // Dùng cho delete/disable table
  async countActiveOrdersByTableId(tableId, tx) {
    const client = tx || this.prisma;
    return await client.orders.count({
      where: {
        table_id: tableId,
        status: { in: ['PENDING', 'PREPARING', 'SERVED'] },
      },
    });
  }

  // ✅ Dùng cho payment
  async findById(orderId, tx) {
    const client = tx || this.prisma;
    return await client.orders.findUnique({
      where: { id: orderId },
    });
  }

  // ✅ Dùng cho payment / update trạng thái order
  async update(orderId, data, tx) {
    const client = tx || this.prisma;
    return await client.orders.update({
      where: { id: orderId },
      data,
    });
  }
  async countOrdersToday(branchId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.prisma.orders.count({
      where: {
        branch_id: branchId,
        created_at: {
          gte: today,
          lt: tomorrow
        }
      }
    });
  }

  async createWithItems(orderData) {
    return await this.prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.orders.create({
        data: {
          id: uuidv4(),
          branch_id: orderData.branch_id,
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
          updated_at: new Date()
        }
      });

      // Create order items if provided
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = await Promise.all(
          orderData.items.map(async (item) => {
            const orderItem = await tx.order_items.create({
              data: {
                id: uuidv4(),
                order_id: order.id,
                menu_item_id: item.menu_item_id,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                notes: item.notes,
                created_at: new Date()
              }
            });

            // Create customizations if provided
            if (item.customizations && item.customizations.length > 0) {
              await Promise.all(
                item.customizations.map(customization =>
                  tx.order_item_customizations.create({
                    data: {
                      id: uuidv4(),
                      order_item_id: orderItem.id,
                      customization_option_id: customization.customization_option_id,
                      price_delta: customization.price_delta,
                      created_at: new Date()
                    }
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

  async findById(orderId) {
    return await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            restaurant_id: true
          }
        },
        tables: {
          include: {
            areas: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  async findByIdWithDetails(orderId) {
    return await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            restaurant_id: true
          }
        },
        tables: {
          include: {
            areas: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        order_items: {
          include: {
            menu_items: {
              select: {
                id: true,
                name: true,
                description: true,
                image_url: true
              }
            }
          }
        }
      }
    });
  }

  async updateStatus(orderId, newStatus) {
    return await this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        updated_at: new Date()
      }
    });
  }

  async updateTableStatus(tableId, status) {
    return await this.prisma.tables.update({
      where: { id: tableId },
      data: { status }
    });
  }

  async addItemsAndUpdateTotal(orderId, orderItems, addedAmount) {
    return await this.prisma.$transaction(async (tx) => {
      // Add order items
      const addedItems = await Promise.all(
        orderItems.map(async (item) => {
          const { customizations, ...orderItemData } = item;
          const orderItem = await tx.order_items.create({
            data: {
              id: uuidv4(),
              ...orderItemData,
              created_at: new Date()
            }
          });

          // Add customizations if provided
          if (customizations && customizations.length > 0) {
            await Promise.all(
              customizations.map(customization =>
                tx.order_item_customizations.create({
                  data: {
                    id: uuidv4(),
                    order_item_id: orderItem.id,
                    customization_option_id: customization.customization_option_id,
                    price_delta: customization.price_delta,
                    created_at: new Date()
                  }
                })
              )
            );
          }

          return orderItem;
        })
      );

      // Update order totals
      const currentOrder = await tx.orders.findUnique({
        where: { id: orderId }
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
          updated_at: new Date()
        }
      });

      return { addedItems, updatedOrder };
    });
  }

  async findOrderItemById(orderItemId) {
    return await this.prisma.order_items.findUnique({
      where: { id: orderItemId },
      include: {
        menu_items: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async removeItemAndUpdateTotal(orderId, orderItemId, removedAmount) {
    return await this.prisma.$transaction(async (tx) => {
      // Remove order item and its customizations
      await tx.order_item_customizations.deleteMany({
        where: { order_item_id: orderItemId }
      });

      await tx.order_items.delete({
        where: { id: orderItemId }
      });

      // Update order totals
      const currentOrder = await tx.orders.findUnique({
        where: { id: orderId }
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
          updated_at: new Date()
        }
      });

      return { updatedOrder };
    });
  }

  async updateOrderItemAndTotal(orderId, orderItemId, newQuantity, newSubtotal, subtotalDifference) {
    return await this.prisma.$transaction(async (tx) => {
      // Update order item
      await tx.order_items.update({
        where: { id: orderItemId },
        data: {
          quantity: newQuantity,
          subtotal: newSubtotal
        }
      });

      // Update order totals
      const currentOrder = await tx.orders.findUnique({
        where: { id: orderId }
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
          updated_at: new Date()
        }
      });

      return { updatedOrder };
    });
  }

  async cancelOrder(orderId, reason) {
    return await this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancellation_reason: reason,
        updated_at: new Date()
      }
    });
  }

  async findActiveOrdersByBranch(branchId, options = {}) {
    const { limit, offset, status, tableId } = options;
    
    const where = {
      branch_id: branchId,
      status: status ? status : { in: ['PENDING', 'PREPARING', 'SERVED'] }
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
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              order_items: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit,
        skip: offset
      }),
      this.prisma.orders.count({ where })
    ]);

    return { orders, total };
  }

  async findOrdersByTable(tableId, options = {}) {
    const { limit, offset, startDate, endDate, status } = options;
    
    const where = {
      table_id: tableId
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
              order_items: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit,
        skip: offset
      }),
      this.prisma.orders.count({ where })
    ]);

    return { orders, total };
  }
}

module.exports = { OrderRepository };