class CreateReservationUseCase {
  constructor(reservationRepository, branchRepository, tableRepository) {
    this.reservationRepository = reservationRepository;
    this.branchRepository = branchRepository;
    this.tableRepository = tableRepository;
  }

  async execute(dto) {
    // Check branch exists
    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // Check table exists
    const table = await this.tableRepository.findById(dto.tableId);
    if (!table) {
      const err = new Error('Table not found');
      err.status = 404;
      throw err;
    }

    // Validate table capacity
    if (table.capacity < dto.partySize) {
      const err = new Error('Table capacity is insufficient for party size');
      err.status = 400;
      throw err;
    }

    // Check table availability
    const isAvailable = await this.reservationRepository.checkTableAvailability(
      dto.branchId,
      dto.tableId,
      dto.reservationDate,
      dto.reservationTime
    );

    if (!isAvailable) {
      const err = new Error('NO_AVAILABLE_TABLE');
      err.status = 409;
      throw err;
    }

    // Create reservation
    const reservation = await this.reservationRepository.create(dto);

    return reservation;
  }
}

module.exports = { CreateReservationUseCase };
