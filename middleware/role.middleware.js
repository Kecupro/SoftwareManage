// role.middleware.js

// Middleware kiểm tra quyền truy cập dựa trên vai trò người dùng
// Sử dụng: app.use('/route', requireRole('admin'), ...)

function requireRole(role) {
  return function (req, res, next) {
    // Giả sử req.user đã được gán bởi auth.middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

// Middleware cho phép nhiều vai trò (ví dụ: ['admin', 'pm'])
function checkRole(roles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

module.exports = { requireRole, checkRole }; 
 