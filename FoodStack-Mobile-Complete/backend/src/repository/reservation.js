class ReservationRepository {
  constructor(prisma) {
    if (!prisma) throw new Error('ReservationRepository requires prisma instance');
    this.prisma = prisma;
  }

  async findById(id) {
    return await this.prisma.reservations.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id) {
    // Manual join since Prisma schema doesn't have relations
    const reservation = await this.prisma.reservations.findUnique({
      where: { id },
    });

    if (!reservation) return null;

    // Get branch info
    const branch = await this.prisma.branches.findUnique({
      where: { id: reservation.branch_id },
    });

    // Get table info
    const table = await this.prisma.tables.findUnique({
      where: { id: reservation.table_id },
    });

    return {
      ...reservation,
      branch,
      table,
    };
  }

  async create(data) {
    const { v4: uuidv4 } = require('uuid');

    return await this.prisma.reservations.create({
      data: {
        id: uuidv4(),
        branch_id: data.branchId,
        table_id: data.tableId,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_email: data.customerEmail || null,
        party_size: data.partySize,
        reservation_date: new Date(data.reservationDate),
        reservation_time: data.reservationTime,
        status: 'PENDING',
        notes: data.notes || null,
        updated_at: new Date(),
      },
    });
  }

  async update(id, data) {
    const updateData = {
      updated_at: new Date(),
    };

    if (data.partySize !== undefined) updateData.party_size = data.partySize;
    if (data.reservationDate !== undefined) updateData.reservation_date = new Date(data.reservationDate);
    if (data.reservationTime !== undefined) updateData.reservation_time = data.reservationTime;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.status !== undefined) updateData.status = data.status;

    return await this.prisma.reservations.update({
      where: { id },
      data: updateData,
    });
  }

  async listByBranch(branchId, filters = {}) {
    const { status, date, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      branch_id: branchId,
    };

    if (status) {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      where.reservation_date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reservations.findMany({
        where,
        orderBy: { reservation_date: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.reservations.count({ where }),
    ]);

    return { items, total };
  }

  async checkTableAvailability(branchId, tableId, reservationDate, reservationTime, excludeReservationId = null) {
    const startDate = new Date(reservationDate);
    const endDate = new Date(reservationDate);
    endDate.setDate(endDate.getDate() + 1);

    const where = {
      table_id: tableId,
      branch_id: branchId,
      reservation_date: {
        gte: startDate,
        lt: endDate,
      },
      reservation_time: reservationTime,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    };

    if (excludeReservationId) {
      where.id = { not: excludeReservationId };
    }

    const conflictingReservation = await this.prisma.reservations.findFirst({
      where,
    });

    return !conflictingReservation;
  }

  async findAvailableTables(branchId, partySize, reservationDate, reservationTime) {
    const startDate = new Date(reservationDate);
    const endDate = new Date(reservationDate);
    endDate.setDate(endDate.getDate() + 1);

    // Lấy tất cả area thuộc branch
    const areas = await this.prisma.areas.findMany({
      where: {
        branch_id: branchId,
        deleted_at: null,
      },
      select: { id: true, name: true, branch_id: true },
    });

    if (!areas.length) return [];

    const areaIds = areas.map((a) => a.id);

    // Lấy các reservation bị trùng giờ
    const conflictingReservations = await this.prisma.reservations.findMany({
      where: {
        branch_id: branchId,
        reservation_date: {
          gte: startDate,
          lt: endDate,
        },
        reservation_time: reservationTime,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        table_id: true,
      },
    });

    const reservedTableIds = conflictingReservations.map((r) => r.table_id);

    // Lấy bàn còn trống
    const tables = await this.prisma.tables.findMany({
      where: {
        area_id: {
          in: areaIds,
        },
        capacity: {
          gte: partySize,
        },
        status: 'AVAILABLE',
        deleted_at: null,
        ...(reservedTableIds.length
          ? {
              id: {
                notIn: reservedTableIds,
              },
            }
          : {}),
      },
      orderBy: [
        { capacity: 'asc' },
        { table_number: 'asc' },
      ],
    });

    return tables.map((table) => {
      const area = areas.find((a) => a.id === table.area_id) || null;
      return {
        ...table,
        area,
      };
    });
  }
}

module.exports = { ReservationRepository };
