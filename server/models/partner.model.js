const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: String,
  // Thông tin liên hệ
  contact: {
    primaryContact: {
      name: String,
      email: String,
      phone: String,
      position: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    website: String
  },
  // Thông tin doanh nghiệp
  business: {
    type: {
      type: String,
      enum: ['startup', 'sme', 'enterprise', 'government', 'other']
    },
    industry: String,
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-1000', '1000+']
    },
    foundedYear: Number,
    taxCode: String
  },
  // Cấu hình hệ thống
  systemConfig: {
    gitAccess: {
      enabled: { type: Boolean, default: false },
      repositories: [String],
      accessToken: String
    },
    notifications: {
      email: {
        enabled: { type: Boolean, default: true },
        recipients: [String]
      },
      slack: {
        enabled: { type: Boolean, default: false },
        webhookUrl: String,
        channel: String
      }
    },
    dashboard: {
      customTheme: String,
      defaultView: {
        type: String,
        enum: ['overview', 'projects', 'modules', 'reports'],
        default: 'overview'
      }
    }
  },
  // Thống kê
  statistics: {
    totalProjects: { type: Number, default: 0 },
    activeProjects: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    totalModules: { type: Number, default: 0 },
    deliveredModules: { type: Number, default: 0 }
  },
  // Trạng thái
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  // Metadata
  tags: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractDate: Date,
  note: String
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
partnerSchema.index({ code: 1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ 'contact.primaryContact.email': 1 });

// Method để cập nhật thống kê
partnerSchema.methods.updateStatistics = async function() {
  const Project = mongoose.model('Project');
  const Module = mongoose.model('Module');

  // Đếm projects
  const projectStats = await Project.aggregate([
    { $match: { 'partner.id': this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    }
  ]);

  // Đếm modules
  const moduleStats = await Module.aggregate([
    { $match: { 'delivery.partner': this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
      }
    }
  ]);

  // Cập nhật thống kê
  this.statistics.totalProjects = projectStats[0]?.total || 0;
  this.statistics.activeProjects = projectStats[0]?.active || 0;
  this.statistics.completedProjects = projectStats[0]?.completed || 0;
  this.statistics.totalModules = moduleStats[0]?.total || 0;
  this.statistics.deliveredModules = moduleStats[0]?.delivered || 0;

  await this.save();
};

module.exports = mongoose.model('Partner', partnerSchema); 