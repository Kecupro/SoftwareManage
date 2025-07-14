const express = require('express');
const User = require('../models/user.model');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

// Cấu hình lưu file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `avatar_${req.user._id}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

const router = express.Router();

// GET /api/users - Lấy danh sách users (đầy đủ trường)
router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('username fullName email role status createdAt');
    const total = await User.countDocuments(query);
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   GET /api/users
// @desc    Lấy danh sách user (filter, search, phân trang)
// @access  Private (Admin)
router.get('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   POST /api/users/invite
// @desc    Mời user mới qua email (chưa gửi mail, chỉ trả về link invite)
// @access  Private (Admin)
router.post('/invite', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { email, fullName, role } = req.body;
    if (!email || !fullName || !role) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }
    // Kiểm tra email đã tồn tại chưa
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }
    // Sinh inviteToken
    const inviteToken = crypto.randomBytes(32).toString('hex');
    // Tạo user mới với status invited
    const user = new User({
      email,
      fullName,
      role,
      status: 'invited',
      inviteToken,
      createdBy: req.user._id
    });
    await user.save();
    // Trả về link invite (giả lập)
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${inviteToken}`;
    res.json({ success: true, message: 'Đã tạo user và sinh invite link', data: { inviteLink, userId: user._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   POST /api/users/accept-invite
// @desc    User xác nhận invite, đặt mật khẩu, kích hoạt tài khoản
// @access  Public
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu token hoặc mật khẩu' });
    }
    // Tìm user theo inviteToken
    const user = await User.findOne({ inviteToken: token, status: 'invited' });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã được sử dụng' });
    }
    // Đặt mật khẩu mới, đổi status
    user.password = password;
    user.status = 'active';
    user.inviteToken = undefined;
    await user.save();
    res.json({ success: true, message: 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload avatar cho user hiện tại
// @access  Private (user đã đăng nhập)
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file upload' });
    }
    // Cập nhật avatar cho user hiện tại
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ success: true, message: 'Upload avatar thành công', avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Lấy chi tiết user
// @access  Private (Admin)
router.get('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Sửa thông tin user
// @access  Private (Admin)
router.put('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { fullName, email, role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
      user.email = email;
    }
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (status) user.status = status;
    await user.save();
    res.json({ success: true, message: 'Cập nhật user thành công', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Xóa user
// @access  Private (Admin)
router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    res.json({ success: true, message: 'Đã xóa user' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   PATCH /api/users/:id/role
// @desc    Đổi vai trò user
// @access  Private (Admin)
router.patch('/:id/role', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: 'Thiếu role' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    user.role = role;
    await user.save();
    res.json({ success: true, message: 'Đã đổi vai trò user', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

module.exports = router; 