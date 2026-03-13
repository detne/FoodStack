class UpdateReservationUseCase {
  constructor(reservationRepository, tableRepository) {
    this.reservationRepository = reservationRepository;
    this.tableRepository = tableRepository;
  }

  async execute(id, dto, auth) {
    // Check reservation exists
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      const err = new Error('Reservation not found');
      err.status = 404;
      throw err;
    }

    // Check not cancelled
    if (reservation.status === 'CANCELLED') {
      const err = new Error('Cannot update cancelled reservation');
      err.status = 400;
      throw err;
    }

    // If updating time or party size, check availability
    if (dto.reservationDate || dto.reservationTime || dto.partySize) {
      const newDate = dto.reservationDate || reservation.reservation_date.toISOString().split('T')[0];
      const newTime = dto.reservationTime || reservation.reservation_time;
      const newPartySize = dto.partySize || reservation.party_size;

      // Check table capacity
      const table = await this.tableRepository.findById(reservation.table_id);
      if (table && table.capacity < newPartySize) {
        const err = new Error('Table capacity is insufficient for new party size');
        err.status = 400;
        throw err;
      }

      // Check availability (exclude current reservation)
      const isAvailable = await this.reservationRepository.checkTableAvailability(
        reservation.branch_id,
        reservation.table_id,
        newDate,
        newTime,
        id
      );

      if (!isAvailable) {
        const err = new Error('TABLE_NOT_AVAILABLE');
        err.status = 409;
        throw err;
      }
    }

    // Update reservation
    const updated = await this.reservationRepository.update(id, dto);

    return updated;
  }
}

module.exports = { UpdateReservationUseCase };
