// Fake auth middleware để test mà không cần đăng nhập
const fakeAuthMiddleware = (req, res, next) => {
  // Tạo fake user data
  req.user = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
    name: 'Test User'
  };
  
  console.log('🔓 Fake auth - User:', req.user.username);
  next();
};

module.exports = { fakeAuthMiddleware }; 