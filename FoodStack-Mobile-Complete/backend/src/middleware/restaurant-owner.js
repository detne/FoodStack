// src/middleware/restaurant-owner.js
function requireRestaurantOwner(req, res, next) {
  const { restaurantId } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // check role (tùy hệ thống bạn đặt role string gì)
  if (user.role !== 'OWNER') {
    return res.status(403).json({ success: false, message: 'Forbidden: Owner only' });
  }

  // chỉ được upload cho restaurant của chính mình
  if (String(user.restaurantId) !== String(restaurantId)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Not your restaurant' });
  }

  return next();
}

module.exports = { requireRestaurantOwner };