const express = require('express');

function createTableRoutes(tableController, authMiddleware) {
    const router = express.Router();

    // POST /api/v1/areas/:areaId/tables
    router.post('/areas/:areaId/tables', authMiddleware, (req, res, next) =>
        tableController.create(req, res, next)
    );

    // PATCH /api/v1/tables/:tableId
    router.patch('/tables/:tableId', authMiddleware, (req, res, next) =>
        tableController.update(req, res, next)
    );

    router.delete('/tables/:tableId', authMiddleware, (req, res, next) =>
        tableController.delete(req, res, next)
    );

    return router;
}

module.exports = { createTableRoutes };