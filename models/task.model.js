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
  comments: [commentSchema]
}, {
  timestamps: true
});

taskSchema.index({ code: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });

module.exports = mongoose.model('Task', taskSchema); 