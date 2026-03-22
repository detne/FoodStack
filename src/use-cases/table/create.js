const { ObjectId } = require('mongodb');

class CreateTableUseCase {
  constructor(
    tableRepository,
    areaRepository,
    branchRepository,
    restaurantRepository,
    userRepository,
    qrService,
    cloudinaryUploadService
  ) {
    this.tableRepository = tableRepository;
    this.areaRepository = areaRepository;
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
    this.qrService = qrService;
    this.cloudinaryUploadService = cloudinaryUploadService;
  }

  async execute(areaId, dto, context) {
    const role = (context?.role || '').toLowerCase();
    if (role !== 'owner' && role !== 'manager') {
      const err = new Error('Forbidden: Owner/Manager only');
      err.status = 403;
      throw err;
    }

    const tableNumber = dto.tableNumber.trim();
    if (!tableNumber) {
      const err = new Error('Invalid table number');
      err.status = 400;
      throw err;
    }
    if (!Number.isInteger(dto.capacity) || dto.capacity <= 0) {
      const err = new Error('Capacity must be > 0');
      err.status = 400;
      throw err;
    }

    // 1) Area tồn tại
    const area = await this.areaRepository.findById(areaId);
    if (!area || area.deleted_at) {
      const err = new Error('Area not found');
      err.status = 404;
      throw err;
    }

    // 2) Branch tồn tại
    const branch = await this.branchRepository.findById(area.branch_id);
    if (!branch || branch.deleted_at) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // 3) Check quyền theo restaurant chứa branch
    if (role === 'owner') {
      const restaurant = await this.restaurantRepository.findOwnerIdById(branch.restaurant_id);
      if (!restaurant || restaurant.owner_id !== context.userId) {
        const err = new Error('Forbidden: Not restaurant owner');
        err.status = 403;
        throw err;
      }
    } else {
      const user = await this.userRepository.findById(context.userId);
      if (!user?.restaurant_id || user.restaurant_id !== branch.restaurant_id) {
        const err = new Error('Forbidden: Manager not in this restaurant');
        err.status = 403;
        throw err;
      }
    }

    // 4) Không trùng số bàn trong cùng branch
    const dup = await this.tableRepository.findByBranchAndTableNumber(branch.id, tableNumber);
    if (dup) {
      const err = new Error('Table number already exists in this branch');
      err.status = 409;
      throw err;
    }

    // 5) Create table trước - Use MongoDB ObjectId
    const now = new Date();
    const tableId = new ObjectId().toString();
    const qrToken = new ObjectId().toString();

    const table = await this.tableRepository.create({
      id: tableId,
      area_id: areaId,
      table_number: tableNumber,
      capacity: dto.capacity,
      qr_token: qrToken,
      qr_code_url: null,
      status: 'AVAILABLE',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });

    // 6) Generate QR content (URL customer scan)
    const baseUrl = process.env.CUSTOMER_APP_URL || 'https://your-customer-app.com';
    const qrContentUrl = `${baseUrl}/t/${qrToken}`;

    try {
      // 7) Generate PNG buffer + upload Cloudinary
      console.log('Generating QR code for:', qrContentUrl);
      const pngBuffer = await this.qrService.generatePngBuffer(qrContentUrl);
      console.log('QR buffer generated, size:', pngBuffer.length);

      console.log('Uploading to Cloudinary...');
      const { url } = await this.cloudinaryUploadService.uploadPngBuffer(pngBuffer, {
        folder: 'foodstack/qr/tables',
        publicId: tableId, // dùng tableId làm publicId
      });
      console.log('Cloudinary upload successful:', url);

      // 8) Update qr_code_url
      await this.tableRepository.update(tableId, {
        qr_code_url: url,
        updated_at: new Date(),
      });

      return {
        id: table.id,
        area_id: table.area_id,
        table_number: table.table_number,
        capacity: table.capacity,
        qr_token: table.qr_token,
        qr_code_url: url,
        status: table.status,
        created_at: table.created_at,
        updated_at: new Date(),
      };
    } catch (qrError) {
      console.error('QR/Cloudinary error:', qrError);
      
      // Fallback: Return table without QR code
      console.log('Returning table without QR code due to error');
      return {
        id: table.id,
        area_id: table.area_id,
        table_number: table.table_number,
        capacity: table.capacity,
        qr_token: table.qr_token,
        qr_code_url: null, // No QR code due to error
        status: table.status,
        created_at: table.created_at,
        updated_at: table.updated_at,
      };
    }
  }
}

module.exports = { CreateTableUseCase };