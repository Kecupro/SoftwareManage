// models/module.model.js
const mongoose = require('mongoose')

const moduleSchema = new mongoose.Schema({
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
    description: {
        type: String,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['planning', 'in-development', 'testing', 'completed', 'delivered', 'maintenance'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    // Thông tin phiên bản
    version: {
        current: {
            type: String,
            default: '1.0.0'
        },
        history: [{
            version: String,
            releaseDate: Date,
            changes: String,
            deliveredBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'deliveredByModel' },
            deliveredByModel: { type: String, enum: ['User', 'Partner'] },
            gitTag: String,
            gitCommit: String
        }]
    },
    // Thông tin bàn giao
    delivery: {
        source: {
            type: String,
            enum: ['internal', 'partner', 'external-team'],
            default: 'internal'
        },
        partner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner'
        },
        team: {
            type: String,
            default: 'internal'
        },
        deliveryDate: Date,
        acceptanceDate: Date,
        acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        deliveredBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'deliveredByModel' },
        deliveredByModel: { type: String, enum: ['User', 'Partner'] },
        deliveryFiles: [String],
        deliveryCommit: String,
        deliveryTime: Date,
        deliveryNote: String
    },
    // Trạng thái bàn giao & phê duyệt
    deliveryStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    approvalNote: String,
    // Sprint liên quan
    sprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprint'
    },
    // Thông tin kỹ thuật
    technicalInfo: {
        technology: [String],
        framework: [String],
        database: String,
        apiEndpoints: [String],
        dependencies: [String],
        estimatedEffort: Number, // Số giờ ước tính
        actualEffort: Number // Số giờ thực tế
    },
    // Thông tin Git
    gitInfo: {
        repository: String,
        branch: String,
        lastCommit: {
            hash: String,
            message: String,
            author: String,
            date: Date
        },
        pullRequests: [{
            id: String,
            title: String,
            status: String,
            url: String
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
        lastTestRun: Date,
        testReportUrl: String
    },
    // Build và Deploy
    buildInfo: {
        lastBuild: {
            status: {
                type: String,
                enum: ['success', 'failed', 'running'],
                default: 'success'
            },
            date: Date,
            duration: Number,
            logUrl: String
        },
        dockerImage: String,
        stagingUrl: String,
        productionUrl: String
    },
    // Tài liệu
    documents: [{
        name: String,
        type: {
            type: String,
            enum: ['requirement', 'design', 'api', 'user-guide', 'other']
        },
        url: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Thống kê
    statistics: {
        totalUserStories: { type: Number, default: 0 },
        completedUserStories: { type: Number, default: 0 },
        totalTasks: { type: Number, default: 0 },
        completedTasks: { type: Number, default: 0 },
        totalBugs: { type: Number, default: 0 },
        resolvedBugs: { type: Number, default: 0 }
    },
    // Metadata
    tags: [String],
    category: String,
    // --- PHÂN QUYỀN VÀ NGƯỜI PHỤ TRÁCH ---
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Dev chính
    qa: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    devOps: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // --- TIẾN ĐỘ ---
    progress: { type: Number, default: 0 }, // % tiến độ, tự động tính

    // --- TRACEABILITY ---
    traceability: {
        jiraTicket: String,
        gitlabMr: String,
        sonarQubeStatus: String,
        jenkinsBuild: String
    },

    // --- LỊCH SỬ THAY ĐỔI ---
    history: [
        {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            action: String, // Created, Updated, Delivered, Approved, Rejected, ...
        time: { type: Date, default: Date.now },
            note: String
        }
    ],

    // --- NGƯỜI TẠO/CẬP NHẬT ---
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index để tối ưu truy vấn
moduleSchema.index({ code: 1 });
moduleSchema.index({ project: 1 });
moduleSchema.index({ status: 1 });
moduleSchema.index({ sprint: 1 });

// Virtual để tính tỷ lệ hoàn thành
moduleSchema.virtual('completionRate').get(function() {
    if (this.statistics.totalUserStories === 0) return 0;
    return Math.round((this.statistics.completedUserStories / this.statistics.totalUserStories) * 100);
});

// Virtual để tính tỷ lệ test pass
moduleSchema.virtual('testPassRate').get(function() {
    const total = this.testResults.unitTests.total + this.testResults.integrationTests.total + this.testResults.e2eTests.total;
    const passed = this.testResults.unitTests.passed + this.testResults.integrationTests.passed + this.testResults.e2eTests.passed;
    if (total === 0) return 0;
    return Math.round((passed / total) * 100);
});

// Method để cập nhật thống kê
moduleSchema.methods.updateStatistics = async function() {
    const UserStory = mongoose.model('UserStory');
    const Task = mongoose.model('Task');
    const Bug = mongoose.model('Bug');

    // Đếm user stories
    const userStoryStats = await UserStory.aggregate([
        { $match: { module: this._id } },
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
        { $match: { module: this._id } },
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
        { $match: { module: this._id } },
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
    this.statistics.totalTasks = taskStats[0]?.total || 0;
    this.statistics.completedTasks = taskStats[0]?.completed || 0;
    this.statistics.totalBugs = bugStats[0]?.total || 0;
    this.statistics.resolvedBugs = bugStats[0]?.resolved || 0;

    await this.save();
};

// Method để tạo phiên bản mới
moduleSchema.methods.createNewVersion = function(version, changes, deliveredBy, gitTag, gitCommit) {
    this.version.history.push({
        version,
        releaseDate: new Date(),
        changes,
        deliveredBy,
        gitTag,
        gitCommit
    });
    this.version.current = version;
    return this.save();
};

// --- TỰ ĐỘNG CẬP NHẬT PROGRESS KHI LƯU MODULE ---
moduleSchema.pre('save', async function (next) {
    // Nếu có task/user story con thì tự động tính progress
    try {
        const Task = mongoose.model('Task');
        const UserStory = mongoose.model('UserStory');
        const moduleId = this._id;
        const [tasks, userStories] = await Promise.all([
            Task.find({ module: moduleId }),
            UserStory.find({ module: moduleId })
        ]);
        let total = 0, completed = 0;
        if (tasks.length > 0) {
            total += tasks.length;
            completed += tasks.filter(t => t.status === 'completed').length;
        }
        if (userStories.length > 0) {
            total += userStories.length;
            completed += userStories.filter(us => us.status === 'completed').length;
        }
        if (total > 0) {
            this.progress = Math.round((completed / total) * 100);
        }
    } catch (e) {
        // Bỏ qua nếu lỗi
    }
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Module', moduleSchema);