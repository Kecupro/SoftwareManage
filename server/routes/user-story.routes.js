const express = require('express');
const UserStory = require('../models/user-story.model');
const User = require('../models/user.model');
const { authMiddleware } = require('../middleware/auth.middleware');
const mongoose = require('mongoose');
const { checkRole } = require('../middleware/role.middleware');

const router = express.Router();

// GET /api/user-stories/:id - Lấy chi tiết user story
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id)
      .populate('project', 'name code')
      .populate('module', 'name code')
      .populate('sprint', 'name code')
      .populate('assignedTo', 'username fullName')
      .populate('createdBy', 'username fullName')
      .populate('deliveredBy', 'username fullName')
      .populate('approvedBy', 'username fullName');

    if (!userStory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user story'
      });
    }

    // Chuyển đổi dữ liệu để phù hợp với frontend
    const formattedUserStory = {
      ...userStory.toObject(),
      projectId: userStory.project?._id,
      projectName: userStory.project?.name,
      sprintId: userStory.sprint?._id,
      sprintName: userStory.sprint?.name,
      moduleId: userStory.module?._id,
      moduleName: userStory.module?.name,
      assigneeName: userStory.assignedTo?.fullName || userStory.assignedTo?.username,
      creatorName: userStory.createdBy?.fullName || userStory.createdBy?.username,
      epic: userStory.tags?.[0] || '',
      storyPoints: userStory.estimation?.storyPoints,
      acceptanceCriteria: userStory.acceptanceCriteria?.[0]?.description || ''
    };

    res.json({
      success: true,
      data: { userStory: formattedUserStory }
    });
  } catch (error) {
    console.error('Error fetching user story details:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// GET /api/user-stories - Lấy danh sách user stories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = {};
    if (req.query.project) {
      query.project = req.query.project;
    }
    const userStories = await UserStory.find(query)
      .populate('project', 'name code')
      .populate('module', 'name code')
      .populate('sprint', 'name code')
      .populate('assignedTo', 'username fullName');
    
    // Chuyển đổi dữ liệu để phù hợp với frontend
    const formattedUserStories = userStories.map(story => ({
      ...story.toObject(),
      projectId: story.project?._id,
      projectName: story.project?.name,
      sprintId: story.sprint?._id,
      sprintName: story.sprint?.name,
      moduleId: story.module?._id,
      moduleName: story.module?.name,
      assigneeName: story.assignedTo?.fullName || story.assignedTo?.username,
      epic: story.tags?.[0] || '',
      storyPoints: story.estimation?.storyPoints,
      acceptanceCriteria: story.acceptanceCriteria?.[0]?.description || ''
    }));
    
    res.json({
      success: true,
      data: { userStories: formattedUserStories }
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// POST /api/user-stories - Tạo user story mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Tạo code tự động nếu không có
    const code = req.body.code || `US-${Date.now()}`;
    
    // Xử lý dữ liệu từ frontend
    const userStoryData = {
      title: req.body.title,
      code: code,
      description: req.body.description,
      project: req.body.project,
      module: req.body.module,
      sprint: req.body.sprint,
      createdBy: req.user._id,
      // Xử lý userStory object
      userStory: {
        asA: req.body.asA || 'User',
        iWant: req.body.iWant || req.body.title,
        soThat: req.body.soThat || req.body.description
      },
      // Xử lý acceptance criteria
      acceptanceCriteria: req.body.acceptanceCriteria ? [{
        description: req.body.acceptanceCriteria,
        isMet: false
      }] : [],
      // Xử lý priority
      priority: req.body.priority || 'medium',
      // Xử lý estimation
      estimation: {
        storyPoints: req.body.storyPoints ? parseInt(req.body.storyPoints) : undefined,
        timeEstimate: req.body.timeEstimate ? parseInt(req.body.timeEstimate) : undefined
      },
      // Xử lý tags
      tags: req.body.epic ? [req.body.epic] : []
    };

    // Tìm user theo tên nếu là string
    if (req.body.assignee && typeof req.body.assignee === 'string' && req.body.assignee.trim() !== '') {
      console.log('Looking for user:', req.body.assignee);
      const user = await User.findOne({ username: req.body.assignee });
      if (user) {
        console.log('Found user:', user._id);
        userStoryData.assignedTo = user._id;
      } else {
        console.log('User not found, skipping assignee');
        // Không gán assignedTo nếu không tìm thấy user
      }
    }

    const userStory = new UserStory(userStoryData);

    // Tự động ghi history khi tạo mới
    userStory.history.push({
      user: req.user._id,
      action: 'Created',
      time: new Date(),
      note: 'User story được tạo mới'
    });

    await userStory.save();

    res.status(201).json({
      success: true,
      message: 'Tạo user story thành công',
      data: { userStory }
    });
  } catch (error) {
    console.error('Error creating user story:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// PUT /api/user-stories/:id - Cập nhật user story
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id);

    if (!userStory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user story'
      });
    }

    // Cập nhật các trường
    Object.assign(userStory, req.body);

    // Tự động ghi history khi cập nhật
    userStory.history.push({
      user: req.user._id,
      action: 'Updated',
      time: new Date(),
      note: 'Cập nhật thông tin user story'
    });

    await userStory.save();

    res.json({
      success: true,
      message: 'Cập nhật user story thành công',
      data: { userStory }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Cập nhật trạng thái user story: chỉ assignedTo mới được cập nhật
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id);
    if (!userStory) return res.status(404).json({ success: false, message: 'Không tìm thấy user story' });
    if (!userStory.assignedTo?.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật trạng thái user story này' });
    }
    userStory.status = req.body.status;
    userStory.history.push({
      user: req.user._id,
      action: 'StatusChanged',
      time: new Date(),
      note: `Cập nhật trạng thái: ${req.body.status}`
    });
    await userStory.save();
    res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: { userStory } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// Duyệt user story: chỉ QA/Reviewer mới được duyệt
router.post('/:id/approve', authMiddleware, checkRole(['qa', 'reviewer']), async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id);
    if (!userStory) return res.status(404).json({ success: false, message: 'Không tìm thấy user story' });
    userStory.deliveryStatus = req.body.status === 'accepted' ? 'accepted' : 'rejected';
    userStory.approvedBy = req.user._id;
    userStory.approvedAt = new Date();
    userStory.approvalNote = req.body.note;
    userStory.history.push({
      user: req.user._id,
      action: req.body.status === 'accepted' ? 'Approved' : 'Rejected',
      time: new Date(),
      note: req.body.note
    });
    await userStory.save();
    res.json({ success: true, message: 'Cập nhật trạng thái duyệt thành công', data: { userStory } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// POST /api/user-stories/:id/deliver - Đánh dấu bàn giao user story
router.post('/:id/deliver', authMiddleware, async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id);
    if (!userStory) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user story' });
    }
    userStory.deliveryStatus = 'pending';
    userStory.deliveredBy = req.user._id;
    userStory.deliveredAt = new Date();
    // Ghi history
    userStory.history.push({
      user: req.user._id,
      action: 'Deliver',
      time: new Date(),
      note: req.body.note || 'Bàn giao user story'
    });
    await userStory.save();
    res.json({ success: true, message: 'Bàn giao user story thành công', data: { userStory } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// POST /api/user-stories/:id/reject - Từ chối user story
router.post('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id);
    if (!userStory) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user story' });
    }
    userStory.deliveryStatus = 'rejected';
    userStory.approvedBy = req.user._id;
    userStory.approvedAt = new Date();
    userStory.approvalNote = req.body.note || '';
    // Ghi history
    userStory.history.push({
      user: req.user._id,
      action: 'Reject',
      time: new Date(),
      note: req.body.note || 'Từ chối user story'
    });
    await userStory.save();
    res.json({ success: true, message: 'Từ chối user story thành công', data: { userStory } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

module.exports = router; 