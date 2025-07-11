const express = require('express');
const Task = require('../models/task.model');
const { fakeAuthMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');

const router = express.Router();

// GET /api/tasks - Lấy danh sách tasks
router.get('/', fakeAuthMiddleware, async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = {};
    
    if (projectId) {
      query.project = projectId;
    }
    
    const tasks = await Task.find(query)
      .populate('project', 'name code')
      .populate('module', 'name code')
      .populate('sprint', 'name code')
      .populate('userStory', 'title code')
      .populate('assignee', 'username fullName');
    
    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('TASK GET ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// GET /api/tasks/:id - Lấy chi tiết task
router.get('/:id', fakeAuthMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('module', 'name')
      .populate('sprint', 'name')
      .populate('userStory', 'title')
      .populate('assignee', 'fullName')
      .populate('reporter', 'fullName')
      .populate('history.user', 'fullName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy task'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('TASK GET DETAIL ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// POST /api/tasks - Tạo task mới
router.post('/', fakeAuthMiddleware, async (req, res) => {
  try {
    // Xử lý dữ liệu trước khi tạo task
    const taskData = { ...req.body };
    
    // Chuyển chuỗi rỗng thành null cho các trường ObjectId
    if (taskData.sprint === '') taskData.sprint = null;
    if (taskData.userStory === '') taskData.userStory = null;
    if (taskData.module === '') taskData.module = null;
    if (taskData.assignee === '') taskData.assignee = null;
    
    const task = new Task({
      ...taskData,
      reporter: req.user._id
    });

    // Tự động ghi history khi tạo mới
    task.history.push({
      user: req.user._id,
      action: 'Created',
      time: new Date(),
      note: 'Task được tạo mới'
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Tạo task thành công',
      data: { task }
    });
  } catch (error) {
    console.error('TASK CREATE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Cập nhật task
router.put('/:id', fakeAuthMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy task'
      });
    }

    // Xử lý dữ liệu trước khi cập nhật
    const updateData = { ...req.body };
    
    // Chuyển chuỗi rỗng thành null cho các trường ObjectId
    if (updateData.sprint === '') updateData.sprint = null;
    if (updateData.userStory === '') updateData.userStory = null;
    if (updateData.module === '') updateData.module = null;
    if (updateData.assignee === '') updateData.assignee = null;

    // Cập nhật các trường
    Object.assign(task, updateData);

    // Tự động ghi history khi cập nhật
    task.history.push({
      user: req.user._id,
      action: 'Updated',
      time: new Date(),
      note: 'Cập nhật thông tin task'
    });
    
    await task.save();

    res.json({
      success: true,
      message: 'Cập nhật task thành công',
      data: { task }
    });
  } catch (error) {
    console.error('TASK UPDATE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// POST /api/tasks/:id/comments - Thêm bình luận vào task
router.post('/:id/comments', fakeAuthMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Nội dung bình luận là bắt buộc' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy task' });
    }

    const comment = {
      user: req.user._id,
      content: content,
      createdAt: new Date()
    };

    task.comments.push(comment);

    task.history.push({
      user: req.user._id,
      action: 'Commented',
      note: `Đã thêm bình luận: "${content.substring(0, 50)}..."`
    });

    await task.save();

    // Populate user info for the new comment before sending back
    const newTask = await Task.findById(task._id).populate('comments.user', 'fullName');

    res.status(201).json({
      success: true,
      message: 'Thêm bình luận thành công',
      data: { task: newTask }
    });
  } catch (error) {
    console.error('TASK COMMENT ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// Cập nhật trạng thái task: chỉ assignedTo mới được cập nhật
router.put('/:id/status', fakeAuthMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy task' });
    if (!task.assignee?.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật trạng thái task này' });
    }
    task.status = req.body.status;
    task.history.push({
      user: req.user._id,
      action: 'StatusChanged',
      time: new Date(),
      note: `Cập nhật trạng thái: ${req.body.status}`
    });
    await task.save();
    res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// Duyệt task: chỉ QA/Reviewer mới được duyệt
router.post('/:id/approve', fakeAuthMiddleware, checkRole(['qa', 'reviewer']), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Không tìm thấy task' });
    task.deliveryStatus = req.body.status === 'accepted' ? 'accepted' : 'rejected';
    task.approvedBy = req.user._id;
    task.approvedAt = new Date();
    task.approvalNote = req.body.note;
    task.history.push({
      user: req.user._id,
      action: req.body.status === 'accepted' ? 'Approved' : 'Rejected',
      time: new Date(),
      note: req.body.note
    });
    await task.save();
    res.json({ success: true, message: 'Cập nhật trạng thái duyệt thành công', data: { task } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

module.exports = router; 