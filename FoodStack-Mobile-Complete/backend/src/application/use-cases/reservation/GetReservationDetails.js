class GetReservationDetails {
  constructor({ reservationRepository }) {
    this.reservationRepository = reservationRepository;
  }

  async execute(id) {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) throw { code: 'RESERVATION_NOT_FOUND', message: 'Reservation does not exist' };
    return reservation;
  }
}

module.exports = { GetReservationDetails };