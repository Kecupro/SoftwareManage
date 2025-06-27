const mongoose = require('mongoose');

const moduleRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  timeline: {
    requestedStartDate: Date,
    requestedEndDate: Date,
    approvedStartDate: Date,
    approvedEndDate: Date
  },
  requirements: {
    technical: String,
    business: String
  },
  attachments: [
    {
      filename: String,
      originalname: String,
      path: String,
      mimetype: String,
      size: Number
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNote: String,
  approvedModule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  // Thông tin phản hồi từ team nội bộ
  internalResponse: {
    estimatedEffort: Number,
    technicalFeasibility: {
      type: String,
      enum: ['feasible', 'challenging', 'not-feasible'],
      default: 'feasible'
    },
    recommendedTechnologies: [String],
    risks: [String],
    suggestions: String,
    responseDate: Date
  },
  // Lịch sử thay đổi
  history: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['created', 'reviewed', 'approved', 'rejected', 'modified', 'completed']
    },
    time: {
      type: Date,
      default: Date.now
    },
    note: String,
    changes: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes
moduleRequestSchema.index({ partner: 1, status: 1 });
moduleRequestSchema.index({ project: 1, status: 1 });
moduleRequestSchema.index({ requestedAt: -1 });

// Virtuals
moduleRequestSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

moduleRequestSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

moduleRequestSchema.virtual('isRejected').get(function() {
  return this.status === 'rejected';
});

moduleRequestSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Methods
moduleRequestSchema.methods.addHistory = function(userId, action, note, changes = {}) {
  this.history.push({
    user: userId,
    action,
    time: new Date(),
    note,
    changes
  });
  return this.save();
};

moduleRequestSchema.methods.approve = function(userId, reviewNote, approvedModuleId = null) {
  this.status = 'approved';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.reviewNote = reviewNote;
  if (approvedModuleId) {
    this.approvedModule = approvedModuleId;
  }
  return this.addHistory(userId, 'approved', reviewNote);
};

moduleRequestSchema.methods.reject = function(userId, reviewNote) {
  this.status = 'rejected';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.reviewNote = reviewNote;
  return this.addHistory(userId, 'rejected', reviewNote);
};

moduleRequestSchema.methods.startProgress = function(userId) {
  this.status = 'in-progress';
  return this.addHistory(userId, 'modified', 'Bắt đầu thực hiện module');
};

moduleRequestSchema.methods.complete = function(userId) {
  this.status = 'completed';
  return this.addHistory(userId, 'completed', 'Module đã hoàn thành');
};

// Statics
moduleRequestSchema.statics.getPendingRequests = function() {
  return this.find({ status: 'pending' })
    .populate('partner', 'name code')
    .populate('project', 'name code')
    .populate('requestedBy', 'name email')
    .sort({ requestedAt: -1 });
};

moduleRequestSchema.statics.getPartnerRequests = function(partnerId, status = null) {
  const query = { partner: partnerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('project', 'name code')
    .populate('requestedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('approvedModule', 'name code status')
    .sort({ requestedAt: -1 });
};

module.exports = mongoose.model('ModuleRequest', moduleRequestSchema);
