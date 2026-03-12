class TableRepository {
  constructor(prisma) {
    if (!prisma) throw new Error('TableRepository requires prisma instance');
    this.prisma = prisma;
  }

  async findById(id) {
    return await this.prisma.tables.findUnique({
      where: { id },
      include: {
        areas: true,
      },
    });
  }

  async findByAreaId(areaId) {
    return await this.prisma.tables.findMany({
      where: {
        area_id: areaId,
        deleted_at: null,
      },
      orderBy: { table_number: 'asc' },
    });
  }
}

module.exports = { TableRepository };
