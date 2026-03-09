const { CreateBranchSchema } = require('../dto/branch/create-branch');
const { UpdateBranchSchema } = require('../dto/branch/update-branch');
const { ListBranchesSchema } = require('../dto/branch/list-branches');

class BranchController {
    constructor(createBranchUseCase, updateBranchUseCase, listBranchesUseCase, deleteBranchUseCase, getBranchDetailsUseCase) {
        this.createBranchUseCase = createBranchUseCase;
        this.updateBranchUseCase = updateBranchUseCase;
        this.listBranchesUseCase = listBranchesUseCase;
        this.deleteBranchUseCase = deleteBranchUseCase;
        this.getBranchDetailsUseCase = getBranchDetailsUseCase;
    }

    // POST /api/v1/branches
    async create(req, res, next) {
        try {
            const dto = CreateBranchSchema.parse(req.body);

            const result = await this.createBranchUseCase.execute(dto, {
                userId: req.user?.userId,
                role: req.user?.role,
                restaurantId: req.user?.restaurantId,
            });

            res.status(201).json({
                success: true,
                message: 'Branch created',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    // PUT /api/v1/branches/:id
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const dto = UpdateBranchSchema.parse(req.body);

            const result = await this.updateBranchUseCase.execute(id, dto, {
                userId: req.user?.userId,
                role: req.user?.role,
                restaurantId: req.user?.restaurantId,
            });

            res.status(200).json({
                success: true,
                message: 'Branch updated',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    // GET /api/v1/branches?restaurantId=...&page=1&limit=10
    async list(req, res, next) {
        try {
            const dto = ListBranchesSchema.parse(req.query);

            const result = await this.listBranchesUseCase.execute(dto);

            res.status(200).json({
                success: true,
                message: 'Branches list',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    // DELETE /api/v1/branches/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params;

            const result = await this.deleteBranchUseCase.execute(id, {
                userId: req.user?.userId,
                role: req.user?.role,
                restaurantId: req.user?.restaurantId,
            });

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (err) {
            next(err);
        }
    }

    // GET /api/v1/branches/:id
    async getDetails(req, res, next) {
        try {
            const { id } = req.params;

            const result = await this.getBranchDetailsUseCase.execute(id);

            res.status(200).json({
                success: true,
                message: 'Branch details',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = { BranchController };