// middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

// Fake auth middleware for testing - bypasses authentication
const fakeAuthMiddleware = async (req, res, next) => {
  try {
    // Create a fake user for testing
    req.user = {
      _id: '507f1f77bcf86cd799439011', // Fake ObjectId
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      isActive: true
    };
    next();
  } catch (error) {
    console.error('Fake auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực'
    });
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp'
      });
    }

    const token = authHeader.substring(7); // Bỏ 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Tìm user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Kiểm tra user có active không
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Thêm user vào request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực'
    });
  }
};

// Middleware để kiểm tra quyền
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    next();
  };
};

// Middleware để kiểm tra vai trò
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    next();
  };
};

// Middleware để kiểm tra quyền truy cập dữ liệu
const checkDataAccess = (dataType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }

    // Admin có quyền truy cập tất cả
    if (req.user.role === 'admin') {
      return next();
    }

    const dataId = req.params.id || req.body[dataType];
    if (!dataId) {
      return next();
    }

    // Kiểm tra quyền truy cập dữ liệu
    if (!req.user.canAccessData(dataType, dataId)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập dữ liệu này'
      });
    }

    next();
  };
};

// Middleware để lọc dữ liệu theo phạm vi quyền
const filterDataByScope = (dataType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }

    // Admin có thể xem tất cả
    if (req.user.role === 'admin') {
      return next();
    }

    // Thêm filter theo phạm vi dữ liệu
    const dataScope = req.user.dataScope[dataType] || [];
    if (dataScope.length > 0) {
      req.dataFilter = { [dataType]: { $in: dataScope } };
    }

    next();
  };
};

// Middleware để kiểm tra quyền đối tác
const checkPartnerAccess = () => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }

    // Đối tác chỉ có thể truy cập dữ liệu của mình
    if (req.user.role === 'partner') {
      const partnerId = req.params.partnerId || req.body.partnerId;
      if (partnerId && !req.user.canAccessData('partner', partnerId)) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập dữ liệu đối tác này'
        });
      }
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  fakeAuthMiddleware,
  checkPermission,
  checkRole,
  checkDataAccess,
  filterDataByScope,
  checkPartnerAccess
};