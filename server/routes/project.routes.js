const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/project.model');
const Partner = require('../models/partner.model');
const { authMiddleware, checkRole, checkPermission, filterDataByScope } = require('../middleware/auth.middleware');
const router = express.Router();
const Module = require('../models/module.model');

// Validation rules
const projectValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên dự án phải có từ 2-100 ký tự'),
  body('code')
    .isLength({ min: 2, max: 20 })
    .withMessage('Mã dự án phải có từ 2-20 ký tự')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Mã dự án chỉ được chứa chữ hoa, số và dấu gạch dưới'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mô tả dự án phải có từ 10-1000 ký tự'),
  body('partner.id')
    .isMongoId()
    .withMessage('ID đối tác không hợp lệ'),
  body('timeline.startDate')
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('timeline.endDate')
    .isISO8601()
    .withMessage('Ngày kết thúc không hợp lệ'),
  body('gitConfig.repository')
    .isURL()
    .withMessage('URL repository không hợp lệ')
];

// @route   GET /api/projects
// @desc    Lấy danh sách dự án
// @access  Public (Demo)
router.get('/', async (req, res) => {
  if (!req.user) {
    // Trả về danh sách project demo
    return res.json({
      success: true,
      data: {
        projects: [
          { id: 'prj1', name: 'Dự án Demo 1', code: 'DA01', status: 'active' },
          { id: 'prj2', name: 'Dự án Demo 2', code: 'DA02', status: 'completed' }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalProjects: 2,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    });
  }
  try {
    const { page = 1, limit = 10, status, priority, partnerId, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (partnerId) query['partner.id'] = partnerId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Thêm filter theo phạm vi quyền
    if (req.dataFilter) {
      Object.assign(query, req.dataFilter);
    }

    const projects = await Project.find(query)
      .populate('partner.id', 'name code')
      .populate('team.projectManager', 'username fullName')
      .populate('team.productOwner', 'username fullName')
      .populate('team.businessAnalyst', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProjects: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
    }
});

// @route   GET /api/projects/:id
// @desc    Lấy thông tin chi tiết dự án
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('partner.id', 'name code contact business')
      .populate('team.projectManager', 'username fullName email profile')
      .populate('team.productOwner', 'username fullName email profile')
      .populate('team.businessAnalyst', 'username fullName email profile')
      .populate('team.developers', 'username fullName email profile')
      .populate('team.testers', 'username fullName email profile')
      .populate('team.devops', 'username fullName email profile')
      .populate('createdBy', 'username fullName');
        
        if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('project', project._id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập dự án này'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/projects
// @desc    Tạo dự án mới
// @access  Private (Admin, PM, BA)
router.post('/', authMiddleware, checkRole(['admin', 'pm', 'ba']), projectValidation, async (req, res) => {
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
      name, code, description, partner, team, gitConfig, ciCdConfig,
      timeline, priority, tags, category, budget
    } = req.body;

    // Kiểm tra mã dự án đã tồn tại
    const existingProject = await Project.findOne({ code });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'Mã dự án đã tồn tại'
      });
    }

    // Kiểm tra đối tác tồn tại
    const partnerExists = await Partner.findById(partner.id);
    if (!partnerExists) {
      return res.status(400).json({
        success: false,
        message: 'Đối tác không tồn tại'
      });
    }

    // Tính toán thời gian ước tính
    const startDate = new Date(timeline.startDate);
    const endDate = new Date(timeline.endDate);
    const estimatedDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Tạo dự án mới
    const project = new Project({
      name,
      code,
      description,
      partner: {
        id: partner.id,
        name: partnerExists.name,
        contactPerson: partner.contactPerson,
        email: partner.contactPerson ? partnerExists.contact.primaryContact.email : undefined,
        phone: partner.contactPerson ? partnerExists.contact.primaryContact.phone : undefined
      },
      team,
      gitConfig,
      ciCdConfig,
      timeline: {
        ...timeline,
        estimatedDuration
      },
      priority,
      tags,
      category,
      budget,
      createdBy: req.user._id
    });

    await project.save();

    // Cập nhật thống kê đối tác
    await partnerExists.updateStatistics();

    res.status(201).json({
      success: true,
      message: 'Tạo dự án thành công',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Cập nhật thông tin dự án
// @access  Private (Admin, PM, BA)
router.put('/:id', authMiddleware, checkRole(['admin', 'pm', 'ba']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('project', project._id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật dự án này'
      });
    }

    const {
      name, description, team, gitConfig, ciCdConfig, timeline,
      priority, status, tags, category, budget, notifications
    } = req.body;

    // Cập nhật thông tin
    const changes = [];
    if (name && name !== project.name) {
      changes.push({ field: 'name', oldValue: project.name, newValue: name });
      project.name = name;
    }
    if (description && description !== project.description) {
      changes.push({ field: 'description', oldValue: project.description, newValue: description });
      project.description = description;
    }
    if (team && JSON.stringify(team) !== JSON.stringify(project.team)) {
      changes.push({ field: 'team', oldValue: project.team, newValue: team });
      project.team = { ...project.team, ...team };
    }
    if (gitConfig && JSON.stringify(gitConfig) !== JSON.stringify(project.gitConfig)) {
      changes.push({ field: 'gitConfig', oldValue: project.gitConfig, newValue: gitConfig });
      project.gitConfig = { ...project.gitConfig, ...gitConfig };
    }
    if (ciCdConfig && JSON.stringify(ciCdConfig) !== JSON.stringify(project.ciCdConfig)) {
      changes.push({ field: 'ciCdConfig', oldValue: project.ciCdConfig, newValue: ciCdConfig });
      project.ciCdConfig = { ...project.ciCdConfig, ...ciCdConfig };
    }
    if (timeline && JSON.stringify(timeline) !== JSON.stringify(project.timeline)) {
      changes.push({ field: 'timeline', oldValue: project.timeline, newValue: timeline });
      project.timeline = { ...project.timeline, ...timeline };
      // Tính lại thời gian ước tính
      if (timeline.startDate && timeline.endDate) {
        const startDate = new Date(timeline.startDate);
        const endDate = new Date(timeline.endDate);
        project.timeline.estimatedDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      }
    }
    if (priority && priority !== project.priority) {
      changes.push({ field: 'priority', oldValue: project.priority, newValue: priority });
      project.priority = priority;
    }
    if (status && status !== project.status) {
      changes.push({ field: 'status', oldValue: project.status, newValue: status });
      project.status = status;
    }
    if (tags && JSON.stringify(tags) !== JSON.stringify(project.tags)) {
      changes.push({ field: 'tags', oldValue: project.tags, newValue: tags });
      project.tags = tags;
    }
    if (category && category !== project.category) {
      changes.push({ field: 'category', oldValue: project.category, newValue: category });
      project.category = category;
    }
    if (budget && JSON.stringify(budget) !== JSON.stringify(project.budget)) {
      changes.push({ field: 'budget', oldValue: project.budget, newValue: budget });
      project.budget = { ...project.budget, ...budget };
    }
    if (notifications && JSON.stringify(notifications) !== JSON.stringify(project.notifications)) {
      changes.push({ field: 'notifications', oldValue: project.notifications, newValue: notifications });
      project.notifications = { ...project.notifications, ...notifications };
    }

    if (changes.length > 0) {
      project.history.push({
        user: req.user._id,
        action: 'update',
        time: new Date(),
        note: 'Cập nhật thông tin dự án',
        changes
      });
    }

    await project.save();

    res.json({
      success: true,
      message: 'Cập nhật dự án thành công',
      data: { project }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Xóa dự án
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Kiểm tra xem dự án có module nào không
    const moduleCount = await Module.countDocuments({ project: project._id });
    
    if (moduleCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa dự án đang có module'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    // Cập nhật thống kê đối tác
    const partner = await Partner.findById(project.partner.id);
    if (partner) {
      await partner.updateStatistics();
    }

    res.json({
      success: true,
      message: 'Xóa dự án thành công'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/projects/:id/statistics
// @desc    Lấy thống kê dự án
// @access  Private
router.get('/:id/statistics', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('project', project._id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập dự án này'
      });
    }

    // Cập nhật thống kê
    await project.updateStatistics();

    res.json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          code: project.code,
          statistics: project.statistics,
          completionRate: project.completionRate,
          userStoryCompletionRate: project.userStoryCompletionRate
        }
      }
    });
  } catch (error) {
    console.error('Get project statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/projects/:id/status
// @desc    Cập nhật trạng thái dự án
// @access  Private (Admin, PM)
router.put('/:id/status', authMiddleware, checkRole(['admin', 'pm']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['planning', 'active', 'on-hold', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('project', project._id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật dự án này'
      });
    }

    project.status = status;
    
    // Cập nhật thời gian thực tế nếu hoàn thành
    if (status === 'completed' && !project.timeline.actualDuration) {
      const startDate = new Date(project.timeline.startDate);
      const endDate = new Date();
      project.timeline.actualDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    }

        await project.save();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái dự án thành công',
      data: {
        project: {
          id: project._id,
          name: project.name,
          status: project.status
        }
      }
    });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
    }
});

module.exports = router;