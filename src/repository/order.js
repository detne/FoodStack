const { PrismaClient } = require('@prisma/client');

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
        status: { in: ['Pending', 'Preparing', 'Ready'] },
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
}

module.exports = { OrderRepository };