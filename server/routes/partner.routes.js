const express = require('express');
const { body, validationResult } = require('express-validator');
const Partner = require('../models/partner.model');
const { authMiddleware, checkRole, checkPermission, filterDataByScope } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const partnerValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên đối tác phải có từ 2-100 ký tự'),
  body('code')
    .isLength({ min: 2, max: 20 })
    .withMessage('Mã đối tác phải có từ 2-20 ký tự')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Mã đối tác chỉ được chứa chữ hoa, số và dấu gạch dưới'),
  body('contact.primaryContact.email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('business.type')
    .optional()
    .isIn(['startup', 'sme', 'enterprise', 'government', 'other'])
    .withMessage('Loại doanh nghiệp không hợp lệ')
];

// @route   GET /api/partners
// @desc    Lấy danh sách đối tác
// @access  Public (Demo)
router.get('/', async (req, res) => {
  if (!req.user) {
    // Trả về danh sách partner demo
    return res.json({
      success: true,
      data: {
        partners: [
          { id: 'p1', name: 'Đối tác Demo 1', email: 'partner1@example.com' },
          { id: 'p2', name: 'Đối tác Demo 2', email: 'partner2@example.com' }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalPartners: 2,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    });
  }
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'contact.primaryContact.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Thêm filter theo phạm vi quyền
    if (req.dataFilter) {
      Object.assign(query, req.dataFilter);
    }

    const partners = await Partner.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Partner.countDocuments(query);

    res.json({
      success: true,
      data: {
        partners,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPartners: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/partners/:id
// @desc    Lấy thông tin chi tiết đối tác
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đối tác'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('partner', partner._id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập đối tác này'
      });
    }

    res.json({
      success: true,
      data: { partner }
    });
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/partners
// @desc    Tạo đối tác mới
// @access  Private (Admin, PM, BA)
router.post('/', authMiddleware, checkRole(['admin', 'pm', 'ba']), partnerValidation, async (req, res) => {
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

    const { name, code, description, contact, business, systemConfig } = req.body;

    // Kiểm tra mã đối tác đã tồn tại
    const existingPartner = await Partner.findOne({ code });
    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Mã đối tác đã tồn tại'
      });
    }

    // Tạo đối tác mới
    const partner = new Partner({
      name,
      code,
      description,
      contact,
      business,
      systemConfig,
      createdBy: req.user._id
    });

    await partner.save();

    res.status(201).json({
      success: true,
      message: 'Tạo đối tác thành công',
      data: { partner }
    });
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/partners/:id
// @desc    Cập nhật thông tin đối tác
// @access  Private (Admin, PM, BA)
router.put('/:id', authMiddleware, checkRole(['admin', 'pm', 'ba']), partnerValidation, async (req, res) => {
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

    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đối tác'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('partner', partner._id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật đối tác này'
      });
    }

    const { name, description, contact, business, systemConfig, status } = req.body;

    // Cập nhật thông tin
    if (name) partner.name = name;
    if (description !== undefined) partner.description = description;
    if (contact) partner.contact = { ...partner.contact, ...contact };
    if (business) partner.business = { ...partner.business, ...business };
    if (systemConfig) partner.systemConfig = { ...partner.systemConfig, ...systemConfig };
    if (status) partner.status = status;

    await partner.save();

    res.json({
      success: true,
      message: 'Cập nhật đối tác thành công',
      data: { partner }
    });
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   DELETE /api/partners/:id
// @desc    Xóa đối tác
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đối tác'
      });
    }

    // Kiểm tra xem đối tác có dự án nào không
    const Project = require('../models/project.model');
    const projectCount = await Project.countDocuments({ 'partner.id': partner._id });
    
    if (projectCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa đối tác đang có dự án'
      });
    }

    await Partner.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Xóa đối tác thành công'
    });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/partners/me/statistics
// @desc    Lấy thống kê của đối tác hiện tại
// @access  Public (Demo)
router.get('/me/statistics', async (req, res) => {
  if (!req.user) {
    return res.json({
      success: true,
      data: {
        partner: { id: 'p1', name: 'Đối tác Demo 1', code: 'DT01' },
        statistics: { totalProjects: 1, totalModules: 1, totalDeliveries: 1 }
      }
    });
  }
  try {
    // Tìm partner dựa trên partnerId của user hiện tại
    const partner = await Partner.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đối tác'
      });
    }

    // Cập nhật thống kê
    await partner.updateStatistics();

    res.json({
      success: true,
      data: {
        partner: {
          id: partner._id,
          name: partner.name,
          code: partner.code
        },
        statistics: partner.statistics
      }
    });
  } catch (error) {
    console.error('Get partner statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/partners/me/activities
// @desc    Lấy hoạt động gần đây của đối tác
// @access  Public (Demo)
router.get('/me/activities', async (req, res) => {
  if (!req.user) {
    return res.json({
      success: true,
      data: {
        activities: [
          { type: 'delivery', title: 'Bàn giao module: Module Demo 1', description: 'Module MD01 đã được bàn giao cho dự án Demo', timestamp: new Date(), entityId: 'mod1', entityType: 'module' },
          { type: 'project', title: 'Cập nhật dự án: Dự án Đối tác Demo 1', description: 'Dự án DA01 đã được cập nhật', timestamp: new Date(), entityId: 'prj1', entityType: 'project' }
        ]
      }
    });
  }
  try {
    const partner = await Partner.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đối tác'
      });
    }

    // Lấy hoạt động từ các module và project
    const Module = require('../models/module.model');
    const Project = require('../models/project.model');

    const recentModules = await Module.find({ 'delivery.partner': partner._id })
      .sort({ 'delivery.deliveryDate': -1 })
      .limit(10)
      .populate('project', 'name code');

    const recentProjects = await Project.find({ 'partner.id': partner._id })
      .sort({ updatedAt: -1 })
      .limit(5);

    const activities = [];

    // Thêm hoạt động từ modules
    recentModules.forEach(module => {
      if (module.delivery.deliveryDate) {
        activities.push({
          type: 'delivery',
          title: `Bàn giao module: ${module.name}`,
          description: `Module ${module.code} đã được bàn giao cho dự án ${module.project?.name || 'N/A'}`,
          timestamp: module.delivery.deliveryDate,
          entityId: module._id,
          entityType: 'module'
        });
      }
    });

    // Thêm hoạt động từ projects
    recentProjects.forEach(project => {
      activities.push({
        type: 'project',
        title: `Cập nhật dự án: ${project.name}`,
        description: `Dự án ${project.code} đã được cập nhật`,
        timestamp: project.updatedAt,
        entityId: project._id,
        entityType: 'project'
      });
    });

    // Sắp xếp theo thời gian
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        activities: activities.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get partner activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/partners/:id/statistics
// @desc    Lấy thống kê đối tác
// @access  Private
router.get('/:id/statistics', authMiddleware, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đối tác'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('partner', partner._id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập đối tác này'
      });
    }

    // Cập nhật thống kê
    await partner.updateStatistics();

    res.json({
      success: true,
      data: {
        partner: {
          id: partner._id,
          name: partner.name,
          code: partner.code,
          statistics: partner.statistics
        }
      }
    });
  } catch (error) {
    console.error('Get partner statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/partners/:id/status
// @desc    Cập nhật trạng thái đối tác
// @access  Private (Admin, PM)
router.put('/:id/status', authMiddleware, checkRole(['admin', 'pm']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đối tác'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('partner', partner._id)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật đối tác này'
      });
    }

    partner.status = status;
    await partner.save();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đối tác thành công',
      data: {
        partner: {
          id: partner._id,
          name: partner.name,
          status: partner.status
        }
      }
    });
  } catch (error) {
    console.error('Update partner status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/partners/me/projects
// @desc    Lấy danh sách dự án của đối tác
// @access  Public (Demo)
router.get('/me/projects', async (req, res) => {
  if (!req.user) {
    return res.json({
      success: true,
      data: {
        projects: [
          { _id: 'prj1', name: 'Dự án Đối tác Demo 1', code: 'DA01', status: 'active', description: 'Dự án mẫu cho đối tác', timeline: { startDate: '2023-01-01', endDate: '2023-12-31' }, team: { developers: [{ fullName: 'Dev Demo' }] }, modules: [{ name: 'Module Demo', status: 'completed' }], progress: 80 }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalProjects: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    });
  }
  try {
    // Tìm partner dựa trên partnerId của user hiện tại
    const partner = await Partner.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đối tác'
      });
    }

    const Project = require('../models/project.model');
    const { page = 1, limit = 20, status, search } = req.query;
    
    const query = { 'partner.id': partner._id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('team.productOwner', 'fullName email')
      .populate('team.projectManager', 'fullName email')
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
    console.error('Get partner projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/partners/me/projects/:projectId/modules
// @desc    Lấy danh sách module của dự án
// @access  Private (Partner only)
router.get('/me/projects/:projectId/modules', authMiddleware, checkRole('partner'), async (req, res) => {
  try {
    // Tìm partner dựa trên partnerId của user hiện tại
    const partner = await Partner.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đối tác'
      });
    }

    const Project = require('../models/project.model');
    const Module = require('../models/module.model');

    // Kiểm tra dự án thuộc về đối tác
    const project = await Project.findOne({ 
      _id: req.params.projectId,
      'partner.id': partner._id 
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    const { status } = req.query;
    const query = { project: req.params.projectId };
    if (status) query.status = status;

    const modules = await Module.find(query)
      .populate('sprint', 'name code')
      .sort({ createdAt: -1 })
      .exec();

    res.json({
      success: true,
      data: {
        modules
      }
    });
  } catch (error) {
    console.error('Get project modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/partners/me/module-requests
// @desc    Đối tác gửi yêu cầu tạo module mới
// @access  Private (Partner only)
router.post('/me/module-requests', authMiddleware, checkRole('partner'), async (req, res) => {
  try {
    // Tìm partner dựa trên partnerId của user hiện tại
    const partner = await Partner.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đối tác'
      });
    }

    const Project = require('../models/project.model');
    const ModuleRequest = require('../models/module-request.model');

    // Kiểm tra dự án thuộc về đối tác
    const project = await Project.findOne({ 
      _id: req.body.projectId,
      'partner.id': partner._id 
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án hoặc không có quyền truy cập'
      });
    }

    // Xử lý upload files (cần implement multer middleware)
    const attachmentFiles = [];
    
    if (req.files && req.files.attachments) {
      const files = Array.isArray(req.files.attachments) ? req.files.attachments : [req.files.attachments];
      files.forEach(file => {
        attachmentFiles.push({
          name: file.originalname,
          path: file.path,
          size: file.size
        });
      });
    }

    // Tạo yêu cầu module mới
    const moduleRequest = new ModuleRequest({
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      project: req.body.projectId,
      partner: partner._id,
      priority: req.body.priority || 'medium',
      estimatedHours: req.body.estimatedHours ? parseInt(req.body.estimatedHours) : null,
      timeline: {
        requestedStartDate: req.body.startDate ? new Date(req.body.startDate) : null,
        requestedEndDate: req.body.endDate ? new Date(req.body.endDate) : null
      },
      requirements: {
        technical: req.body.technicalRequirements || '',
        business: req.body.businessRequirements || ''
      },
      attachments: attachmentFiles.map(f => f.path),
      status: 'pending',
      requestedBy: req.user._id,
      requestedAt: new Date()
    });

    await moduleRequest.save();

    // Tạo thông báo cho bên nội bộ
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      
      // Lấy danh sách admin và PM để thông báo
      const internalUsers = await User.find({
        role: { $in: ['admin', 'pm'] }
      });

      const notificationPromises = internalUsers.map(user => {
        return Notification.create({
          user: user._id,
          title: 'Yêu cầu tạo Module mới',
          message: `Đối tác ${partner.name} đã gửi yêu cầu tạo module "${req.body.name}" cho dự án "${project.name}". Vui lòng review và phản hồi.`,
          type: 'module-request',
          relatedModuleRequest: moduleRequest._id,
          relatedProject: req.body.projectId,
          relatedPartner: partner._id,
          isRead: false,
          createdAt: new Date()
        });
      });

      await Promise.all(notificationPromises);
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Không fail request nếu notification lỗi
    }

    res.status(201).json({
      success: true,
      message: 'Yêu cầu tạo module đã được gửi thành công',
      data: {
        request: {
          id: moduleRequest._id,
          name: moduleRequest.name,
          code: moduleRequest.code,
          status: moduleRequest.status,
          requestedAt: moduleRequest.requestedAt
        }
      }
    });
  } catch (error) {
    console.error('Module request error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   GET /api/partners/me/module-requests
// @desc    Lấy danh sách yêu cầu module của đối tác
// @access  Private (Partner only)
router.get('/me/module-requests', authMiddleware, checkRole('partner'), async (req, res) => {
  try {
    // Tìm partner dựa trên partnerId của user hiện tại
    const partner = await Partner.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đối tác'
      });
    }

    const ModuleRequest = require('../models/module-request.model');

    const { status, projectId } = req.query;
    const query = { partner: partner._id };
    
    if (status) query.status = status;
    if (projectId) query.project = projectId;

    const requests = await ModuleRequest.find(query)
      .populate('project', 'name code')
      .sort({ requestedAt: -1 })
      .exec();

    res.json({
      success: true,
      data: {
        requests
      }
    });
  } catch (error) {
    console.error('Get module requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/partners/me/modules/:moduleId/accept-delivery
// @desc    Đối tác chấp nhận bàn giao module
// @access  Private (Partner only)
router.post('/me/modules/:moduleId/accept-delivery', authMiddleware, checkRole('partner'), async (req, res) => {
  try {
    // Tìm partner dựa trên partnerId của user hiện tại
    const partner = await Partner.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đối tác'
      });
    }

    const Module = require('../models/module.model');
    const module = await Module.findById(req.params.moduleId)
      .populate('project', 'name code')
      .populate('delivery.partner', 'name code');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy module'
      });
    }

    // Kiểm tra module thuộc về đối tác
    if (module.delivery.partner._id.toString() !== partner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập module này'
      });
    }

    // Kiểm tra trạng thái module
    if (module.deliveryStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Module chưa được bàn giao hoặc đã được xử lý'
      });
    }

    // Cập nhật module
    module.deliveryStatus = 'accepted';
    module.delivery.acceptanceDate = new Date();
    module.delivery.acceptedBy = partner._id;
    module.status = 'accepted';

    // Thêm vào history
    module.history.push({
      user: req.user._id,
      action: 'Accept Delivery',
      time: new Date(),
      note: req.body.acceptanceNote || 'Đối tác chấp nhận bàn giao'
    });

    await module.save();

    // Tạo thông báo cho bên nội bộ
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      
      // Lấy danh sách admin và PM để thông báo
      const internalUsers = await User.find({
        role: { $in: ['admin', 'pm'] }
      });

      const notificationPromises = internalUsers.map(user => {
        return Notification.create({
          user: user._id,
          title: 'Module được chấp nhận',
          message: `Đối tác ${partner.name} đã chấp nhận bàn giao module "${module.name}" cho dự án "${module.project.name}".`,
          type: 'delivery-accepted',
          relatedModule: module._id,
          relatedProject: module.project._id,
          relatedPartner: partner._id,
          isRead: false,
          createdAt: new Date()
        });
      });

      await Promise.all(notificationPromises);
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
    }

    res.json({
      success: true,
      message: 'Chấp nhận bàn giao thành công',
      data: {
        module: {
          id: module._id,
          name: module.name,
          code: module.code,
          deliveryStatus: module.deliveryStatus,
          acceptanceDate: module.delivery.acceptanceDate
        }
      }
    });
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/partners/me/modules/:moduleId/reject-delivery
// @desc    Đối tác từ chối bàn giao module
// @access  Private (Partner only)
router.post('/me/modules/:moduleId/reject-delivery', authMiddleware, checkRole('partner'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối'
      });
    }

    // Tìm partner dựa trên partnerId của user hiện tại
    const partner = await Partner.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đối tác'
      });
    }

    const Module = require('../models/module.model');
    const module = await Module.findById(req.params.moduleId)
      .populate('project', 'name code')
      .populate('delivery.partner', 'name code');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy module'
      });
    }

    // Kiểm tra module thuộc về đối tác
    if (module.delivery.partner._id.toString() !== partner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập module này'
      });
    }

    // Kiểm tra trạng thái module
    if (module.deliveryStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Module chưa được bàn giao hoặc đã được xử lý'
      });
    }

    // Cập nhật module
    module.deliveryStatus = 'rejected';
    module.delivery.rejectionDate = new Date();
    module.delivery.rejectedBy = partner._id;
    module.delivery.rejectionReason = rejectionReason;
    module.status = 'rejected';

    // Thêm vào history
    module.history.push({
      user: req.user._id,
      action: 'Reject Delivery',
      time: new Date(),
      note: `Từ chối bàn giao: ${rejectionReason}`
    });

    await module.save();

    // Tạo thông báo cho bên nội bộ
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      
      // Lấy danh sách admin và PM để thông báo
      const internalUsers = await User.find({
        role: { $in: ['admin', 'pm'] }
      });

      const notificationPromises = internalUsers.map(user => {
        return Notification.create({
          user: user._id,
          title: 'Module bị từ chối',
          message: `Đối tác ${partner.name} đã từ chối bàn giao module "${module.name}" cho dự án "${module.project.name}". Lý do: ${rejectionReason}`,
          type: 'delivery-rejected',
          relatedModule: module._id,
          relatedProject: module.project._id,
          relatedPartner: partner._id,
          isRead: false,
          createdAt: new Date()
        });
      });

      await Promise.all(notificationPromises);
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
    }

    res.json({
      success: true,
      message: 'Từ chối bàn giao thành công',
      data: {
        module: {
          id: module._id,
          name: module.name,
          code: module.code,
          deliveryStatus: module.deliveryStatus,
          rejectionDate: module.delivery.rejectionDate,
          rejectionReason: module.delivery.rejectionReason
        }
      }
    });
  } catch (error) {
    console.error('Reject delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 