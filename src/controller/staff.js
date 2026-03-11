// src/controller/staff.js

const { CreateStaffSchema } = require('../dto/staff/create-staff');
const { UpdateStaffSchema } = require('../dto/staff/update-staff');
const { UpdateStaffRoleSchema } = require('../dto/staff/update-staff-role');
const { GetStaffListSchema } = require('../dto/staff/get-staff-list');
const { SetStaffStatusSchema } = require('../dto/staff/set-staff-status');

class StaffController {
  constructor(
    createStaffUseCase,
    updateStaffUseCase,
    updateStaffRoleUseCase,
    deleteStaffUseCase,
    getStaffListUseCase,
    setStaffStatusUseCase
  ) {
    this.createStaffUseCase = createStaffUseCase;
    this.updateStaffUseCase = updateStaffUseCase;
    this.updateStaffRoleUseCase = updateStaffRoleUseCase;
    this.deleteStaffUseCase = deleteStaffUseCase;
    this.getStaffListUseCase = getStaffListUseCase;
    this.setStaffStatusUseCase = setStaffStatusUseCase;
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

  async updateStaffRole(req, res, next) {
    try {
      // Validate input
      const dto = UpdateStaffRoleSchema.parse(req.body);
      const staffId = req.params.id;

      // Execute use case with current user context
      const result = await this.updateStaffRoleUseCase.execute(staffId, dto, req.user);

      // Return response
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
          email: result.email,
          name: result.name,
          role: result.role,
          status: result.status,
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

  async getStaffList(req, res, next) {
    try {
      // Validate input
      const dto = GetStaffListSchema.parse({
        ...req.query,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      });

      // Execute use case with current user context
      const result = await this.getStaffListUseCase.execute(dto, req.user);

      // Return response
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.staff,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async setStaffStatus(req, res, next) {
    try {
      // Validate input
      const dto = SetStaffStatusSchema.parse(req.body);
      const staffId = req.params.id;

      // Execute use case with current user context
      const result = await this.setStaffStatusUseCase.execute(staffId, dto, req.user);

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
