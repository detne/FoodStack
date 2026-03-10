class DeleteAreaUseCase {
  constructor(areaRepository, branchRepository, restaurantRepository, userRepository) {
    this.areaRepository = areaRepository;
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
  }

  async execute(areaId, context) {
    const role = (context?.role || '').toLowerCase();
    if (role !== 'owner' && role !== 'manager') {
      const err = new Error('Forbidden: Owner/Manager only');
      err.status = 403;
      throw err;
    }

    // 1) Area tồn tại
    const area = await this.areaRepository.findById(areaId);
    if (!area || area.deleted_at) {
      const err = new Error('Area not found');
      err.status = 404;
      throw err;
    }

    // 2) Branch tồn tại để check quyền theo restaurant
    const branch = await this.branchRepository.findById(area.branch_id);
    if (!branch || branch.deleted_at) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // 3) Check quyền
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

    // 4) Không cho xoá nếu còn bàn đang hoạt động
    const activeTablesCount = await this.areaRepository.countActiveTables(areaId);
    if (activeTablesCount > 0) {
      const err = new Error('Cannot delete area: there are active tables in this area');
      err.status = 409;
      throw err;
    }

    // 5) Xoá cứng
    await this.areaRepository.deleteHard(areaId);

    return { message: 'Area deleted successfully' };
  }
}

module.exports = { DeleteAreaUseCase };