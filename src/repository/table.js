const { PrismaClient } = require('@prisma/client');

class TableRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  async findByQrToken(qrToken) {
    return await this.prisma.tables.findUnique({
      where: {
        qr_token: qrToken,
        deleted_at: null
      },
      include: {
        areas: {
          include: {
            branches: {
              select: {
                id: true,
                name: true,
                restaurant_id: true,
                status: true
              }
            }
          }
        }
      }
    });
  }

  async findById(tableId) {
    return await this.prisma.tables.findUnique({
      where: {
        id: tableId,
        deleted_at: null
      },
      include: {
        areas: {
          include: {
            branches: {
              select: {
                id: true,
                name: true,
                restaurant_id: true
              }
            }
          }
        }
      }
    });
  }

  async updateStatus(tableId, status) {
    return await this.prisma.tables.update({
      where: { id: tableId },
      data: {
        status,
        updated_at: new Date()
      }
    });
  }

  async findByAreaId(areaId) {
    return await this.prisma.tables.findMany({
      where: {
        area_id: areaId,
        deleted_at: null
      },
      orderBy: { table_number: 'asc' },
    });
  }

  async listByBranchId(branchId) {
    return await this.prisma.tables.findMany({
      where: {
        deleted_at: null,
        areas: {
          branch_id: branchId,
          deleted_at: null,
        },
      },
      include: {
        areas: true,
      },
      orderBy: [
        { areas: { name: 'asc' } },
        { table_number: 'asc' },
      ],
    });
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

  async deleteHard(tableId, tx) {
    const client = tx || this.prisma;
    return await client.tables.delete({
      where: { id: tableId },
    });
  }

  async countActiveByBranch(branchId) {
    return await this.prisma.tables.count({
      where: {
        deleted_at: null,
        status: 'ACTIVE',
        areas: {
          branch_id: branchId,
          deleted_at: null,
        },
      },
    });
  }
}

module.exports = { TableRepository };