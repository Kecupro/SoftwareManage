const express = require('express');
const Module = require('../models/module.model');
const Task = require('../models/task.model');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/module-deliveries'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /api/modules - Lấy danh sách module
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = {};
    if (projectId) {
      query.project = projectId;
    }
    const modules = await Module.find(query)
      .populate('project', 'name code')
      .populate('sprint', 'name code')
      .populate('manager', 'fullName')
      .populate('delivery.partner', 'name code');
    
    res.json({
      success: true,
      data: { modules: modules.map(m => m.toObject({ virtuals: true })) }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/modules/:id - Lấy chi tiết module
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const modulePromise = Module.findById(req.params.id)
      .populate('project', 'name code')
      .populate('sprint', 'name code')
      .populate('manager', 'fullName')
      .populate('delivery.deliveredBy', 'username fullName')
      .populate('delivery.acceptedBy', 'username fullName')
      .populate('approvedBy', 'username fullName')
      .populate('createdBy', 'username fullName')
      .populate('history.user', 'username fullName');
    
    // Find all tasks related to this module
    const tasksPromise = Task.find({ module: req.params.id })
      .populate('assignee', 'fullName')
      .populate('userStory', 'title');

    const [module, tasks] = await Promise.all([modulePromise, tasksPromise]);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy module'
      });
    }

    res.json({
      success: true,
      data: { 
        module: module.toObject({ virtuals: true }),
        tasks: tasks 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// POST /api/modules - Tạo module mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const module = new Module({
      ...req.body,
      createdBy: req.user._id
    });

    // Tự động ghi history khi tạo mới
    module.history.push({
      user: req.user._id,
      action: 'Created',
      time: new Date(),
      note: 'Module được tạo mới'
    });

    await module.save();

    res.status(201).json({
      success: true,
      message: 'Tạo module thành công',
      data: { module }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// PUT /api/modules/:id - Cập nhật module
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy module'
      });
    }

    // Cập nhật các trường
    Object.assign(module, req.body);

    // Tự động ghi history khi cập nhật
    module.history.push({
      user: req.user._id,
      action: 'Updated',
      time: new Date(),
      note: 'Cập nhật thông tin module'
    });
    
    await module.save();

    res.json({
      success: true,
      message: 'Cập nhật module thành công',
      data: { module }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// DELETE /api/modules/:id - Xóa module
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy module'
      });
    }

    res.json({
      success: true,
      message: 'Xóa module thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// POST /api/modules/:id/deliver
// @desc    Bàn giao module cho đối tác (Admin/PM/Dev)
// @access  Private (Admin, PM, Dev)
router.post('/:id/deliver', authMiddleware, checkRole(['admin', 'pm', 'dev']), upload.array('deliveryFiles', 10), async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('project', 'name code')
      .populate('delivery.partner', 'name code');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy module'
      });
    }

    // Kiểm tra trạng thái module
    if (module.status === 'delivered' || module.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Module đã được bàn giao hoặc chấp nhận'
      });
    }

    // Xử lý file upload
    const deliveryFiles = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Cập nhật thông tin bàn giao
    module.delivery.deliveryTime = new Date();
    module.delivery.deliveryDate = new Date();
    module.delivery.deliveredBy = req.user._id;
    module.delivery.deliveredByModel = 'User';
    module.delivery.deliveryNote = req.body.deliveryNote || '';
    module.delivery.deliveryCommit = req.body.deliveryCommit || '';
    module.delivery.deliveryFiles = deliveryFiles;
    module.deliveryStatus = 'pending';
    module.status = 'delivered';

    // Thêm vào history
    module.history.push({
      user: req.user._id,
      action: 'delivered',
      time: new Date(),
      note: req.body.deliveryNote || 'Bàn giao module cho đối tác'
    });

    await module.save();

    // Tạo thông báo cho đối tác
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      const partnerUser = await User.findOne({ partnerId: module.delivery.partner._id });
      if (partnerUser) {
        await Notification.create({
          user: partnerUser._id,
          title: 'Module đã được bàn giao',
          message: `Module "${module.name}" của dự án "${module.project.name}" đã được bàn giao. Vui lòng kiểm tra và xác nhận.`,
          type: 'delivery',
          relatedModule: module._id,
          relatedProject: module.project._id,
          relatedPartner: module.delivery.partner._id,
          isRead: false,
          createdAt: new Date()
        });
      }
    } catch (notificationError) {
      console.error('Error creating partner notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Bàn giao module thành công',
      data: {
        module: module.toObject({ virtuals: true })
      }
    });
  } catch (error) {
    console.error('Module delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// POST /api/modules/:id/approve - Phê duyệt bàn giao module
router.post('/:id/approve', authMiddleware, checkRole(['admin', 'pm']), async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('project', 'name code')
      .populate('delivery.partner', 'name code');
      
    if (!module) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy module' 
      });
    }

    // Kiểm tra trạng thái module
    if (module.deliveryStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Module không ở trạng thái chờ phê duyệt'
      });
    }

    // Kiểm tra quyền truy cập (admin hoặc PM của project)
    if (req.user.role !== 'admin') {
      const Project = require('../models/project.model');
      const project = await Project.findById(module.project);
      if (!project || project.team.projectManager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền phê duyệt module này'
        });
      }
    }

    // Cập nhật trạng thái module
    module.deliveryStatus = 'accepted';
    module.status = 'accepted'; // Cập nhật trạng thái chính
    module.approvedBy = req.user._id;
    module.approvedAt = new Date();
    module.approvalNote = req.body.note || '';

    // Ghi history
    module.history.push({
      user: req.user._id,
      action: 'Approve',
      time: new Date(),
      note: req.body.note || 'Phê duyệt bàn giao module'
    });

    await module.save();

    // Tạo thông báo cho đối tác
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      
      // Tìm user partner để thông báo
      const partnerUser = await User.findOne({ 
        partnerId: module.delivery.partner._id 
      });

      if (partnerUser) {
        await Notification.create({
          user: partnerUser._id,
          title: 'Module được phê duyệt',
          message: `Module "${module.name}" của dự án "${module.project?.name || 'N/A'}" đã được phê duyệt thành công.`,
          type: 'approval',
          relatedModule: module._id,
          relatedProject: module.project?._id,
          relatedPartner: module.delivery.partner._id,
          isRead: false,
          createdAt: new Date()
        });
      }
    } catch (notificationError) {
      console.error('Error creating partner notification:', notificationError);
      // Không fail approval nếu notification lỗi
    }

    // Cập nhật thống kê của partner
    try {
      const Partner = require('../models/partner.model');
      const partner = await Partner.findById(module.delivery.partner._id);
      if (partner) {
        await partner.updateStatistics();
      }
    } catch (statsError) {
      console.error('Error updating partner statistics:', statsError);
    }

    // Cập nhật thống kê của project
    try {
      const Project = require('../models/project.model');
      const project = await Project.findById(module.project);
      if (project) {
        // Có thể thêm method updateStatistics cho Project nếu cần
        project.statistics.completedModules = (project.statistics.completedModules || 0) + 1;
        await project.save();
      }
    } catch (projectStatsError) {
      console.error('Error updating project statistics:', projectStatsError);
    }

    res.json({ 
      success: true, 
      message: 'Phê duyệt bàn giao thành công', 
      data: { 
        module: {
          id: module._id,
          name: module.name,
          code: module.code,
          status: module.status,
          deliveryStatus: module.deliveryStatus,
          approvedBy: module.approvedBy,
          approvedAt: module.approvedAt,
          approvalNote: module.approvalNote
        }
      } 
    });
  } catch (error) {
    console.error('Module approval error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

// POST /api/modules/:id/reject - Từ chối bàn giao module
router.post('/:id/reject', authMiddleware, checkRole(['admin', 'pm']), async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('project', 'name code')
      .populate('delivery.partner', 'name code');
      
    if (!module) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy module' 
      });
    }

    // Kiểm tra trạng thái module
    if (module.deliveryStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Module không ở trạng thái chờ phê duyệt'
      });
    }

    // Kiểm tra quyền truy cập (admin hoặc PM của project)
    if (req.user.role !== 'admin') {
      const Project = require('../models/project.model');
      const project = await Project.findById(module.project);
      if (!project || project.team.projectManager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền từ chối module này'
        });
      }
    }

    // Cập nhật trạng thái module
    module.deliveryStatus = 'rejected';
    module.status = 'rejected'; // Cập nhật trạng thái chính
    module.approvedBy = req.user._id;
    module.approvedAt = new Date();
    module.approvalNote = req.body.note || '';

    // Ghi history
    module.history.push({
      user: req.user._id,
      action: 'Reject',
      time: new Date(),
      note: req.body.note || 'Từ chối bàn giao module'
    });

    await module.save();

    // Tạo thông báo cho đối tác
    try {
      const Notification = require('../models/notification.model');
      const User = require('../models/user.model');
      
      // Tìm user partner để thông báo
      const partnerUser = await User.findOne({ 
        partnerId: module.delivery.partner._id 
      });

      if (partnerUser) {
        await Notification.create({
          user: partnerUser._id,
          title: 'Module bị từ chối',
          message: `Module "${module.name}" của dự án "${module.project?.name || 'N/A'}" đã bị từ chối. Lý do: ${req.body.note || 'Không có'}`,
          type: 'rejection',
          relatedModule: module._id,
          relatedProject: module.project?._id,
          relatedPartner: module.delivery.partner._id,
          isRead: false,
          createdAt: new Date()
        });
      }
    } catch (notificationError) {
      console.error('Error creating partner notification:', notificationError);
      // Không fail rejection nếu notification lỗi
    }

    res.json({ 
      success: true, 
      message: 'Từ chối bàn giao thành công', 
      data: { 
        module: {
          id: module._id,
          name: module.name,
          code: module.code,
          status: module.status,
          deliveryStatus: module.deliveryStatus,
          approvedBy: module.approvedBy,
          approvedAt: module.approvedAt,
          approvalNote: module.approvalNote
        }
      } 
    });
  } catch (error) {
    console.error('Module rejection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

module.exports = router; 