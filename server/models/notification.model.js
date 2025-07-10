const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'delivery',
      'task',
      'bug',
      'module-request',
      'module-request-approved',
      'module-request-rejected'
    ],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedModule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  relatedBug: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug'
  },
  relatedSprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  relatedModuleRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModuleRequest'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);
