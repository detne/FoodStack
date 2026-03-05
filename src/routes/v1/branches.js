const express = require('express');

function createBranchRoutes(branchController, authMiddleware) {
    const router = express.Router();

    // POST /api/v1/branches
    router.post('/', authMiddleware, (req, res, next) =>
        branchController.create(req, res, next)
    );

    router.put('/:id', authMiddleware, (req, res, next) =>
        branchController.update(req, res, next)
    );

    router.get('/', authMiddleware, (req, res, next) =>
        branchController.list(req, res, next));

    router.delete('/:id', authMiddleware, (req, res, next) =>
        branchController.delete(req, res, next)
    );

    return router;
}

module.exports = { createBranchRoutes };