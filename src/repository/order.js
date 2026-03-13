const { PrismaClient } = require('@prisma/client');

class OrderRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  async countActiveOrdersByTableId(tableId, tx) {
    const client = tx || this.prisma;
    return await client.orders.count({
      where: {
        table_id: tableId,
        status: { in: ['Pending', 'Preparing', 'Ready'] },
      },
    });
  }
}

module.exports = { OrderRepository };