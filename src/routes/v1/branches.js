const express = require('express');

function createBranchRoutes(branchController, areaController, authMiddleware) {
    const router = express.Router();

    // POST /api/v1/branches
    router.post('/', authMiddleware, (req, res, next) =>
        branchController.create(req, res, next)
    );

    // GET /api/v1/branches
    router.get('/', authMiddleware, (req, res, next) =>
        branchController.list(req, res, next)
    );

    // ✅ Nested resource: Areas under Branch
    // POST /api/v1/branches/:branchId/areas
    router.post('/:branchId/areas', authMiddleware, (req, res, next) =>
        areaController.create(req, res, next)
    );

    router.get('/:branchId/areas', authMiddleware, (req, res, next) =>
        areaController.listByBranch(req, res, next)
    );

    // PUT /api/v1/branches/:id
    router.put('/:id', authMiddleware, (req, res, next) =>
        branchController.update(req, res, next)
    );

    // GET /api/v1/branches/:id
    router.get('/:id', authMiddleware, (req, res, next) =>
        branchController.getDetails(req, res, next)
    );

    // DELETE /api/v1/branches/:id
    router.delete('/:id', authMiddleware, (req, res, next) =>
        branchController.delete(req, res, next)
    );

    return router;
}

module.exports = { createBranchRoutes };