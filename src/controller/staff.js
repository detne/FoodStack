// src/controller/staff.js

const { CreateStaffSchema } = require('../dto/staff/create-staff');

class StaffController {
  constructor(createStaffUseCase) {
    this.createStaffUseCase = createStaffUseCase;
  }

  async createStaff(req, res, next) {
    try {
      // Validate input
      const dto = CreateStaffSchema.parse(req.body);

      // Execute use case with current user context
      const result = await this.createStaffUseCase.execute(dto, req.user);

      // Return response
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
          email: result.email,
          name: result.name,
          role: result.role,
          branchId: result.branchId,
          restaurantId: result.restaurantId,
          status: result.status,
          ...(result.tempPassword && { tempPassword: result.tempPassword }),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { StaffController };
