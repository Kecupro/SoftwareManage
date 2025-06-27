const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'invited', 'inactive'],
    default: 'active',
  },
  role: {
    type: String,
    enum: ['partner', 'ba', 'po', 'pm', 'dev', 'qa', 'devops', 'admin'],
    default: 'dev',
    required: true
  },
  // Liên kết trực tiếp với Partner (cho user có role 'partner')
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  // Phạm vi dữ liệu - các project/module mà user có quyền truy cập
  dataScope: {
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }],
    modules: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    }],
    partners: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner'
    }]
  },
  // Thông tin bổ sung cho từng vai trò
  profile: {
    avatar: String,
    phone: String,
    department: String,
    position: String,
    skills: [String],
    experience: Number, // Số năm kinh nghiệm
    gitUsername: String, // Username trên Git
    slackId: String
  },
  // Cài đặt thông báo
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      types: {
        buildComplete: { type: Boolean, default: true },
        testComplete: { type: Boolean, default: true },
        sprintUpdate: { type: Boolean, default: true },
        bugReport: { type: Boolean, default: true }
      }
    },
    inApp: {
      enabled: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware để hash password trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method để kiểm tra quyền truy cập
userSchema.methods.hasPermission = function(permission, resource = null) {
  const rolePermissions = {
    partner: ['read:own-projects', 'upload:code', 'upload:documents', 'view:dashboard'],
    ba: ['read:all-projects', 'create:user-story', 'edit:user-story', 'prioritize:backlog'],
    po: ['manage:product-backlog', 'accept:user-story', 'view:all-reports'],
    pm: ['manage:projects', 'manage:sprints', 'assign:tasks', 'view:all-reports'],
    dev: ['read:assigned-tasks', 'push:code', 'view:test-results', 'create:branches'],
    qa: ['read:test-tasks', 'create:bug-reports', 'confirm:bug-fixes', 'view:test-reports'],
    devops: ['manage:ci-cd', 'manage:infrastructure', 'view:all-logs', 'manage:deployments'],
    admin: ['*'] // Tất cả quyền
  };

  const permissions = rolePermissions[this.role] || [];
  return permissions.includes('*') || permissions.includes(permission);
};

// Method để kiểm tra quyền truy cập dữ liệu
userSchema.methods.canAccessData = function(dataType, dataId) {
  if (this.role === 'admin') return true;
  
  switch (dataType) {
    case 'project':
      return this.dataScope.projects.includes(dataId);
    case 'module':
      return this.dataScope.modules.includes(dataId);
    case 'partner':
      return this.dataScope.partners.includes(dataId);
    default:
      return false;
  }
};

module.exports = mongoose.model('User', userSchema);