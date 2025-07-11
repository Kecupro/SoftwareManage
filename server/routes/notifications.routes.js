const express = require('express');
const router = express.Router();
const { fakeAuthMiddleware } = require('../middleware/auth.middleware');
const Notification = require('../models/notification.model');

// @route   GET /api/notifications
// @desc    Lấy danh sách thông báo của user
// @access  Private
router.get('/', fakeAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    const notifications = await Notification.find(query)
      .populate('relatedModule', 'name code')
      .populate('relatedProject', 'name code')
      .populate('relatedPartner', 'name code')
      .populate('relatedTask', 'title')
      .populate('relatedBug', 'title')
      .populate('relatedSprint', 'name code')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const total = await Notification.countDocuments(query);
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Lấy số lượng thông báo chưa đọc
// @access  Private
router.get('/unread-count', fakeAuthMiddleware, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Đánh dấu thông báo đã đọc
// @access  Private
router.put('/:id/read', fakeAuthMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }
    await notification.markAsRead();
    res.json({
      success: true,
      message: 'Đã đánh dấu thông báo đã đọc'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Đánh dấu tất cả thông báo đã đọc
// @access  Private
router.put('/mark-all-read', fakeAuthMiddleware, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);
    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo đã đọc'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Xóa thông báo
// @access  Private
router.delete('/:id', fakeAuthMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }
    res.json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router;