class ConfirmReservationUseCase {
  constructor(reservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id, auth) {
    // Check user is staff or manager
    if (!auth?.userId || !['STAFF', 'MANAGER', 'OWNER'].includes(auth.role)) {
      const err = new Error('Unauthorized: Only staff can confirm reservations');
      err.status = 403;
      throw err;
    }

    // Check reservation exists
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      const err = new Error('Reservation not found');
      err.status = 404;
      throw err;
    }

    // Check status is PENDING
    if (reservation.status !== 'PENDING') {
      const err = new Error('Only pending reservations can be confirmed');
      err.status = 400;
      throw err;
    }

    // Update status to CONFIRMED
    const updated = await this.reservationRepository.update(id, {
      status: 'CONFIRMED',
    });

    return updated;
  }
}

module.exports = { ConfirmReservationUseCase };
