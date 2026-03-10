class UpdateAreaUseCase {
  constructor(areaRepository, branchRepository, restaurantRepository, userRepository) {
    this.areaRepository = areaRepository;
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
  }

  async execute(areaId, dto, context) {
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

    // 2) Branch tồn tại (để lấy restaurant_id)
    const branch = await this.branchRepository.findById(area.branch_id);
    if (!branch || branch.deleted_at) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // 3) Xác thực quyền
    if (role === 'owner') {
      const restaurant = await this.restaurantRepository.findOwnerIdById(branch.restaurant_id);
      if (!restaurant || restaurant.owner_id !== context.userId) {
        const err = new Error('Forbidden: Not restaurant owner');
        err.status = 403;
        throw err;
      }
    } else {
      // manager: phải thuộc restaurant của branch
      const user = await this.userRepository.findById(context.userId);
      if (!user?.restaurant_id || user.restaurant_id !== branch.restaurant_id) {
        const err = new Error('Forbidden: Manager not in this restaurant');
        err.status = 403;
        throw err;
      }
    }

    // 4) Build update data
    const updateData = { updated_at: new Date() };

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) {
        const err = new Error('Invalid area name');
        err.status = 400;
        throw err;
      }

      // Không trùng tên trong cùng branch (trừ chính nó)
      const exists = await this.areaRepository.findByBranchAndNameExcludeId(
        area.branch_id,
        name,
        area.id
      );
      if (exists) {
        const err = new Error('Area name already exists in this branch');
        err.status = 409;
        throw err;
      }

      updateData.name = name;
    }

    if (dto.sortOrder !== undefined) {
      updateData.sort_order = dto.sortOrder;
    }

    // 5) Update
    const updated = await this.areaRepository.update(area.id, updateData);

    return {
      id: updated.id,
      branch_id: updated.branch_id,
      name: updated.name,
      sort_order: updated.sort_order,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}

module.exports = { UpdateAreaUseCase };