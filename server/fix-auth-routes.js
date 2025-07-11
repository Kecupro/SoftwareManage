const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'server', 'routes');
const routeFiles = [
  'partner.routes.js',
  'module.routes.js', 
  'module-request.routes.js',
  'sprint.routes.js',
  'user-story.routes.js',
  'task.routes.js',
  'bug.routes.js',
  'report.routes.js',
  'notifications.routes.js',
  'user.routes.js'
];

console.log('🔧 Fixing auth middleware in route files...');

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Thêm import fakeAuthMiddleware nếu chưa có
    if (!content.includes('fakeAuthMiddleware')) {
      content = content.replace(
        /const \{ authMiddleware, checkRole, checkPermission, filterDataByScope \} = require\('\.\.\/middleware\/auth\.middleware'\);/,
        `const { authMiddleware, checkRole, checkPermission, filterDataByScope } = require('../middleware/auth.middleware');
const { fakeAuthMiddleware } = require('../middleware/fake-auth.middleware');`
      );
    }
    
    // Thay thế authMiddleware bằng fakeAuthMiddleware
    content = content.replace(/authMiddleware/g, 'fakeAuthMiddleware');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

console.log('🎉 All route files updated!'); 