const express = require('express');
const Project = require('../models/project.model');
const Module = require('../models/module.model');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/reports/project/:id - Báo cáo dự án
router.get('/project/:id', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('project', projectId)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập dự án này'
      });
    }

    const project = await Project.findById(projectId)
      .populate('partner.id', 'name code')
      .populate('team.projectManager', 'username fullName')
      .populate('team.productOwner', 'username fullName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Cập nhật thống kê
    await project.updateStatistics();

    // Lấy modules của dự án
    const modules = await Module.find({ project: projectId })
      .populate('sprint', 'name code');

    res.json({
      success: true,
      data: {
        project,
        modules,
        report: {
          generatedAt: new Date(),
          generatedBy: req.user.fullName
        }
      }
    });
  } catch (error) {
    console.error('Project report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 