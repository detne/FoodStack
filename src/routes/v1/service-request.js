// src/routes/v1/service-request.js
const express = require('express');

function createServiceRequestRoutes(serviceRequestController, authMiddleware) {
  const router = express.Router();

  // POST /api/v1/service-requests - Create new service request (no auth required)
  router.post('/', (req, res, next) => 
    serviceRequestController.createServiceRequest(req, res, next)
  );

  // GET /api/v1/service-requests - List service requests for staff (auth required)
  router.get('/', authMiddleware, (req, res, next) => 
    serviceRequestController.listServiceRequests(req, res, next)
  );

  // GET /api/v1/service-requests/pending - Get pending requests with pagination (auth required)
  router.get('/pending', authMiddleware, (req, res, next) => 
    serviceRequestController.getPendingServiceRequests(req, res, next)
  );

  // PUT /api/v1/service-requests/acknowledge - Staff acknowledge request (auth required)
  router.put('/acknowledge', authMiddleware, (req, res, next) => 
    serviceRequestController.acknowledgeServiceRequest(req, res, next)
  );

  // PUT /api/v1/service-requests/resolve - Staff resolve request (auth required)
  router.put('/resolve', authMiddleware, (req, res, next) => 
    serviceRequestController.resolveServiceRequest(req, res, next)
  );

  return router;
}

module.exports = { createServiceRequestRoutes };