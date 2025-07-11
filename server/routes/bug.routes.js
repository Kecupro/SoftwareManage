const express = require('express');
const Bug = require('../models/bug.model');
const { fakeAuthMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/bugs - Lấy danh sách bugs
router.get('/', fakeAuthMiddleware, async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = {};
    
    if (projectId) {
      query.project = projectId;
    }
    
    const bugs = await Bug.find(query)
      .populate('project', 'name code')
      .populate('module', 'name code')
      .populate('sprint', 'name code')
      .populate('userStory', 'title code')
      .populate('task', 'title code')
      .populate('reportedBy', 'username fullName')
      .populate('assignedTo', 'username fullName');
    
    res.json({
      success: true,
      data: { bugs }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// POST /api/bugs - Tạo bug mới
router.post('/', fakeAuthMiddleware, async (req, res) => {
  try {
    const bug = new Bug({
      ...req.body,
      reportedBy: req.user._id
    });

    // Tự động ghi history khi tạo mới
    bug.history.push({
      user: req.user._id,
      action: 'Created',
      time: new Date(),
      note: 'Bug được báo cáo'
    });

    await bug.save();

    res.status(201).json({
      success: true,
      message: 'Tạo bug report thành công',
      data: { bug }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// PUT /api/bugs/:id - Cập nhật bug
router.put('/:id', fakeAuthMiddleware, async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bug'
      });
    }

    // Cập nhật các trường
    Object.assign(bug, req.body);

    // Tự động ghi history khi cập nhật
    bug.history.push({
      user: req.user._id,
      action: 'Updated',
      time: new Date(),
      note: 'Cập nhật thông tin bug'
    });

    await bug.save();

    res.json({
      success: true,
      message: 'Cập nhật bug thành công',
      data: { bug }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/bugs/:id - Lấy chi tiết bug
router.get('/:id', fakeAuthMiddleware, async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('project', 'name code')
      .populate('module', 'name code')
      .populate('sprint', 'name code')
      .populate('userStory', 'title code')
      .populate('task', 'title code')
      .populate('reportedBy', 'username fullName')
      .populate('assignedTo', 'username fullName');
    if (!bug) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bug' });
    }
    res.json({ success: true, data: { bug } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router; 