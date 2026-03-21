class UpdateReservation {
  constructor({ reservationRepository, tableRepository }) {
    this.reservationRepository = reservationRepository;
    this.tableRepository = tableRepository;
  }

  async execute(id, dto, { userId, role }) {
    // 1. Kiểm tra reservation tồn tại
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) throw { code: 'RESERVATION_NOT_FOUND', message: 'Reservation does not exist' };
    if (reservation.status === 'CANCELLED') throw { code: 'RESERVATION_CANCELLED', message: 'Reservation is cancelled' };

    // 2. Nếu có thay đổi thời gian/số lượng khách thì kiểm tra bàn còn trống
    let tableId = reservation.table_id;
    let branchId = reservation.branch_id;
    let partySize = dto.partySize || reservation.party_size;
    let reservationDate = dto.reservationDate || reservation.reservation_date;
    let reservationTime = dto.reservationTime || reservation.reservation_time;

    // Kiểm tra lại sức chứa bàn nếu partySize thay đổi
    if (dto.partySize) {
      const table = await this.tableRepository.findById(tableId);
      if (!table) throw { code: 'TABLE_NOT_FOUND', message: 'Table does not exist' };
      if (partySize > table.capacity) throw { code: 'TABLE_CAPACITY_EXCEEDED', message: 'Table capacity is not enough' };
    }

    // Kiểm tra bàn còn trống nếu đổi thời gian hoặc số lượng khách
    if (dto.reservationDate || dto.reservationTime || dto.partySize) {
      const isAvailable = await this.reservationRepository.checkTableAvailability(
        branchId,
        tableId,
        reservationDate,
        reservationTime,
        id // exclude chính reservation này
      );
      if (!isAvailable) throw { code: 'TABLE_NOT_AVAILABLE', message: 'Table is not available at this time' };
    }

    // 3. Cập nhật reservation
    const updated = await this.reservationRepository.update(id, dto);
    return updated;
  }
}

module.exports = { UpdateReservation };