const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
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
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  scrumMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: String,
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
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 30 // Tối đa 30 ngày cho một Sprint
    }
  },
  // Trạng thái Sprint
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  // Mục tiêu Sprint
  goals: [String],
  // Definition of Done
  definitionOfDone: [String],
  // Thống kê Sprint
  statistics: {
    plannedStoryPoints: { type: Number, default: 0 },
    completedStoryPoints: { type: Number, default: 0 },
    totalUserStories: { type: Number, default: 0 },
    completedUserStories: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    totalBugs: { type: Number, default: 0 },
    resolvedBugs: { type: Number, default: 0 },
    velocity: { type: Number, default: 0 }, // Story points hoàn thành
    burndownData: [{
      date: Date,
      remainingStoryPoints: Number,
      completedStoryPoints: Number
    }]
  },
  // Sprint Events
  events: {
    sprintPlanning: {
      scheduled: Date,
      completed: Date,
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      notes: String
    },
    dailyScrum: [{
      date: Date,
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      notes: String
    }],
    sprintReview: {
      scheduled: Date,
      completed: Date,
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      feedback: String,
      demoNotes: String
    },
    sprintRetrospective: {
      scheduled: Date,
      completed: Date,
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      whatWentWell: [String],
      whatWentWrong: [String],
      improvements: [String],
      actionItems: [String]
    }
  },
  // Impediments (Trở ngại)
  impediments: [{
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  // Sprint Backlog
  backlog: {
    userStories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserStory'
    }],
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    bugs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bug'
    }]
  },
  // Metadata
  notes: String,
  tags: [String],
  versionTag: String,
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
  }
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
sprintSchema.index({ code: 1 });
sprintSchema.index({ project: 1 });
sprintSchema.index({ status: 1 });
sprintSchema.index({ 'timeline.startDate': 1 });
sprintSchema.index({ 'timeline.endDate': 1 });

// Virtual để tính tỷ lệ hoàn thành
sprintSchema.virtual('completionRate').get(function() {
  if (this.statistics.plannedStoryPoints === 0) return 0;
  return Math.round((this.statistics.completedStoryPoints / this.statistics.plannedStoryPoints) * 100);
});

// Virtual để tính số ngày còn lại
sprintSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const endDate = new Date(this.timeline.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual để kiểm tra Sprint có đang active không
sprintSchema.virtual('isActive').get(function() {
  if (this.status !== 'active') return false;
  const now = new Date();
  const startDate = new Date(this.timeline.startDate);
  const endDate = new Date(this.timeline.endDate);
  return now >= startDate && now <= endDate;
});

// Method để cập nhật thống kê
sprintSchema.methods.updateStatistics = async function() {
  const UserStory = mongoose.model('UserStory');
  const Task = mongoose.model('Task');
  const Bug = mongoose.model('Bug');

  // Đếm user stories
  const userStoryStats = await UserStory.aggregate([
    { $match: { sprint: this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalStoryPoints: { $sum: '$storyPoints' },
        completedStoryPoints: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$storyPoints', 0] } }
      }
    }
  ]);

  // Đếm tasks
  const taskStats = await Task.aggregate([
    { $match: { sprint: this._id } },
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
    { $match: { sprint: this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
      }
    }
  ]);

  // Cập nhật thống kê
  this.statistics.totalUserStories = userStoryStats[0]?.total || 0;
  this.statistics.completedUserStories = userStoryStats[0]?.completed || 0;
  this.statistics.plannedStoryPoints = userStoryStats[0]?.totalStoryPoints || 0;
  this.statistics.completedStoryPoints = userStoryStats[0]?.completedStoryPoints || 0;
  this.statistics.totalTasks = taskStats[0]?.total || 0;
  this.statistics.completedTasks = taskStats[0]?.completed || 0;
  this.statistics.totalBugs = bugStats[0]?.total || 0;
  this.statistics.resolvedBugs = bugStats[0]?.resolved || 0;
  this.statistics.velocity = this.statistics.completedStoryPoints;

  await this.save();
};

// Method để cập nhật burndown chart
sprintSchema.methods.updateBurndownChart = async function() {
  const UserStory = mongoose.model('UserStory');
  
  // Lấy tất cả user stories trong sprint
  const userStories = await UserStory.find({ sprint: this._id });
  
  // Tính toán burndown data
  const startDate = new Date(this.timeline.startDate);
  const endDate = new Date(this.timeline.endDate);
  const totalDays = this.timeline.duration;
  
  const burndownData = [];
  let remainingStoryPoints = this.statistics.plannedStoryPoints;
  
  for (let i = 0; i <= totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Tính story points đã hoàn thành đến ngày này
    const completedStories = userStories.filter(story => 
      story.status === 'completed' && 
      story.completedAt && 
      new Date(story.completedAt) <= currentDate
    );
    
    const completedStoryPoints = completedStories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
    
    burndownData.push({
      date: currentDate,
      remainingStoryPoints: Math.max(0, this.statistics.plannedStoryPoints - completedStoryPoints),
      completedStoryPoints: completedStoryPoints
    });
  }
  
  this.statistics.burndownData = burndownData;
  await this.save();
};

module.exports = mongoose.model('Sprint', sprintSchema); 