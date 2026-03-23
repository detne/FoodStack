/**
 * Assign Table to Reservation Use Case
 * Assign or reassign a table to a reservation
 */

class AssignTableToReservationUseCase {
  constructor(reservationRepository, tableRepository) {
    this.reservationRepository = reservationRepository;
    this.tableRepository = tableRepository;
  }

  async execute(reservationId, tableId, context) {
    const role = (context?.role || '').toLowerCase();
    
    // Staff, Manager, Owner can assign tables
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

    // Cannot assign table to cancelled or completed reservations
    if (reservation.status === 'CANCELLED' || reservation.status === 'COMPLETED') {
      const err = new Error('Cannot assign table to cancelled or completed reservation');
      err.status = 400;
      throw err;
    }

    // Find table
    const table = await this.tableRepository.findById(tableId);
    if (!table || table.deleted_at) {
      const err = new Error('Table not found');
      err.status = 404;
      throw err;
    }

    // Check if table belongs to same branch as reservation
    const area = await this.tableRepository.getAreaById(table.area_id);
    if (!area || area.branch_id !== reservation.branch_id) {
      const err = new Error('Table must be in the same branch as reservation');
      err.status = 400;
      throw err;
    }

    // Authorization: Staff can only assign tables in their branch
    if (role === 'staff') {
      const user = await this.reservationRepository.getUserById(context.userId);
      if (!user?.branch_id || user.branch_id !== reservation.branch_id) {
        const err = new Error('Forbidden: Staff can only assign tables in their branch');
        err.status = 403;
        throw err;
      }
    }

    // Check if table capacity is sufficient
    if (table.capacity < reservation.party_size) {
      const err = new Error(`Table capacity (${table.capacity}) is less than party size (${reservation.party_size})`);
      err.status = 400;
      throw err;
    }

    // Update reservation with table assignment
    const updated = await this.reservationRepository.update(reservationId, {
      table_id: tableId,
      updated_at: new Date(),
    });

    return {
      id: updated.id,
      table_id: updated.table_id,
      status: updated.status,
      updated_at: updated.updated_at,
    };
  }
}

module.exports = { AssignTableToReservationUseCase };
