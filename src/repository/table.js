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
      orderBy: {
        table_number: 'asc'
      }
    });
  }
}

module.exports = { TableRepository };