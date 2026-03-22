/**
 * Complete Reservation Use Case
 * Mark reservation as completed when customer finishes dining
 */

class CompleteReservationUseCase {
  constructor(reservationRepository, tableRepository) {
    this.reservationRepository = reservationRepository;
    this.tableRepository = tableRepository;
  }

  async execute(reservationId, context) {
    const role = (context?.role || '').toLowerCase();
    
    // Staff, Manager, Owner can complete reservations
    if (role !== 'staff' && role !== 'manager' && role !== 'owner') {
      const err = new Error('Forbidden: Staff/Manager/Owner only');
      err.status = 403;
      throw err;
    }

    // Find reservation
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      const err = new Error('Reservation not found');
      err.status = 404;
      throw err;
    }

    // Check if already completed or cancelled
    if (reservation.status === 'COMPLETED') {
      const err = new Error('Reservation already completed');
      err.status = 400;
      throw err;
    }

    if (reservation.status === 'CANCELLED') {
      const err = new Error('Cannot complete cancelled reservation');
      err.status = 400;
      throw err;
    }

    // Authorization: Staff can only complete reservations in their branch
    if (role === 'staff') {
      const user = await this.reservationRepository.getUserById(context.userId);
      if (!user?.branch_id || user.branch_id !== reservation.branch_id) {
        const err = new Error('Forbidden: Staff can only complete reservations in their branch');
        err.status = 403;
        throw err;
      }
    }

    // Update reservation status to COMPLETED
    const updated = await this.reservationRepository.update(reservationId, {
      status: 'COMPLETED',
      updated_at: new Date(),
    });

    // If table was assigned, free it up
    if (reservation.table_id) {
      try {
        await this.tableRepository.updateStatus(reservation.table_id, 'AVAILABLE');
      } catch (error) {
        console.error('Error updating table status:', error);
        // Don't fail the whole operation if table update fails
      }
    }

    return {
      id: updated.id,
      status: updated.status,
      table_id: updated.table_id,
      updated_at: updated.updated_at,
    };
  }
}

module.exports = { CompleteReservationUseCase };
