// src/use-cases/staff/get-staff-list.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class GetStaffListUseCase {
  constructor(userRepository, restaurantRepository, branchRepository, prisma) {
    this.userRepository = userRepository;
    this.restaurantRepository = restaurantRepository;
    this.branchRepository = branchRepository;
    this.prisma = prisma;
  }

  async execute(dto, currentUser) {
    console.log('GetStaffListUseCase - Input:', { dto, currentUser });
    
    // 1. Validate current user is OWNER or MANAGER
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      throw new UnauthorizedError('Only Owner or Manager can view staff list');
    }

    const { page, limit, search, status, branchId } = dto;

    // 2. Get restaurant ID from JWT token
    let restaurantId = currentUser.restaurantId; // JWT uses camelCase
    
    console.log('GetStaffListUseCase - restaurantId from token:', restaurantId);
    
    if (!restaurantId) {
      console.log('GetStaffListUseCase - Error: No restaurantId found for user:', currentUser.userId || currentUser.id);
      throw new ValidationError('Current user does not have a restaurantId');
    }

    console.log('GetStaffListUseCase - Using restaurantId:', restaurantId);

    // 2.1. Determine which branch to filter by
    let filterBranchId = branchId; // From query param (Owner selecting branch)
    
    if (!filterBranchId) {
      // If no branchId in query, get from user (Manager's branch)
      const fullUser = await this.userRepository.findById(currentUser.userId);
      filterBranchId = fullUser?.branch_id;
    }
    
    console.log('GetStaffListUseCase - Filter branch ID:', {
      fromQuery: branchId,
      fromUser: filterBranchId,
      role: currentUser.role
    });

    // 3. Build filter conditions
    const where = {
      restaurant_id: restaurantId,
      role: 'STAFF', // Only show STAFF (not MANAGER or OWNER)
      status: status ? status : undefined,
    };

    // 3.1. Filter by branch if available
    if (filterBranchId) {
      where.branch_id = filterBranchId;
      console.log('GetStaffListUseCase - Filtering by branch:', filterBranchId);
    } else {
      console.log('GetStaffListUseCase - No branch filter (showing all staff)');
    }

    // 4. Add search filter if specified
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 6. Calculate pagination
    const skip = (page - 1) * limit;

    console.log('GetStaffListUseCase - Query where:', where);

    try {
      // 7. Fetch staff list with pagination
    const [staffList, total] = await this.prisma.$transaction([
      this.prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          role: true,
          status: true,
          created_at: true,
          updated_at: true,
          branch_id: true, // Now this should work
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    console.log('GetStaffListUseCase - Found staff:', staffList.length, 'Total:', total);

    // 8. Get branch information separately if needed
    const branchIds = [...new Set(staffList.map(staff => staff.branch_id).filter(Boolean))];
    const branches = branchIds.length > 0 ? await this.prisma.branches.findMany({
      where: { id: { in: branchIds } },
      select: { id: true, name: true, address: true }
    }) : [];

    const branchMap = branches.reduce((map, branch) => {
      map[branch.id] = branch;
      return map;
    }, {});

    // 9. Map staff data to match frontend interface
    const staffWithBranch = staffList.map((staff) => ({
      id: staff.id,
      email: staff.email,
      full_name: staff.full_name,
      phone: staff.phone,
      role: staff.role, // This will be a string like 'STAFF', 'MANAGER'
      status: staff.status,
      created_at: staff.created_at.toISOString(),
      updated_at: staff.updated_at.toISOString(),
      // Branch info from separate query
      branch: staff.branch_id && branchMap[staff.branch_id] ? branchMap[staff.branch_id] : null,
    }));

    console.log('GetStaffListUseCase - Final result:', { 
      staffCount: staffWithBranch.length, 
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });

    return {
      staff: {
        items: staffWithBranch, // Wrap in items for consistency
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Staff list retrieved successfully',
    };
    } catch (error) {
      console.error('GetStaffListUseCase - Error:', error);
      throw error;
    }
  }
}

module.exports = { GetStaffListUseCase };
