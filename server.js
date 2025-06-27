const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load các biến môi trường từ file .env
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 phút
//   max: 100, // Giới hạn 100 requests per windowMs
//   message: 'Quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút.'
// });
// app.use('/api/', limiter);

// CORS middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));

// Middleware để đọc JSON từ request body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/software-dev-management')
    .then(() => console.log('✅ Kết nối MongoDB thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Import các models
require('./models/user.model');
require('./models/partner.model');
require('./models/project.model');
require('./models/module.model');
require('./models/module-request.model');
require('./models/sprint.model');
require('./models/user-story.model');
require('./models/task.model');
require('./models/bug.model');
require('./models/notification.model');

// Import middleware
const { authMiddleware } = require('./middleware/auth.middleware');

// Import các Routes - thêm dashboard route
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard.routes'));

// Tạm thời comment out các routes khác để debug
app.use('/api/partners', authMiddleware, require('./routes/partner.routes'));
app.use('/api/projects', authMiddleware, require('./routes/project.routes'));
app.use('/api/modules', authMiddleware, require('./routes/module.routes'));
app.use('/api/module-requests', authMiddleware, require('./routes/module-request.routes'));
app.use('/api/sprints', authMiddleware, require('./routes/sprint.routes'));
app.use('/api/user-stories', authMiddleware, require('./routes/user-story.routes'));
app.use('/api/tasks', authMiddleware, require('./routes/task.routes'));
app.use('/api/bugs', authMiddleware, require('./routes/bug.routes'));
app.use('/api/reports', authMiddleware, require('./routes/report.routes'));
app.use('/api/notifications', authMiddleware, require('./routes/notifications.routes'));
app.use('/api/users', authMiddleware, require('./routes/user.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đã tồn tại'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Lỗi server nội bộ'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;