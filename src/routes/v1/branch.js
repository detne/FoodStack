// src/routes/v1/branch.js
const express = require('express');

function createBranchRoutes(branchController) {
  const router = express.Router();

  // public endpoint to fetch full menu of a branch
  router.get('/:branchId/menu', (req, res, next) =>
    branchController.getMenu(req, res, next)
  );

  return router;
}

module.exports = { createBranchRoutes };
