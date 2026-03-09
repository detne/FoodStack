class UpdateBranchUseCase {
  constructor(branchRepository) {
    this.branchRepository = branchRepository;
  }

  /**
   * @param {string} branchId
   * @param {Object} dto - fields to update
   * @param {Object} auth - { userId, role, restaurantId }
   */
  async execute(branchId, dto, auth) {
    // logged in
    if (!auth?.userId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    // ✅ Branch tồn tại
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // ✅ Xác thực quyền owner
    // Owner chỉ được update branch thuộc restaurant của mình
    if (auth.role !== 'OWNER') {
      const err = new Error('Forbidden: Owner only');
      err.status = 403;
      throw err;
    }

    if (!auth.restaurantId || String(auth.restaurantId) !== String(branch.restaurant_id)) {
      const err = new Error('Forbidden: Not your restaurant');
      err.status = 403;
      throw err;
    }

    // ✅ Cập nhật dữ liệu thành công
    const updated = await this.branchRepository.update(branchId, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    });

    return updated;
  }
}

module.exports = { UpdateBranchUseCase };