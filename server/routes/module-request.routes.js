const express = require('express');
const { body, validationResult } = require('express-validator');
const ModuleRequest = require('../models/module-request.model');
const Module = require('../models/module.model');
const { fakeAuthMiddleware, checkRole } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Validation rules
const moduleRequestValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên module phải có từ 2-100 ký tự'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mô tả phải có từ 10-1000 ký tự'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Độ ưu tiên không hợp lệ')
];

// Thiết lập lưu file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/module-requests'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// @route   GET /api/module-requests
// @desc    Lấy danh sách yêu cầu module (Admin/PM)
// @access  Private (Admin, PM)
router.get('/', fakeAuthMiddleware, checkRole(['admin', 'pm']), async (req, res) => {
  try {
    const { status, partnerId, projectId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (partnerId) query.partner = partnerId;
    if (projectId) query.project = projectId;

    const requests = await ModuleRequest.find(query)
      .populate('partner', 'name code')
      .populate('project', 'name code')
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('approvedModule', 'name code status')
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

// @route   GET /api/module-requests/:id
// @desc    Lấy chi tiết yêu cầu module
// @access  Private (Admin, PM, Partner)
router.get('/:id', fakeAuthMiddleware, async (req, res) => {
  try {
    const request = await ModuleRequest.findById(req.params.id)
      .populate('partner', 'name code contact')
      .populate('project', 'name code')
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .populate('approvedModule', 'name code status')
      .exec();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu module'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role === 'partner' && request.partner._id.toString() !== req.user.partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập yêu cầu này'
      });
    }

    res.json({
      success: true,
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Get module request detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/module-requests
// @desc    Tạo yêu cầu module mới
// @access  Private (Partner)
router.post('/', fakeAuthMiddleware, checkRole('partner'), upload.array('attachments', 5), moduleRequestValidation, async (req, res) => {
  try {
    console.log('Received module request data:', req.body);
    console.log('Files:', req.files);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    // Tạo code duy nhất cho yêu cầu
    const timestamp = Date.now();
    const uniqueCode = `MR_${timestamp}`;

    // Xử lý file attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const moduleRequestData = {
      name: req.body.name,
      code: uniqueCode,
      description: req.body.description,
      project: req.body.project,
      partner: req.user.partnerId,
      priority: req.body.priority || 'medium',
      estimatedHours: req.body.estimatedHours ? parseInt(req.body.estimatedHours) : null,
      timeline: {
        requestedStartDate: req.body.startDate ? new Date(req.body.startDate) : null,
        requestedEndDate: req.body.endDate ? new Date(req.body.endDate) : null
      },
      requirements: {
        technical: req.body.technicalRequirements,
        business: req.body.businessRequirements
      },
      attachments,
      requestedBy: req.user._id,
      status: 'pending'
    };

    console.log('Module request data to save:', moduleRequestData);

    const newModuleRequest = new ModuleRequest(moduleRequestData);
    await newModuleRequest.save();

    // Thêm lịch sử
    try {
      await newModuleRequest.addHistory(req.user._id, 'created', 'Tạo yêu cầu module mới');
    } catch (historyError) {
      console.error('Error adding history:', historyError);
      // Don't fail the request if history fails
    }

    // Populate thông tin để trả về
    await newModuleRequest.populate([
      { path: 'partner', select: 'name code' },
      { path: 'project', select: 'name code' },
      { path: 'requestedBy', select: 'name email' }
    ]);

    // Tạo thông báo cho bên nội bộ (admin, pm)
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      const internalUsers = await User.find({
        role: { $in: ['admin', 'pm'] }
      });
      const project = await require('../models/project.model').findById(newModuleRequest.project);
      const partner = await require('../models/partner.model').findById(newModuleRequest.partner);

      const notificationPromises = internalUsers.map(user => {
        return Notification.create({
          user: user._id,
          title: 'Yêu cầu tạo Module mới',
          message: `Đối tác ${partner?.name || ''} đã gửi yêu cầu tạo module "${newModuleRequest.name}" cho dự án "${project?.name || ''}". Vui lòng review và phản hồi.`,
          type: 'module-request',
          relatedModuleRequest: newModuleRequest._id,
          relatedProject: newModuleRequest.project,
          relatedPartner: newModuleRequest.partner,
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
      message: 'Tạo yêu cầu module thành công',
      data: {
        request: newModuleRequest
      }
    });
  } catch (error) {
    console.error('Create module request error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   POST /api/module-requests/:id/approve
// @desc    Phê duyệt yêu cầu module và tạo module
// @access  Private (Admin, PM)
router.post('/:id/approve', fakeAuthMiddleware, checkRole(['admin', 'pm']), async (req, res) => {
  try {
    const { reviewNote, estimatedEffort, technicalFeasibility, recommendedTechnologies, risks, suggestions } = req.body;

    const moduleRequest = await ModuleRequest.findById(req.params.id)
      .populate('partner', 'name code')
      .populate('project', 'name code')
      .populate('requestedBy', 'name email');

    if (!moduleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu module'
      });
    }

    if (moduleRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Yêu cầu đã được xử lý'
      });
    }

    // --- LOGIC TẠO CODE DUY NHẤT (PHIÊN BẢN CUỐI CÙNG) ---
    // Luôn tạo code mới dựa trên timestamp để đảm bảo không bao giờ trùng lặp
    const projectCode = moduleRequest.project.code || 'PRJ';
    const moduleNameFragment = moduleRequest.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
    const timestamp = Date.now();
    const uniqueModuleCode = `${projectCode}_${moduleNameFragment}_${timestamp}`;

    // Tạo module mới từ yêu cầu
    const moduleData = {
      name: moduleRequest.name,
      code: uniqueModuleCode, // Sử dụng code duy nhất vừa tạo
      description: moduleRequest.description,
      project: moduleRequest.project._id,
      priority: moduleRequest.priority,
      status: 'planning',
      delivery: {
        source: 'internal',
        partner: moduleRequest.partner._id,
        team: 'internal'
      },
      timeline: {
        startDate: moduleRequest.timeline.requestedStartDate || new Date(),
        endDate: moduleRequest.timeline.requestedEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        estimatedDuration: moduleRequest.estimatedHours ? Math.ceil(moduleRequest.estimatedHours / 8) : 30 // Convert hours to days
      },
      technicalInfo: {
        technology: recommendedTechnologies || [],
        estimatedEffort: estimatedEffort || moduleRequest.estimatedHours || 0
      },
      createdBy: req.user._id
    };

    const newModule = new Module(moduleData);
    await newModule.save();

    // Thêm lịch sử cho module mới một cách chính xác
    newModule.history.push({
      user: req.user._id,
      action: 'created',
      note: `Module được tạo từ yêu cầu ${moduleRequest.code || 'không có code'}`
    });
    await newModule.save();

    // Cập nhật yêu cầu module
    moduleRequest.status = 'approved';
    moduleRequest.reviewedBy = req.user._id;
    moduleRequest.reviewedAt = new Date();
    moduleRequest.reviewNote = reviewNote;
    moduleRequest.approvedModule = newModule._id;
    moduleRequest.internalResponse = {
      estimatedEffort,
      technicalFeasibility,
      recommendedTechnologies,
      risks,
      suggestions,
      responseDate: new Date()
    };

    await moduleRequest.addHistory(req.user._id, 'approved', reviewNote, {
      approvedModule: newModule._id,
      internalResponse: moduleRequest.internalResponse
    });
    await moduleRequest.save();

    // Tạo thông báo cho đối tác
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      
      // Tìm user partner để thông báo
      const partnerUser = await User.findOne({ 
        partnerId: moduleRequest.partner._id 
      });

      if (partnerUser) {
        await Notification.create({
          user: partnerUser._id,
          title: 'Yêu cầu Module được phê duyệt',
          message: `Yêu cầu tạo module "${moduleRequest.name}" đã được phê duyệt. Module đã được tạo và sẵn sàng để theo dõi tiến độ.`,
          type: 'module-request-approved',
          relatedModuleRequest: moduleRequest._id,
          relatedModule: newModule._id,
          relatedProject: moduleRequest.project._id,
          relatedPartner: moduleRequest.partner._id,
          isRead: false,
          createdAt: new Date()
        });
      }
    } catch (notificationError) {
      console.error('Error creating partner notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Phê duyệt yêu cầu thành công',
      data: {
        request: {
          id: moduleRequest._id,
          status: moduleRequest.status,
          reviewedAt: moduleRequest.reviewedAt
        },
        module: {
          id: newModule._id,
          name: newModule.name,
          code: newModule.code,
          status: newModule.status
        }
      }
    });
  } catch (error) {
    console.error('Approve module request error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   POST /api/module-requests/:id/reject
// @desc    Từ chối yêu cầu module
// @access  Private (Admin, PM)
router.post('/:id/reject', fakeAuthMiddleware, checkRole(['admin', 'pm']), async (req, res) => {
  try {
    const { reviewNote } = req.body;

    if (!reviewNote) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối'
      });
    }

    const moduleRequest = await ModuleRequest.findById(req.params.id)
      .populate('partner', 'name code')
      .populate('project', 'name code')
      .populate('requestedBy', 'name email');

    if (!moduleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu module'
      });
    }

    if (moduleRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Yêu cầu đã được xử lý'
      });
    }

    // Cập nhật yêu cầu module
    await moduleRequest.reject(req.user._id, reviewNote);

    // Tạo thông báo cho đối tác
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      
      // Tìm user partner để thông báo
      const partnerUser = await User.findOne({ 
        partnerId: moduleRequest.partner._id 
      });

      if (partnerUser) {
        await Notification.create({
          user: partnerUser._id,
          title: 'Yêu cầu Module bị từ chối',
          message: `Yêu cầu tạo module "${moduleRequest.name}" đã bị từ chối. Lý do: ${reviewNote}`,
          type: 'module-request-rejected',
          relatedModuleRequest: moduleRequest._id,
          relatedProject: moduleRequest.project._id,
          relatedPartner: moduleRequest.partner._id,
          isRead: false,
          createdAt: new Date()
        });
      }
    } catch (notificationError) {
      console.error('Error creating partner notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Từ chối yêu cầu thành công',
      data: {
        request: {
          id: moduleRequest._id,
          status: moduleRequest.status,
          reviewedAt: moduleRequest.reviewedAt,
          reviewNote: moduleRequest.reviewNote
        }
      }
    });
  } catch (error) {
    console.error('Reject module request error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// @route   PUT /api/module-requests/:id
// @desc    Cập nhật yêu cầu module (chỉ cho phép đối tác cập nhật yêu cầu pending)
// @access  Private (Partner)
router.put('/:id', fakeAuthMiddleware, checkRole('partner'), moduleRequestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const moduleRequest = await ModuleRequest.findById(req.params.id);

    if (!moduleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu module'
      });
    }

    // Kiểm tra quyền sở hữu
    if (moduleRequest.partner.toString() !== req.user.partnerId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật yêu cầu này'
      });
    }

    // Chỉ cho phép cập nhật yêu cầu pending
    if (moduleRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể cập nhật yêu cầu đang chờ xử lý'
      });
    }

    // Cập nhật thông tin
    const updateData = {
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      priority: req.body.priority,
      estimatedHours: req.body.estimatedHours,
      'timeline.requestedStartDate': req.body.startDate ? new Date(req.body.startDate) : null,
      'timeline.requestedEndDate': req.body.endDate ? new Date(req.body.endDate) : null,
      'requirements.technical': req.body.technicalRequirements,
      'requirements.business': req.body.businessRequirements
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        moduleRequest.set(key, updateData[key]);
      }
    });

    await moduleRequest.addHistory(req.user._id, 'modified', 'Cập nhật thông tin yêu cầu');

    res.json({
      success: true,
      message: 'Cập nhật yêu cầu thành công',
      data: {
        request: {
          id: moduleRequest._id,
          name: moduleRequest.name,
          status: moduleRequest.status
        }
      }
    });
  } catch (error) {
    console.error('Update module request error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});
module.exports = router; 