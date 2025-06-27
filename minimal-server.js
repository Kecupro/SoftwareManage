const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Auth routes
  if (path === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        
        if (email === 'admin@example.com' && password === 'password123') {
          res.writeHead(200);
          res.end(JSON.stringify({
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
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Email hoặc mật khẩu không đúng'
          }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Dữ liệu không hợp lệ'
        }));
      }
    });
    return;
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        message: 'Token không được cung cấp'
      }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({
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
    }));
    return;
  }

  // Dashboard routes
  if (path === '/api/dashboard/stats' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        message: 'Token không được cung cấp'
      }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({
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
    }));
    return;
  }

  // Health check
  if (path === '/api/health' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: 'development'
    }));
    return;
  }

  // 404 handler
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    message: 'API endpoint không tồn tại'
  }));
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`🚀 Minimal server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Demo login: admin@example.com / password123`);
  console.log(`🌐 Frontend should run at: http://localhost:5173`);
}); 