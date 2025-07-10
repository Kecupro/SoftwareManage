const express = require('express');
const Sprint = require('../models/sprint.model');
const Task = require('../models/task.model');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/sprints - Lấy danh sách sprint
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = {};
    
    if (projectId) {
      query.project = projectId;
    }
    
    const sprints = await Sprint.find(query)
      .populate('project', 'name code')
      .populate('createdBy', 'username fullName');
    
    res.json({
      success: true,
      data: { sprints: sprints.map(s => s.toObject({ virtuals: true })) }
    });
  } catch (error) {
    console.error('SPRINT API ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// GET /api/sprints/:id - Lấy chi tiết sprint
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const sprintPromise = Sprint.findById(req.params.id)
      .populate('project', 'name code')
      .populate('scrumMaster', 'fullName')
      .populate('createdBy', 'username fullName')
      .populate('events.sprintPlanning.participants', 'username fullName')
      .populate('events.sprintReview.participants', 'username fullName')
      .populate('events.sprintRetrospective.participants', 'username fullName')
      .populate({
        path: 'backlog.userStories',
        populate: { path: 'assignee', select: 'fullName' }
      })
      .populate({
        path: 'backlog.tasks',
        populate: { path: 'assignee', select: 'fullName' }
      })
      .populate({
        path: 'backlog.bugs',
        populate: { path: 'assignee', select: 'fullName' }
      });
    
    const tasksPromise = Task.find({ sprint: req.params.id })
      .populate('assignee', 'fullName')
      .populate('userStory', 'title');

    const [sprint, tasks] = await Promise.all([sprintPromise, tasksPromise]);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sprint'
      });
    }

    res.json({
      success: true,
      data: { 
        sprint: sprint.toObject({ virtuals: true }),
        tasks: tasks
      }
    });
  } catch (error) {
    console.error('SPRINT API ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// POST /api/sprints - Tạo sprint mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const sprint = new Sprint({
      ...req.body,
      createdBy: req.user._id
    });

    await sprint.save();

    res.status(201).json({
      success: true,
      message: 'Tạo sprint thành công',
      data: { sprint }
    });
  } catch (error) {
    console.error('SPRINT API ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// PUT /api/sprints/:id - Cập nhật sprint
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sprint'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật sprint thành công',
      data: { sprint }
    });
  } catch (error) {
    console.error('SPRINT API ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// DELETE /api/sprints/:id - Xóa sprint
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sprint'
      });
    }

    res.json({
      success: true,
      message: 'Xóa sprint thành công'
    });
  } catch (error) {
    console.error('SPRINT API ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

module.exports = router; 