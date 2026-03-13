class CancelReservationUseCase {
  constructor(reservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id, auth) {
    // Check reservation exists
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      const err = new Error('Reservation not found');
      err.status = 404;
      throw err;
    }

    // Check not already cancelled
    if (reservation.status === 'CANCELLED') {
      const err = new Error('Reservation is already cancelled');
      err.status = 400;
      throw err;
    }

    // Update status to CANCELLED
    const updated = await this.reservationRepository.update(id, {
      status: 'CANCELLED',
    });

    return updated;
  }
}

module.exports = { CancelReservationUseCase };
