class CheckTableAvailabilityUseCase {
  constructor(reservationRepository, branchRepository) {
    this.reservationRepository = reservationRepository;
    this.branchRepository = branchRepository;
  }

  async execute(dto) {
    // Check branch exists
    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // Find available tables
    const availableTables = await this.reservationRepository.findAvailableTables(
      dto.branchId,
      dto.partySize,
      dto.reservationDate,
      dto.reservationTime
    );

    return {
      available: availableTables.length > 0,
      tables: availableTables,
    };
  }
}

module.exports = { CheckTableAvailabilityUseCase };
