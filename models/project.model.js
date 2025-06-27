const mongoose = require('mongoose');

// Định nghĩa historySchema trước
const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  time: { type: Date, default: Date.now },
  note: String,
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }]
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Thông tin đối tác
  partner: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    name: String,
    contactPerson: String,
    email: String,
    phone: String
  },
  // Thông tin team nội bộ
  team: {
    productOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    businessAnalyst: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    developers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    testers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    devops: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  // Cấu hình Git
  gitConfig: {
    repository: {
      type: String,
      required: true
    },
    branch: {
      type: String,
      default: 'main'
    },
    webhookUrl: String,
    accessToken: String
  },
  // Cấu hình CI/CD
  ciCdConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    autoDeploy: {
      type: Boolean,
      default: false
    },
    stagingUrl: String,
    productionUrl: String,
    dockerImage: String
  },
  // Thông tin thời gian
  timeline: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    estimatedDuration: Number, // Số ngày ước tính
    actualDuration: Number // Số ngày thực tế
  },
  // Thống kê dự án
  statistics: {
    totalModules: {
      type: Number,
      default: 0
    },
    completedModules: {
      type: Number,
      default: 0
    },
    totalUserStories: {
      type: Number,
      default: 0
    },
    completedUserStories: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    totalBugs: {
      type: Number,
      default: 0
    },
    resolvedBugs: {
      type: Number,
      default: 0
    },
    testCoverage: {
      type: Number,
      default: 0
    }
  },
  // Cài đặt thông báo
  notifications: {
    emailRecipients: [String],
    slackChannel: String,
    webhookUrl: String
  },
  // Metadata
  tags: [String],
  category: String,
  budget: {
    estimated: Number,
    actual: Number,
    currency: {
      type: String,
      default: 'VND'
    }
  },
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
  history: [historySchema]
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
projectSchema.index({ code: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'partner.id': 1 });
projectSchema.index({ 'team.projectManager': 1 });

// Virtual để tính tỷ lệ hoàn thành
projectSchema.virtual('completionRate').get(function() {
  if (this.statistics.totalModules === 0) return 0;
  return Math.round((this.statistics.completedModules / this.statistics.totalModules) * 100);
});

// Virtual để tính tỷ lệ hoàn thành User Stories
projectSchema.virtual('userStoryCompletionRate').get(function() {
  if (this.statistics.totalUserStories === 0) return 0;
  return Math.round((this.statistics.completedUserStories / this.statistics.totalUserStories) * 100);
});

// Method để cập nhật thống kê
projectSchema.methods.updateStatistics = async function() {
  const Module = mongoose.model('Module');
  const UserStory = mongoose.model('UserStory');
  const Task = mongoose.model('Task');
  const Bug = mongoose.model('Bug');

  // Đếm modules
  const moduleStats = await Module.aggregate([
    { $match: { project: this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    }
  ]);

  // Đếm user stories
  const userStoryStats = await UserStory.aggregate([
    { $match: { project: this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    }
  ]);

  // Đếm tasks
  const taskStats = await Task.aggregate([
    { $match: { project: this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    }
  ]);

  // Đếm bugs
  const bugStats = await Bug.aggregate([
    { $match: { project: this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
      }
    }
  ]);

  // Cập nhật thống kê
  this.statistics.totalModules = moduleStats[0]?.total || 0;
  this.statistics.completedModules = moduleStats[0]?.completed || 0;
  this.statistics.totalUserStories = userStoryStats[0]?.total || 0;
  this.statistics.completedUserStories = userStoryStats[0]?.completed || 0;
  this.statistics.totalTasks = taskStats[0]?.total || 0;
  this.statistics.completedTasks = taskStats[0]?.completed || 0;
  this.statistics.totalBugs = bugStats[0]?.total || 0;
  this.statistics.resolvedBugs = bugStats[0]?.resolved || 0;

  await this.save();
};

module.exports = mongoose.model('Project', projectSchema);