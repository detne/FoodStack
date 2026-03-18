const express = require('express');

function createBranchRoutes(branchController, areaController, tableController, authMiddleware) {
  const router = express.Router();

  // Public endpoint
  router.get('/:branchId/menu', (req, res, next) =>
    branchController.getMenu(req, res, next)
  );

  // Protected branch routes
  router.post('/', authMiddleware, (req, res, next) =>
    branchController.create(req, res, next)
  );

  router.get('/', authMiddleware, (req, res, next) =>
    branchController.list(req, res, next)
  );

  router.put('/:id', authMiddleware, (req, res, next) =>
    branchController.update(req, res, next)
  );

  router.get('/:id', authMiddleware, (req, res, next) =>
    branchController.getDetails(req, res, next)
  );

  router.delete('/:id', authMiddleware, (req, res, next) =>
    branchController.delete(req, res, next)
  );

  router.post('/:branchId/areas', authMiddleware, (req, res, next) =>
    areaController.create(req, res, next)
  );

  router.get('/:branchId/areas', authMiddleware, (req, res, next) =>
    areaController.listByBranch(req, res, next)
  );

  router.get('/:branchId/tables', authMiddleware, (req, res, next) =>
    tableController.listByBranch(req, res, next)
  );

  return router;
}

module.exports = { createBranchRoutes };