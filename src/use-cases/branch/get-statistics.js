class GetBranchStatisticsUseCase {
  constructor(branchRepository, orderRepository, tableRepository) {
    this.branchRepository = branchRepository;
    this.orderRepository = orderRepository;
    this.tableRepository = tableRepository;
  }

  async execute(branchId, filters = {}) {
    const { from_date, to_date } = filters;

    const branch = await this.branchRepository.findById(branchId);
    if (!branch || branch.deleted_at) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    let fromDate = null;
    let toDate = null;

    if (from_date) {
      fromDate = new Date(from_date);
      if (Number.isNaN(fromDate.getTime())) {
        const err = new Error('Invalid from_date');
        err.status = 400;
        throw err;
      }
    }

    if (to_date) {
      toDate = new Date(to_date);
      if (Number.isNaN(toDate.getTime())) {
        const err = new Error('Invalid to_date');
        err.status = 400;
        throw err;
      }
    }

    if (fromDate && toDate && fromDate > toDate) {
      const err = new Error('from_date must be less than or equal to to_date');
      err.status = 400;
      throw err;
    }

    const [totalRevenue, totalOrders, activeTables] = await Promise.all([
      this.orderRepository.sumRevenueByBranch(branchId, {
        from_date: fromDate,
        to_date: toDate,
      }),
      this.orderRepository.countByBranch(branchId, {
        from_date: fromDate,
        to_date: toDate,
      }),
      this.tableRepository.countActiveByBranch(branchId),
    ]);

    return {
      branch_id: branch.id,
      branch_name: branch.name,
      filters: {
        from_date: fromDate ? fromDate.toISOString() : null,
        to_date: toDate ? toDate.toISOString() : null,
      },
      statistics: {
        total_revenue: totalRevenue || 0,
        total_orders: totalOrders || 0,
        active_tables: activeTables || 0,
      },
    };
  }
}

module.exports = { GetBranchStatisticsUseCase };