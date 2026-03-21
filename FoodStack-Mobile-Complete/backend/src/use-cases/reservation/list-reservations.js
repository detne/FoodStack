class ListReservationsUseCase {
  constructor(reservationRepository, branchRepository) {
    this.reservationRepository = reservationRepository;
    this.branchRepository = branchRepository;
  }

  async execute(dto, auth) {
    // Check branch exists
    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // Staff can only view reservations from their branch
    if (auth?.role === 'STAFF' && auth.branchId && auth.branchId !== dto.branchId) {
      const err = new Error('Forbidden: Cannot view reservations from other branches');
      err.status = 403;
      throw err;
    }

    const result = await this.reservationRepository.listByBranch(dto.branchId, {
      status: dto.status,
      date: dto.date,
      page: dto.page,
      limit: dto.limit,
    });

    return result;
  }
}

module.exports = { ListReservationsUseCase };
