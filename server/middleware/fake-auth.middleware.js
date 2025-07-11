// Fake auth middleware cho development
const fakeAuthMiddleware = (req, res, next) => {
  // Tạo fake user cho development
  req.user = {
    _id: 'fake-user-id',
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Administrator',
    role: 'admin',
    department: 'IT',
    position: 'System Administrator',
    isActive: true,
    permissions: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'projects:read', 'projects:create', 'projects:update', 'projects:delete',
      'modules:read', 'modules:create', 'modules:update', 'modules:delete',
      'sprints:read', 'sprints:create', 'sprints:update', 'sprints:delete',
      'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete',
      'bugs:read', 'bugs:create', 'bugs:update', 'bugs:delete',
      'reports:read', 'reports:create',
      'partners:read', 'partners:create', 'partners:update', 'partners:delete'
    ],
    hasPermission: (permission) => {
      return req.user.permissions.includes(permission);
    },
    canAccessData: () => true
  };
  next();
};

module.exports = { fakeAuthMiddleware }; 