class DeleteTableUseCase {
  constructor(
    tableRepository,
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository,
    orderRepository
  ) {
    this.tableRepository = tableRepository;
    this.areaRepository = areaRepository;
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
  }

  async execute(tableId, context) {
    const role = (context?.role || '').toLowerCase();
    if (role !== 'owner' && role !== 'manager') {
      const err = new Error('Forbidden: Owner/Manager only');
      err.status = 403;
      throw err;
    }

    // 1) Table tồn tại
    const table = await this.tableRepository.findById(tableId);
    if (!table || table.deleted_at) {
      const err = new Error('Table not found');
      err.status = 404;
      throw err;
    }

    // 2) Area + Branch để check quyền
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

    // 3) Xác thực quyền theo restaurant chứa branch
    if (role === 'owner') {
      const restaurant = await this.restaurantRepository.findOwnerIdById(branch.restaurant_id);
      if (!restaurant || restaurant.owner_id !== context.userId) {
        const err = new Error('Forbidden: Not restaurant owner');
        err.status = 403;
        throw err;
      }
    } else {
      const user = await this.userRepository.findById(context.userId);
      if (!user?.restaurant_id || user.restaurant_id !== branch.restaurant_id) {
        const err = new Error('Forbidden: Manager not in this restaurant');
        err.status = 403;
        throw err;
      }
    }

    // 4) Không cho xóa nếu đang có order ACTIVE
    const activeOrders = await this.orderRepository.countActiveOrdersByTableId(tableId);
    if (activeOrders > 0) {
      const err = new Error('Cannot delete table: there are active orders on this table');
      err.status = 409;
      throw err;
    }

    // 5) Xóa cứng
    await this.tableRepository.deleteHard(tableId);

    return { message: 'Table deleted successfully' };
  }
}

module.exports = { DeleteTableUseCase };