const express = require('express');

function createReservationRoutes(reservationController, authMiddleware) {
  const router = express.Router();

  // Public endpoint - check availability
  router.get('/check-availability', (req, res, next) =>
    reservationController.checkAvailability(req, res, next)
  );

  // Public endpoint - create reservation (customers can book without login)
  router.post('/', (req, res, next) =>
    reservationController.create(req, res, next)
  );

  // Protected routes - require authentication
  router.get('/', authMiddleware, (req, res, next) =>
    reservationController.list(req, res, next)
  );

  router.get('/:id', authMiddleware, (req, res, next) =>
    reservationController.getDetails(req, res, next)
  );

  router.put('/:id', authMiddleware, (req, res, next) =>
    reservationController.update(req, res, next)
  );

  router.post('/:id/cancel', authMiddleware, (req, res, next) =>
    reservationController.cancel(req, res, next)
  );

  router.post('/:id/confirm', authMiddleware, (req, res, next) =>
    reservationController.confirm(req, res, next)
  );

  router.post('/:id/complete', authMiddleware, (req, res, next) =>
    reservationController.complete(req, res, next)
  );

  router.patch('/:id/assign-table', authMiddleware, (req, res, next) =>
    reservationController.assignTable(req, res, next)
  );

  return router;
}

module.exports = { createReservationRoutes };
