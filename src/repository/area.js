const { PrismaClient } = require('@prisma/client');

class AreaRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  async findByBranchAndName(branchId, name, tx) {
    const client = tx || this.prisma;
    return await client.areas.findFirst({
      where: {
        branch_id: branchId,
        deleted_at: null,
        name: { equals: name, mode: 'insensitive' }, // Postgres
      },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    return await client.areas.create({
      data,
    });
  }
}

module.exports = { AreaRepository };