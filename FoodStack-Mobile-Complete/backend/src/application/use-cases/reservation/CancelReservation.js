class CancelReservation {
  constructor({ reservationRepository }) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id, { userId, role }) {
    // 1. Kiểm tra reservation tồn tại
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) throw { code: 'RESERVATION_NOT_FOUND', message: 'Reservation does not exist' };
    if (reservation.status === 'CANCELLED') throw { code: 'RESERVATION_ALREADY_CANCELLED', message: 'Reservation already cancelled' };

    // 2. Cập nhật trạng thái
    const updated = await this.reservationRepository.update(id, { status: 'CANCELLED' });
    return updated;
  }
}

module.exports = { CancelReservation };