class DeleteBranchUseCase {
  constructor(branchRepository) {
    this.branchRepository = branchRepository;
  }

  async execute(branchId, auth) {
    // must login
    if (!auth?.userId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    // ✅ only owner
    if (auth.role !== 'OWNER') {
      const err = new Error('Forbidden: Owner only');
      err.status = 403;
      throw err;
    }

    // ✅ branch exists
    const branch = await this.branchRepository.findById(branchId);
    if (!branch || branch.deleted_at) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // ✅ owner đúng restaurant
    if (!auth.restaurantId || String(auth.restaurantId) !== String(branch.restaurant_id)) {
      const err = new Error('Forbidden: Not your restaurant');
      err.status = 403;
      throw err;
    }

    // ✅ mark inactive (not hard delete)
    await this.branchRepository.deactivate(branchId);

    return { message: 'Branch deactivated successfully' };
  }
}

module.exports = { DeleteBranchUseCase };