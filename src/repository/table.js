const { PrismaClient } = require('@prisma/client');

class TableRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  // Check trùng số bàn trong cùng branch (join tables -> areas -> branch)
  async findByBranchAndTableNumber(branchId, tableNumber, tx) {
    const client = tx || this.prisma;
    return await client.tables.findFirst({
      where: {
        deleted_at: null,
        table_number: { equals: tableNumber, mode: 'insensitive' },
        areas: {
          branch_id: branchId,
          deleted_at: null,
        },
      },
      select: { id: true },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    return await client.tables.create({ data });
  }

  async update(tableId, data, tx) {
    const client = tx || this.prisma;
    return await client.tables.update({
      where: { id: tableId },
      data,
    });
  }

  async findById(tableId, tx) {
    const client = tx || this.prisma;
    return await client.tables.findUnique({
      where: { id: tableId },
    });
  }

  async deleteHard(tableId, tx) {
    const client = tx || this.prisma;
    return await client.tables.delete({
      where: { id: tableId },
    });
  }
}

module.exports = { TableRepository };