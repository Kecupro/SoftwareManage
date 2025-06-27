const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware để đọc JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Kết nối đến MongoDB
mongoose.connect('mongodb://localhost:27017/software-dev-management')
    .then(() => console.log('✅ Kết nối MongoDB thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Import models
require('./models/user.model');

// Simple auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp'
      });
    }

    // For now, just pass through
    req.user = { _id: 'demo-user', role: 'admin' };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo login
  if (email === 'admin@example.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: 'demo-user',
          username: 'admin',
          email: 'admin@example.com',
          fullName: 'Admin User',
          role: 'admin'
        },
        token: 'demo-token-123'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: 'demo-user',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'admin'
      }
    }
  });
});

// Dashboard routes
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 12,
      activeProjects: 8,
      totalTasks: 156,
      completedTasks: 89,
      totalBugs: 23,
      resolvedBugs: 18,
      currentSprint: {
        name: 'Sprint 3',
        startDate: '2024-01-15',
        endDate: '2024-01-28',
        progress: 65
      },
      recentActivities: [
        { id: 1, type: 'task', message: 'Task "Implement login feature" completed', time: '2 hours ago' },
        { id: 2, type: 'bug', message: 'Bug "Payment not working" reported', time: '4 hours ago' },
        { id: 3, type: 'sprint', message: 'Sprint 3 started', time: '1 day ago' },
        { id: 4, type: 'project', message: 'New project "E-commerce Platform" created', time: '2 days ago' }
      ]
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại'
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Demo login: admin@example.com / password123`);
}); 