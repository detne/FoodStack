// src/controller/service-request.js
const { CreateServiceRequestSchema } = require('../dto/service-request/create');
const { AcknowledgeServiceRequestSchema } = require('../dto/service-request/acknowledge');

class ServiceRequestController {
  constructor(createServiceRequestUseCase, acknowledgeServiceRequestUseCase, listServiceRequestsByBranchUseCase) {
    this.createServiceRequestUseCase = createServiceRequestUseCase;
    this.acknowledgeServiceRequestUseCase = acknowledgeServiceRequestUseCase;
    this.listServiceRequestsByBranchUseCase = listServiceRequestsByBranchUseCase;
  }

  async createServiceRequest(req, res, next) {
    try {
      const dto = CreateServiceRequestSchema.parse(req.body);
      const result = await this.createServiceRequestUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async acknowledgeServiceRequest(req, res, next) {
    try {
      const dto = AcknowledgeServiceRequestSchema.parse(req.body);
      const staffId = req.user.userId; // From auth middleware (JWT payload has userId, not id)
      const result = await this.acknowledgeServiceRequestUseCase.execute(dto, staffId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async listServiceRequests(req, res, next) {
    try {
      const staffId = req.user.userId; // From auth middleware (JWT payload has userId, not id)
      const status = req.query.status; // Optional filter
      const result = await this.listServiceRequestsByBranchUseCase.execute(staffId, status);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { ServiceRequestController };