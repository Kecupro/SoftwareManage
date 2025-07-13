 const mongoose = require('mongoose');

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

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề task là bắt buộc'],
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
    trim: true
  },
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
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'in-review', 'done', 'blocked'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['feature', 'bugfix', 'design', 'testing', 'documentation', 'bug', 'chore', 'epic'],
    default: 'feature'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: Date,
  dueDate: Date,
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  commitHash: String,
  history: [historySchema],
  comments: [commentSchema],
  traceability: {
    jiraTicket: String,
    gitlabMr: String,
    sonarQubeStatus: String,
    jenkinsBuild: String
  },
  deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveredAt: Date,
  deliveryStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  approvalNote: String,
  progress: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

taskSchema.index({ code: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });

taskSchema.pre('save', async function (next) {
  try {
    const Task = mongoose.model('Task');
    const taskId = this._id;
    if (this.parentTask) {
      return next();
    }
    const subtasks = await Task.find({ parentTask: taskId });
    if (subtasks.length > 0) {
      const completed = subtasks.filter(t => t.status === 'done').length;
      this.progress = Math.round((completed / subtasks.length) * 100);
    }
  } catch (e) {}
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Task', taskSchema); 