const express = require('express');

function createAreaRoutes(areaController, authMiddleware) {
    const router = express.Router();

    // PATCH /api/v1/areas/:areaId
    router.patch('/:areaId', authMiddleware, (req, res, next) =>
        areaController.update(req, res, next)
    );

    router.delete('/:areaId', authMiddleware, (req, res, next) =>
        areaController.delete(req, res, next)
    );

    return router;
}

module.exports = { createAreaRoutes };