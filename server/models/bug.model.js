const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title: {
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
  description: {
    type: String,
    required: true
  },
  // Thông tin cơ bản
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  userStory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserStory'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  // Trạng thái
  status: {
    type: String,
    enum: ['open', 'in-progress', 'testing', 'resolved', 'closed', 'reopened'],
    default: 'open'
  },
  // Mức độ nghiêm trọng và ưu tiên
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Loại bug
  type: {
    type: String,
    enum: ['functional', 'performance', 'security', 'ui-ux', 'compatibility', 'data', 'other'],
    default: 'functional'
  },
  // Thông tin chi tiết
  details: {
    stepsToReproduce: [String],
    expectedResult: String,
    actualResult: String,
    environment: {
      browser: String,
      os: String,
      device: String,
      version: String
    },
    attachments: [{
      name: String,
      url: String,
      type: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Người báo cáo và xử lý
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Thông tin Git
  gitInfo: {
    branch: String,
    commits: [{
      hash: String,
      message: String,
      author: String,
      date: Date,
      filesChanged: [String]
    }],
    pullRequest: {
      id: String,
      title: String,
      status: String,
      url: String
    }
  },
  // Thông tin thời gian
  timeTracking: {
    estimatedTime: Number, // Số giờ ước tính để fix
    actualTime: Number, // Số giờ thực tế để fix
    timeEntries: [{
      date: Date,
      hours: Number,
      description: String,
      loggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  // Lịch sử thay đổi
  history: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    time: Date,
    note: String
  }],
  // Comments
  comments: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }],
  // Thông tin giải quyết
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionType: {
      type: String,
      enum: ['fixed', 'wont-fix', 'duplicate', 'not-reproducible', 'by-design'],
      default: 'fixed'
    },
    resolutionNotes: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    closedAt: Date
  },
  // Thông tin liên quan
  relatedBugs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug'
  }],
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
  relatedCommits: [String]
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
bugSchema.index({ code: 1 });
bugSchema.index({ project: 1 });
bugSchema.index({ module: 1 });
bugSchema.index({ sprint: 1 });
bugSchema.index({ status: 1 });
bugSchema.index({ severity: 1 });
bugSchema.index({ priority: 1 });
bugSchema.index({ reportedBy: 1 });
bugSchema.index({ assignedTo: 1 });

// Virtual để tính thời gian xử lý
bugSchema.virtual('resolutionTime').get(function() {
  if (!this.resolution.resolvedAt || !this.createdAt) return null;
  const diffTime = this.resolution.resolvedAt - this.createdAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Số ngày
});

// Virtual để tính thời gian từ khi tạo đến hiện tại
bugSchema.virtual('age').get(function() {
  const diffTime = new Date() - this.createdAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Số ngày
});

// Virtual để kiểm tra bug có urgent không
bugSchema.virtual('isUrgent').get(function() {
  return this.severity === 'critical' || this.priority === 'critical';
});

// Method để thêm lịch sử thay đổi
bugSchema.methods.addHistory = function(field, oldValue, newValue, changedBy) {
  this.history.push({
    field,
    oldValue,
    newValue,
    changedBy
  });
  return this.save();
};

// Method để chuyển trạng thái
bugSchema.methods.changeStatus = function(newStatus, changedBy) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Cập nhật thời gian
  if (newStatus === 'resolved' && !this.resolution.resolvedAt) {
    this.resolution.resolvedAt = new Date();
    this.resolution.resolvedBy = changedBy;
  } else if (newStatus === 'closed' && !this.resolution.closedAt) {
    this.resolution.closedAt = new Date();
    this.resolution.closedBy = changedBy;
  }
  
  this.addHistory('status', oldStatus, newStatus, changedBy);
  return this.save();
};

// Method để thêm comment
bugSchema.methods.addComment = function(content, author, attachments = []) {
  this.comments.push({
    content,
    author,
    attachments
  });
  return this.save();
};

// Method để thêm time entry
bugSchema.methods.addTimeEntry = function(hours, description, loggedBy) {
  this.timeTracking.timeEntries.push({
    date: new Date(),
    hours,
    description,
    loggedBy
  });
  
  // Cập nhật thời gian thực tế
  this.timeTracking.actualTime = this.timeTracking.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  
  return this.save();
};

// Method để resolve bug
bugSchema.methods.resolve = function(resolvedBy, resolutionType, resolutionNotes) {
  this.status = 'resolved';
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedAt = new Date();
  this.resolution.resolutionType = resolutionType;
  this.resolution.resolutionNotes = resolutionNotes;
  
  this.addHistory('status', 'in-progress', 'resolved', resolvedBy);
  return this.save();
};

// Method để verify bug
bugSchema.methods.verify = function(verifiedBy) {
  this.resolution.verifiedBy = verifiedBy;
  this.resolution.verifiedAt = new Date();
  return this.save();
};

// Method để close bug
bugSchema.methods.close = function(closedBy) {
  this.status = 'closed';
  this.resolution.closedBy = closedBy;
  this.resolution.closedAt = new Date();
  
  this.addHistory('status', 'resolved', 'closed', closedBy);
  return this.save();
};

module.exports = mongoose.model('Bug', bugSchema); 