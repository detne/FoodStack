class GetRestaurantDetailsUseCase {
    constructor(restaurantRepository, branchRepository) {
        this.restaurantRepository = restaurantRepository;
        this.branchRepository = branchRepository;
    }

    async execute(restaurantId) {
        if (!restaurantId) throw new Error('Restaurant ID is required');

        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) throw new Error('Restaurant not found');

        const branches = await this.branchRepository.findByRestaurantId(restaurantId);

        // AC: Include logo URL + settings (fallback vì DB chưa có)
        // AC: Include logo URL + settings
        const logoUrl = restaurant.logo_url ?? null;

        const settings = {
            currency: 'VND',
            timezone: 'Asia/Ho_Chi_Minh',
            taxRate: Number(process.env.TAX_RATE ?? 0.1),
            serviceChargeRate: Number(process.env.SERVICE_CHARGE_RATE ?? 0.05),
        };

        // Option B: chuẩn hoá API camelCase (không trả raw DB fields snake_case)
        return {
            id: restaurant.id,
            name: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone,
            address: restaurant.address,
            status: restaurant.status,

            createdAt: restaurant.created_at,
            updatedAt: restaurant.updated_at,

            logoUrl,
            settings,

            branches: (branches || []).map((b) => ({
                id: b.id,
                restaurantId: b.restaurant_id,
                name: b.name,
                address: b.address,
                phone: b.phone,
                status: b.status,
                createdAt: b.created_at,
                updatedAt: b.updated_at,
            })),
        };
    }

    /**
     * Get restaurants owned by a user (for OWNER role)
     * @param {string} ownerId - User ID who owns the restaurants
     * @returns {Promise<Array>} Array of restaurants
     */
    async getOwnedRestaurants(ownerId) {
        if (!ownerId) throw new Error('Owner ID is required');

        const restaurants = await this.restaurantRepository.findByOwnerId(ownerId);
        
        return restaurants.map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone,
            address: restaurant.address,
            logoUrl: restaurant.logo_url,
            status: restaurant.status,
            emailVerified: restaurant.email_verified,
            createdAt: restaurant.created_at,
            updatedAt: restaurant.updated_at,
        }));
    }
}

module.exports = { GetRestaurantDetailsUseCase };