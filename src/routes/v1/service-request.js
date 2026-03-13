// src/routes/v1/service-request.js
const express = require('express');

function createServiceRequestRoutes(serviceRequestController) {
  const router = express.Router();

  // POST /api/v1/service-requests
  router.post('/', (req, res, next) => 
    serviceRequestController.createServiceRequest(req, res, next)
  );

  return router;
}

module.exports = { createServiceRequestRoutes };