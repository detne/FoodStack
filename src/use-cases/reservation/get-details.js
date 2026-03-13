class GetReservationDetailsUseCase {
  constructor(reservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id) {
    const reservation = await this.reservationRepository.findByIdWithDetails(id);
    
    if (!reservation) {
      const err = new Error('Reservation not found');
      err.status = 404;
      throw err;
    }

    return reservation;
  }
}

module.exports = { GetReservationDetailsUseCase };
