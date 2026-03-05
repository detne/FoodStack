// src/controller/branch.js

class BranchController {
  constructor({ getFullMenuByBranchUseCase }) {
    this.getFullMenuByBranchUseCase = getFullMenuByBranchUseCase;
  }

  // GET /api/v1/branches/:branchId/menu
  async getMenu(req, res, next) {
    try {
      const { branchId } = req.params;
      const data = await this.getFullMenuByBranchUseCase.execute(branchId);

      res.status(200).json({
        success: true,
        message: 'Branch menu retrieved',
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { BranchController };