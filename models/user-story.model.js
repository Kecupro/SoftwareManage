const mongoose = require('mongoose');

const userStorySchema = new mongoose.Schema({
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
  // Thông tin User Story
  userStory: {
    asA: {
      type: String,
      required: true
    },
    iWant: {
      type: String,
      required: true
    },
    soThat: {
      type: String,
      required: true
    }
  },
  // Trạng thái
  status: {
    type: String,
    enum: ['backlog', 'sprint-backlog', 'in-progress', 'testing', 'completed', 'accepted', 'rejected'],
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Story Points và ước tính
  estimation: {
    storyPoints: {
      type: Number,
      min: 1,
      max: 21 // Fibonacci sequence
    },
    timeEstimate: {
      type: Number, // Số giờ ước tính
      min: 0
    },
    actualTime: {
      type: Number, // Số giờ thực tế
      min: 0
    }
  },
  // Acceptance Criteria
  acceptanceCriteria: [{
    description: String,
    isMet: {
      type: Boolean,
      default: false
    },
    testedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    testedAt: Date
  }],
  // Definition of Done
  definitionOfDone: [{
    item: String,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date
  }],
  // Thông tin kỹ thuật
  technicalInfo: {
    complexity: {
      type: String,
      enum: ['simple', 'medium', 'complex', 'very-complex']
    },
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserStory'
    }],
    blockers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserStory'
    }],
    tags: [String],
    components: [String], // Các component/module bị ảnh hưởng
    apiEndpoints: [String], // Các API endpoints liên quan
    databaseChanges: [String] // Các thay đổi database
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
    pullRequests: [{
      id: String,
      title: String,
      status: String,
      url: String,
      reviewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
  },
  // Kết quả kiểm thử
  testResults: {
    unitTests: {
      total: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      coverage: { type: Number, default: 0 }
    },
    integrationTests: {
      total: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 }
    },
    e2eTests: {
      total: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 }
    },
    manualTests: {
      total: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 }
    }
  },
  // Thông tin bàn giao & phê duyệt (quy trình mới, đồng bộ với module)
  deliveryStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: Date,
  approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  approvedAt: Date,
  approvalNote: String,
  // Lịch sử thay đổi
  history: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    time: Date,
    note: String,
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  // Thống kê
  statistics: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    totalBugs: { type: Number, default: 0 },
    resolvedBugs: { type: Number, default: 0 }
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedCommits: [String]
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
userStorySchema.index({ code: 1 });
userStorySchema.index({ project: 1 });
userStorySchema.index({ module: 1 });
userStorySchema.index({ sprint: 1 });
userStorySchema.index({ status: 1 });
userStorySchema.index({ assignedTo: 1 });

// Virtual để tính tỷ lệ hoàn thành
userStorySchema.virtual('completionRate').get(function() {
  if (this.statistics.totalTasks === 0) return 0;
  return Math.round((this.statistics.completedTasks / this.statistics.totalTasks) * 100);
});

// Virtual để tính tỷ lệ test pass
userStorySchema.virtual('testPassRate').get(function() {
  const total = this.testResults.unitTests.total + this.testResults.integrationTests.total + 
                this.testResults.e2eTests.total + this.testResults.manualTests.total;
  const passed = this.testResults.unitTests.passed + this.testResults.integrationTests.passed + 
                 this.testResults.e2eTests.passed + this.testResults.manualTests.passed;
  if (total === 0) return 0;
  return Math.round((passed / total) * 100);
});

// Virtual để kiểm tra Definition of Done
userStorySchema.virtual('isDefinitionOfDoneMet').get(function() {
  if (this.definitionOfDone.length === 0) return false;
  return this.definitionOfDone.every(item => item.isCompleted);
});

// Virtual để kiểm tra Acceptance Criteria
userStorySchema.virtual('isAcceptanceCriteriaMet').get(function() {
  if (this.acceptanceCriteria.length === 0) return false;
  return this.acceptanceCriteria.every(criteria => criteria.isMet);
});

// Method để cập nhật thống kê
userStorySchema.methods.updateStatistics = async function() {
  const Task = mongoose.model('Task');
  const Bug = mongoose.model('Bug');

  // Đếm tasks
  const taskStats = await Task.aggregate([
    { $match: { userStory: this._id } },
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
    { $match: { userStory: this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
      }
    }
  ]);

  // Cập nhật thống kê
  this.statistics.totalTasks = taskStats[0]?.total || 0;
  this.statistics.completedTasks = taskStats[0]?.completed || 0;
  this.statistics.totalBugs = bugStats[0]?.total || 0;
  this.statistics.resolvedBugs = bugStats[0]?.resolved || 0;

  await this.save();
};

// Method để thêm lịch sử thay đổi
userStorySchema.methods.addHistory = function(action, note, field, oldValue, newValue, user) {
  this.history.push({
    user: user || this.createdBy,
    action,
    time: new Date(),
    note,
    field,
    oldValue,
    newValue
  });
  return this.save();
};

// Method để chuyển trạng thái
userStorySchema.methods.changeStatus = function(newStatus, changedBy) {
  const oldStatus = this.status;
  this.status = newStatus;
  this.addHistory('status', `Changed status from ${oldStatus} to ${newStatus}`, 'status', oldStatus, newStatus, changedBy);
  return this.save();
};

module.exports = mongoose.model('UserStory', userStorySchema); 