const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user.model');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username phải có từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username chỉ được chứa chữ cái, số và dấu gạch dưới'),
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải có từ 2-100 ký tự'),
  body('role')
    .isIn(['partner', 'ba', 'po', 'pm', 'dev', 'qa', 'devops', 'admin'])
    .withMessage('Vai trò không hợp lệ')
];

const publicRegisterValidation = [
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải có từ 2-100 ký tự'),
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('phone')
    .notEmpty()
    .withMessage('Số điện thoại không được để trống'),
  body('department')
    .notEmpty()
    .withMessage('Phòng ban không được để trống'),
  body('role')
    .isIn(['dev', 'qa', 'ba', 'po', 'pm', 'devops'])
    .withMessage('Vai trò không hợp lệ')
];

const partnerRegisterValidation = [
  body('companyName')
    .isLength({ min: 2, max: 200 })
    .withMessage('Tên công ty phải có từ 2-200 ký tự'),
  body('contactPerson')
    .isLength({ min: 2, max: 100 })
    .withMessage('Người đại diện phải có từ 2-100 ký tự'),
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('phone')
    .notEmpty()
    .withMessage('Số điện thoại không được để trống'),
  body('address')
    .notEmpty()
    .withMessage('Địa chỉ không được để trống'),
  body('taxCode')
    .notEmpty()
    .withMessage('Mã số thuế không được để trống'),
  body('businessType')
    .notEmpty()
    .withMessage('Loại hình kinh doanh không được để trống')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
];

// @route   POST /api/auth/register-admin
// @desc    Đăng ký tài khoản mới (chỉ admin mới có thể tạo tài khoản)
// @access  Private (Admin only)
router.post('/register-admin', authMiddleware, checkRole('admin'), registerValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { username, email, password, fullName, role, profile } = req.body;

    // Kiểm tra username đã tồn tại
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username đã tồn tại'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    // Tạo user mới
    const user = new User({
      username,
      email,
      password,
      fullName,
      role,
      profile,
      isActive: true,
      status: 'active'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản thành công',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
    }
});

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    console.log('🔐 Login attempt - Request body:', req.body);
    
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('📧 Looking for user with email:', email);

    // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      status: user.status
    });

    // Kiểm tra user có active không
    if (!user.isActive) {
      console.log('❌ User is not active:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    console.log('🔑 Comparing password...');
    // Kiểm tra mật khẩu
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password is invalid for user:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    console.log('✅ Password is valid, creating JWT token...');
    // Tạo JWT token
        const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
                role: user.role
        };

    const token = jwt.sign(
            payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ Login successful for user:', user.email);
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profile: user.profile,
          dataScope: user.dataScope,
          notifications: user.notifications
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Lấy thông tin user hiện tại
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profile: user.profile,
          dataScope: user.dataScope,
          notifications: user.notifications,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, profile, notifications } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Cập nhật thông tin
    if (fullName) user.fullName = fullName;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (notifications) user.notifications = { ...user.notifications, ...notifications };

    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profile: user.profile,
          notifications: user.notifications
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Đổi mật khẩu
// @access  Private
router.put('/change-password', authMiddleware, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số')
], async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/auth/users
// @desc    Lấy danh sách users (chỉ admin)
// @access  Private (Admin only)
router.get('/users', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/auth/users/:id/status
// @desc    Cập nhật trạng thái user (chỉ admin)
// @access  Private (Admin only)
router.put('/users/:id/status', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `Đã ${isActive ? 'kích hoạt' : 'khóa'} tài khoản thành công`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản công khai (cho nhân viên)
// @access  Public
router.post('/register', publicRegisterValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { fullName, email, password, phone, department, role } = req.body;

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    // Tạo username từ email
    const username = email.split('@')[0];

    // Tạo user mới với role được chọn
    const user = new User({
      username,
      email,
      password,
      fullName,
      role,
      profile: {
        phone,
        department
      },
      isActive: true, // Tự động kích hoạt cho demo
      status: 'active'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.'
    });
  } catch (error) {
    console.error('Public register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/auth/register-partner
// @desc    Đăng ký tài khoản đối tác
// @access  Public
router.post('/register-partner', partnerRegisterValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { 
      companyName, 
      contactPerson, 
      email, 
      password, 
      phone, 
      address, 
      taxCode, 
      website, 
      businessType, 
      description 
    } = req.body;

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    // Tạo username từ email
    const username = email.split('@')[0];

    // Tạo user mới với role 'partner'
    const user = new User({
      username,
      email,
      password,
      fullName: contactPerson,
      role: 'partner',
      profile: {
        companyName,
        phone,
        address,
        taxCode,
        website,
        businessType,
        description
      },
      isActive: false, // Cần admin kích hoạt
      status: 'pending'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Đăng ký đối tác thành công! Tài khoản sẽ được kích hoạt sau khi admin xác nhận.'
    });
  } catch (error) {
    console.error('Partner register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router;