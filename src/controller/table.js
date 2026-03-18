const { CreateTableBodySchema } = require('../dto/table/create-table');
const { UpdateTableBodySchema } = require('../dto/table/update-table');

class TableController {
    constructor(createTableUseCase, updateTableUseCase, deleteTableUseCase, listTablesByBranchUseCase) {
        this.createTableUseCase = createTableUseCase;
        this.updateTableUseCase = updateTableUseCase;
        this.deleteTableUseCase = deleteTableUseCase;
        this.listTablesByBranchUseCase = listTablesByBranchUseCase;
    }

    // POST /api/v1/areas/:areaId/tables
    async create(req, res, next) {
        try {
            const { areaId } = req.params;
            const dto = CreateTableBodySchema.parse(req.body);

            const result = await this.createTableUseCase.execute(areaId, dto, {
                userId: req.user.userId,
                role: req.user.role,
            });

            res.status(201).json({
                success: true,
                message: 'Table created successfully',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    // PATCH /api/v1/tables/:tableId
    async update(req, res, next) {
        try {
            const { tableId } = req.params;
            const dto = UpdateTableBodySchema.parse(req.body);

            const result = await this.updateTableUseCase.execute(tableId, dto, {
                userId: req.user.userId,
                role: req.user.role,
            });

            res.status(200).json({
                success: true,
                message: 'Table updated successfully',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const { tableId } = req.params;

            const result = await this.deleteTableUseCase.execute(tableId, {
                userId: req.user.userId,
                role: req.user.role,
            });

            res.status(200).json({ success: true, message: result.message });
        } catch (err) {
            next(err);
        }
    }

    // GET /api/v1/branches/:branchId/tables
    async listByBranch(req, res, next) {
        try {
            const { branchId } = req.params;

            const result = await this.listTablesByBranchUseCase.execute(branchId, {
                userId: req.user.userId,
                role: req.user.role,
            });

            res.status(200).json({
                success: true,
                message: 'Tables fetched successfully',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = { TableController };