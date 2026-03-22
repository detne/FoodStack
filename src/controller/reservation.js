const { CreateReservationSchema } = require('../dto/reservation/create-reservation');
const { UpdateReservationSchema } = require('../dto/reservation/update-reservation');
const { ListReservationsSchema } = require('../dto/reservation/list-reservations');
const { CheckAvailabilitySchema } = require('../dto/reservation/check-availability');

class ReservationController {
  constructor({
    createReservationUseCase,
    updateReservationUseCase,
    cancelReservationUseCase,
    confirmReservationUseCase,
    completeReservationUseCase,
    assignTableToReservationUseCase,
    getReservationDetailsUseCase,
    listReservationsUseCase,
    checkTableAvailabilityUseCase,
  }) {
    this.createReservationUseCase = createReservationUseCase;
    this.updateReservationUseCase = updateReservationUseCase;
    this.cancelReservationUseCase = cancelReservationUseCase;
    this.confirmReservationUseCase = confirmReservationUseCase;
    this.completeReservationUseCase = completeReservationUseCase;
    this.assignTableToReservationUseCase = assignTableToReservationUseCase;
    this.getReservationDetailsUseCase = getReservationDetailsUseCase;
    this.listReservationsUseCase = listReservationsUseCase;
    this.checkTableAvailabilityUseCase = checkTableAvailabilityUseCase;
  }

  // POST /api/v1/reservations
  async create(req, res, next) {
    try {
      const dto = CreateReservationSchema.parse(req.body);
      const result = await this.createReservationUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Reservation created',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/v1/reservations/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const dto = UpdateReservationSchema.parse(req.body);

      const result = await this.updateReservationUseCase.execute(id, dto, {
        userId: req.user?.userId,
        role: req.user?.role,
      });

      res.status(200).json({
        success: true,
        message: 'Reservation updated',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/reservations/:id/cancel
  async cancel(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.cancelReservationUseCase.execute(id, {
        userId: req.user?.userId,
        role: req.user?.role,
      });

      res.status(200).json({
        success: true,
        message: 'Reservation cancelled',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/reservations/:id/confirm
  async confirm(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.confirmReservationUseCase.execute(id, {
        userId: req.user?.userId,
        role: req.user?.role,
      });

      res.status(200).json({
        success: true,
        message: 'Reservation confirmed',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/reservations/:id/complete
  async complete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await this.completeReservationUseCase.execute(id, {
        userId: req.user?.userId,
        role: req.user?.role,
      });

      res.status(200).json({
        success: true,
        message: 'Reservation completed',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/v1/reservations/:id/assign-table
  async assignTable(req, res, next) {
    try {
      const { id } = req.params;
      const { tableId } = req.body;

      if (!tableId) {
        const err = new Error('tableId is required');
        err.status = 400;
        throw err;
      }

      const result = await this.assignTableToReservationUseCase.execute(id, tableId, {
        userId: req.user?.userId,
        role: req.user?.role,
      });

      res.status(200).json({
        success: true,
        message: 'Table assigned to reservation',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/reservations/:id
  async getDetails(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.getReservationDetailsUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: 'Reservation details',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/reservations?branchId=...&status=...&date=...&page=1&limit=10
  async list(req, res, next) {
    try {
      const dto = ListReservationsSchema.parse(req.query);

      const result = await this.listReservationsUseCase.execute(dto, {
        userId: req.user?.userId,
        role: req.user?.role,
        branchId: req.user?.branchId,
      });

      res.status(200).json({
        success: true,
        message: 'Reservations list',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/reservations/check-availability?branchId=...&reservationDate=...&reservationTime=...&partySize=...
  async checkAvailability(req, res, next) {
    try {
      const dto = CheckAvailabilitySchema.parse(req.query);
      const result = await this.checkTableAvailabilityUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Table availability checked',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { ReservationController };
