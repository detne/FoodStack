class CreateReservation {
  constructor({ reservationRepository, tableRepository, branchRepository }) {
    this.reservationRepository = reservationRepository;
    this.tableRepository = tableRepository;
    this.branchRepository = branchRepository;
  }

  async execute(dto) {
    // 1. Kiểm tra branch tồn tại
    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) throw { code: 'BRANCH_NOT_FOUND', message: 'Branch does not exist' };

    // 2. Kiểm tra table tồn tại
    const table = await this.tableRepository.findById(dto.tableId);
    if (!table) throw { code: 'TABLE_NOT_FOUND', message: 'Table does not exist' };
    if (table.areas.branch_id !== dto.branchId) throw { code: 'TABLE_NOT_IN_BRANCH', message: 'Table does not belong to branch' };

    // 3. Kiểm tra số lượng khách phù hợp
    if (dto.partySize > table.capacity) throw { code: 'TABLE_CAPACITY_EXCEEDED', message: 'Table capacity is not enough' };

    // 4. Kiểm tra bàn chưa bị đặt
    const isAvailable = await this.reservationRepository.checkTableAvailability(
      dto.branchId,
      dto.tableId,
      dto.reservationDate,
      dto.reservationTime
    );
    if (!isAvailable) throw { code: 'NO_AVAILABLE_TABLE', message: 'Table is not available at this time' };

    // 5. Tạo reservation
    const reservation = await this.reservationRepository.create(dto);
    return reservation;
  }
}

module.exports = { CreateReservation };