// src/controller/staff.js

const { CreateStaffSchema } = require('../dto/staff/create-staff');
const { UpdateStaffSchema } = require('../dto/staff/update-staff');

class StaffController {
  constructor(createStaffUseCase, updateStaffUseCase, deleteStaffUseCase) {
    this.createStaffUseCase = createStaffUseCase;
    this.updateStaffUseCase = updateStaffUseCase;
    this.deleteStaffUseCase = deleteStaffUseCase;
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

  async updateStaff(req, res, next) {
    try {
      // Validate input
      const dto = UpdateStaffSchema.parse(req.body);
      const staffId = req.params.id;

      // Execute use case with current user context
      const result = await this.updateStaffUseCase.execute(staffId, dto, req.user);

      // Return response
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
          email: result.email,
          name: result.name,
          phone: result.phone,
          role: result.role,
          branchId: result.branchId,
          restaurantId: result.restaurantId,
          status: result.status,
          updatedAt: result.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStaff(req, res, next) {
    try {
      const staffId = req.params.id;

      // Execute use case with current user context
      const result = await this.deleteStaffUseCase.execute(staffId, req.user);

      // Return response
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
          email: result.email,
          name: result.name,
          status: result.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { StaffController };
