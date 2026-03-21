class CheckTableAvailability {
  constructor({ reservationRepository }) {
    this.reservationRepository = reservationRepository;
  }

  async execute(dto) {
    // Trả về danh sách bàn còn trống
    return await this.reservationRepository.findAvailableTables(
      dto.branchId,
      dto.partySize,
      dto.reservationDate,
      dto.reservationTime
    );
  }
}

module.exports = { CheckTableAvailability };