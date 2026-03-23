class UpdateTableUseCase {
  constructor(tableRepository, areaRepository, branchRepository, restaurantRepository, userRepository) {
    this.tableRepository = tableRepository;
    this.areaRepository = areaRepository;
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
  }

  async execute(tableId, dto, context) {
    const role = (context?.role || '').toLowerCase();
    if (role !== 'owner' && role !== 'manager' && role !== 'staff') {
      const err = new Error('Forbidden: Owner/Manager/Staff only');
      err.status = 403;
      throw err;
    }

    const table = await this.tableRepository.findById(tableId);
    if (!table || table.deleted_at) {
      const err = new Error('Table not found');
      err.status = 404;
      throw err;
    }

    const area = await this.areaRepository.findById(table.area_id);
    if (!area || area.deleted_at) {
      const err = new Error('Area not found');
      err.status = 404;
      throw err;
    }

    const branch = await this.branchRepository.findById(area.branch_id);
    if (!branch || branch.deleted_at) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // Authorization checks
    if (role === 'owner') {
      const restaurant = await this.restaurantRepository.findOwnerIdById(branch.restaurant_id);
      if (!restaurant || restaurant.owner_id !== context.userId) {
        const err = new Error('Forbidden: Not restaurant owner');
        err.status = 403;
        throw err;
      }
    } else if (role === 'manager') {
      const user = await this.userRepository.findById(context.userId);
      if (!user?.restaurant_id || user.restaurant_id !== branch.restaurant_id) {
        const err = new Error('Forbidden: Manager not in this restaurant');
        err.status = 403;
        throw err;
      }
    } else if (role === 'staff') {
      // Staff can only update tables in their assigned branch
      const user = await this.userRepository.findById(context.userId);
      if (!user?.branch_id || user.branch_id !== branch.id) {
        const err = new Error('Forbidden: Staff can only update tables in their assigned branch');
        err.status = 403;
        throw err;
      }
    }

    const updateData = { updated_at: new Date() };

    // Staff can only update status, not capacity
    if (dto.capacity !== undefined) {
      if (role === 'staff') {
        const err = new Error('Forbidden: Staff cannot update table capacity');
        err.status = 403;
        throw err;
      }
      if (!Number.isInteger(dto.capacity) || dto.capacity <= 0) {
        const err = new Error('Capacity must be > 0');
        err.status = 400;
        throw err;
      }
      updateData.capacity = dto.capacity;
    }

    if (dto.status !== undefined) {
      // dto.status đã là IN HOA: AVAILABLE|OCCUPIED|RESERVED|OUTOFSERVICE
      updateData.status = dto.status; // ✅ đồng bộ IN HOA trong DB
    }

    const updated = await this.tableRepository.update(tableId, updateData);

    return {
      id: updated.id,
      area_id: updated.area_id,
      table_number: updated.table_number,
      capacity: updated.capacity,
      qr_token: updated.qr_token,
      qr_code_url: updated.qr_code_url,
      status: updated.status, // ✅ sẽ là IN HOA
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}

module.exports = { UpdateTableUseCase };