// src/controller/service-request.js
const { CreateServiceRequestSchema } = require('../dto/service-request/create');

class ServiceRequestController {
  constructor(createServiceRequestUseCase) {
    this.createServiceRequestUseCase = createServiceRequestUseCase;
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
}

module.exports = { ServiceRequestController };