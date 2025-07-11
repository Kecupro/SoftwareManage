const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/user.model');
const Partner = require('./models/partner.model');
const Project = require('./models/project.model');
const Module = require('./models/module.model');
const Sprint = require('./models/sprint.model');
const UserStory = require('./models/user-story.model');
const Task = require('./models/task.model');
const Bug = require('./models/bug.model');
const ModuleRequest = require('./models/module-request.model');

// Sample data arrays
const SAMPLE_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Dũng', 'Hoàng Thị Em',
  'Vũ Quang Phúc', 'Đặng Thị Giang', 'Bùi Văn Hùng', 'Ngô Thị I', 'Lý Văn Khoa',
  'Đỗ Thị Lan', 'Mai Văn Minh', 'Tô Thị Ngọc', 'Võ Văn Phương', 'Hồ Thị Quỳnh',
  'Dương Văn Rồng', 'Lưu Thị Sương', 'Trịnh Văn Tâm', 'Đinh Thị Uyên', 'Vương Văn Việt'
];

const SAMPLE_COMPANIES = [
  'Công ty TNHH ABC', 'Tập đoàn XYZ', 'Công ty CP DEF', 'Doanh nghiệp GHI',
  'Công ty TNHH JKL', 'Tập đoàn MNO', 'Công ty CP PQR', 'Doanh nghiệp STU',
  'Công ty TNHH VWX', 'Tập đoàn YZA', 'Công ty CP BCD', 'Doanh nghiệp EFG'
];

const SAMPLE_PROJECTS = [
  'Hệ thống Quản lý Khách hàng', 'Ứng dụng Mobile Banking', 'Website Thương mại Điện tử',
  'Hệ thống ERP', 'Ứng dụng Đặt xe', 'Website Tin tức', 'Hệ thống Quản lý Kho',
  'Ứng dụng Giáo dục', 'Website Du lịch', 'Hệ thống Quản lý Nhân sự',
  'Ứng dụng Y tế', 'Website Bất động sản', 'Hệ thống Quản lý Tài chính',
  'Ứng dụng Thực phẩm', 'Website Thời trang', 'Hệ thống Quản lý Vận tải'
];

const SAMPLE_MODULES = [
  'Quản lý Người dùng', 'Xác thực & Phân quyền', 'Quản lý Dữ liệu', 'Báo cáo & Thống kê',
  'Tích hợp API', 'Giao diện Admin', 'Quản lý File', 'Thông báo & Email',
  'Quản lý Cấu hình', 'Backup & Restore', 'Quản lý Log', 'Tối ưu Performance',
  'Quản lý Cache', 'Monitoring', 'Quản lý Database', 'Quản lý Security'
];

const SAMPLE_USER_STORIES = [
  'Là người dùng, tôi muốn đăng nhập để truy cập hệ thống',
  'Là admin, tôi muốn quản lý danh sách người dùng',
  'Là user, tôi muốn xem báo cáo thống kê',
  'Là manager, tôi muốn tạo dự án mới',
  'Là developer, tôi muốn xem danh sách task',
  'Là tester, tôi muốn báo cáo bug',
  'Là user, tôi muốn tìm kiếm thông tin',
  'Là admin, tôi muốn cấu hình hệ thống',
  'Là user, tôi muốn xuất dữ liệu ra Excel',
  'Là manager, tôi muốn theo dõi tiến độ dự án'
];

const SAMPLE_TASKS = [
  'Thiết kế database schema', 'Tạo API endpoints', 'Viết unit tests',
  'Implement authentication', 'Tạo giao diện admin', 'Tích hợp third-party API',
  'Optimize database queries', 'Implement caching', 'Setup CI/CD pipeline',
  'Write documentation', 'Code review', 'Bug fixing', 'Performance testing',
  'Security audit', 'Deploy to staging', 'User acceptance testing'
];

const SAMPLE_BUGS = [
  'Login không hoạt động trên mobile', 'Data không sync giữa các tab',
  'Performance chậm khi load nhiều dữ liệu', 'UI bị lỗi trên Safari',
  'API trả về lỗi 500', 'Validation không hoạt động', 'File upload bị lỗi',
  'Search không tìm được kết quả', 'Export Excel bị lỗi format',
  'Notification không gửi được email', 'Cache không update', 'Database connection timeout'
];

async function createMassiveSampleData() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    // Xóa dữ liệu cũ
    console.log('🗑️ Xóa dữ liệu cũ...');
    await User.deleteMany({});
    await Partner.deleteMany({});
    await Project.deleteMany({});
    await Module.deleteMany({});
    await Sprint.deleteMany({});
    await UserStory.deleteMany({});
    await Task.deleteMany({});
    await Bug.deleteMany({});
    await ModuleRequest.deleteMany({});

    // Tạo Users (50 users)
    console.log('👥 Tạo users...');
    const users = [];
    const roles = ['admin', 'ba', 'po', 'pm', 'dev', 'qa', 'devops'];
    
    for (let i = 0; i < 50; i++) {
      const user = new User({
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: 'Test123!',
        fullName: SAMPLE_NAMES[i % SAMPLE_NAMES.length],
        role: roles[i % roles.length],
        isActive: true,
        status: 'active',
        profile: {
          phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
          address: `Địa chỉ ${i + 1}, TP.HCM`,
          avatar: `https://ui-avatars.com/api/?name=${SAMPLE_NAMES[i % SAMPLE_NAMES.length]}&background=random`
        }
      });
      users.push(await user.save());
    }
    console.log(`✅ Đã tạo ${users.length} users`);

    // Tạo Partners (20 partners)
    console.log('🤝 Tạo partners...');
    const partners = [];
    for (let i = 0; i < 20; i++) {
      const partner = new Partner({
        code: `P${String(i + 1).padStart(3, '0')}`,
        name: SAMPLE_COMPANIES[i % SAMPLE_COMPANIES.length],
        contact: {
          primaryContact: {
            name: SAMPLE_NAMES[i % SAMPLE_NAMES.length],
            email: `partner${i + 1}@company.com`,
            phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
            position: 'Manager'
          },
          address: {
            street: `Địa chỉ công ty ${i + 1}`,
            city: 'TP.HCM',
            state: 'HCM',
            country: 'Vietnam',
            zipCode: '70000'
          },
          website: `https://company${i + 1}.com`
        },
        business: {
          type: ['startup', 'sme', 'enterprise', 'government', 'other'][Math.floor(Math.random() * 5)],
          industry: 'Technology',
          size: ['1-10', '11-50', '51-200', '201-1000', '1000+'][Math.floor(Math.random() * 5)],
          foundedYear: 2010 + Math.floor(Math.random() * 14),
          taxCode: `0123456789${String(i).padStart(3, '0')}`
        },
        status: 'active',
        createdBy: users[Math.floor(Math.random() * users.length)]._id
      });
      partners.push(await partner.save());
    }
    console.log(`✅ Đã tạo ${partners.length} partners`);

    // Tạo Projects (30 projects)
    console.log('📋 Tạo projects...');
    const projects = [];
    for (let i = 0; i < 30; i++) {
      const project = new Project({
        name: SAMPLE_PROJECTS[i % SAMPLE_PROJECTS.length],
        description: `Mô tả chi tiết cho dự án ${SAMPLE_PROJECTS[i % SAMPLE_PROJECTS.length]}`,
        code: `PRJ${String(i + 1).padStart(3, '0')}`,
        status: ['planning', 'active', 'on-hold', 'completed', 'cancelled'][Math.floor(Math.random() * 5)],
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        partner: {
          id: partners[Math.floor(Math.random() * partners.length)]._id,
          name: partners[Math.floor(Math.random() * partners.length)].name,
          contactPerson: partners[Math.floor(Math.random() * partners.length)].contact.primaryContact.name,
          email: partners[Math.floor(Math.random() * partners.length)].contact.primaryContact.email,
          phone: partners[Math.floor(Math.random() * partners.length)].contact.primaryContact.phone
        },
        team: {
          productOwner: users[Math.floor(Math.random() * users.length)]._id,
          projectManager: users[Math.floor(Math.random() * users.length)]._id,
          businessAnalyst: users[Math.floor(Math.random() * users.length)]._id,
          developers: [users[Math.floor(Math.random() * users.length)]._id, users[Math.floor(Math.random() * users.length)]._id],
          testers: [users[Math.floor(Math.random() * users.length)]._id],
          devops: [users[Math.floor(Math.random() * users.length)]._id]
        },
        timeline: {
          startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
          estimatedDuration: Math.floor(Math.random() * 180) + 30,
          actualDuration: Math.floor(Math.random() * 180) + 30
        },
        statistics: {
          totalModules: Math.floor(Math.random() * 20) + 5,
          completedModules: Math.floor(Math.random() * 15) + 2,
          totalUserStories: Math.floor(Math.random() * 100) + 20,
          completedUserStories: Math.floor(Math.random() * 80) + 10,
          totalTasks: Math.floor(Math.random() * 500) + 100,
          completedTasks: Math.floor(Math.random() * 400) + 80,
          totalBugs: Math.floor(Math.random() * 50) + 10,
          resolvedBugs: Math.floor(Math.random() * 40) + 5,
          testCoverage: Math.floor(Math.random() * 30) + 70
        },
        createdBy: users[Math.floor(Math.random() * users.length)]._id,
        gitConfig: {
          repository: `https://github.com/example/repo${i + 1}.git`
        }
      });
      projects.push(await project.save());
    }
    console.log(`✅ Đã tạo ${projects.length} projects`);

    // Tạo Modules (100 modules)
    console.log('📦 Tạo modules...');
    const modules = [];
    for (let i = 0; i < 100; i++) {
      const module = new Module({
        name: SAMPLE_MODULES[i % SAMPLE_MODULES.length],
        description: `Mô tả chi tiết cho module ${SAMPLE_MODULES[i % SAMPLE_MODULES.length]}`,
        code: `MOD${String(i + 1).padStart(3, '0')}`,
        project: projects[Math.floor(Math.random() * projects.length)]._id,
        status: ['planning', 'in-development', 'testing', 'completed', 'delivered', 'maintenance'][Math.floor(Math.random() * 6)],
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        assignedTo: users[Math.floor(Math.random() * users.length)]._id,
        estimatedHours: Math.floor(Math.random() * 80) + 20,
        actualHours: Math.floor(Math.random() * 100) + 15,
        progress: Math.floor(Math.random() * 100),
        createdBy: users[Math.floor(Math.random() * users.length)]._id
      });
      modules.push(await module.save());
    }
    console.log(`✅ Đã tạo ${modules.length} modules`);

    // Tạo Sprints (50 sprints)
    console.log('🏃 Tạo sprints...');
    const sprints = [];
    for (let i = 0; i < 50; i++) {
      const startDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // số ngày
      
      const sprint = new Sprint({
        name: `Sprint ${i + 1}`,
        code: `SPR${String(i + 1).padStart(3, '0')}`,
        project: projects[Math.floor(Math.random() * projects.length)]._id,
        timeline: {
          startDate: startDate,
          endDate: endDate,
          duration: duration
        },
        status: ['planning', 'active', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
        goal: `Mục tiêu của Sprint ${i + 1}`,
        velocity: Math.floor(Math.random() * 50) + 20,
        createdBy: users[Math.floor(Math.random() * users.length)]._id
      });
      sprints.push(await sprint.save());
    }
    console.log(`✅ Đã tạo ${sprints.length} sprints`);

    // Tạo User Stories (200 user stories)
    console.log('📖 Tạo user stories...');
    const userStories = [];
    for (let i = 0; i < 200; i++) {
      const userStory = new UserStory({
        title: SAMPLE_USER_STORIES[i % SAMPLE_USER_STORIES.length],
        description: `Mô tả chi tiết cho user story ${i + 1}`,
        code: `US${String(i + 1).padStart(3, '0')}`,
        project: projects[Math.floor(Math.random() * projects.length)]._id,
        module: modules[Math.floor(Math.random() * modules.length)]._id,
        sprint: sprints[Math.floor(Math.random() * sprints.length)]._id,
        userStory: {
          asA: 'user',
          iWant: SAMPLE_USER_STORIES[i % SAMPLE_USER_STORIES.length],
          soThat: 'I can achieve my goal'
        },
        status: ['backlog', 'sprint-backlog', 'in-progress', 'testing', 'completed', 'accepted', 'rejected'][Math.floor(Math.random() * 7)],
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        estimation: {
          storyPoints: Math.floor(Math.random() * 13) + 1
        },
        assignedTo: users[Math.floor(Math.random() * users.length)]._id,
        createdBy: users[Math.floor(Math.random() * users.length)]._id
      });
      userStories.push(await userStory.save());
    }
    console.log(`✅ Đã tạo ${userStories.length} user stories`);

    // Tạo Tasks (500 tasks)
    console.log('✅ Tạo tasks...');
    const tasks = [];
    for (let i = 0; i < 500; i++) {
      const task = new Task({
        title: SAMPLE_TASKS[i % SAMPLE_TASKS.length],
        description: `Mô tả chi tiết cho task ${i + 1}`,
        code: `TASK${String(i + 1).padStart(3, '0')}`,
        project: projects[Math.floor(Math.random() * projects.length)]._id,
        module: modules[Math.floor(Math.random() * modules.length)]._id,
        userStory: userStories[Math.floor(Math.random() * userStories.length)]._id,
        sprint: sprints[Math.floor(Math.random() * sprints.length)]._id,
        status: ['todo', 'in-progress', 'in-review', 'done', 'blocked'][Math.floor(Math.random() * 5)],
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        type: ['feature', 'bugfix', 'design', 'testing', 'documentation', 'bug', 'chore', 'epic'][Math.floor(Math.random() * 8)],
        estimatedHours: Math.floor(Math.random() * 16) + 2,
        actualHours: Math.floor(Math.random() * 20) + 1,
        assignee: users[Math.floor(Math.random() * users.length)]._id,
        reporter: users[Math.floor(Math.random() * users.length)]._id,
        createdBy: users[Math.floor(Math.random() * users.length)]._id
      });
      tasks.push(await task.save());
    }
    console.log(`✅ Đã tạo ${tasks.length} tasks`);

    // Tạo Bugs (100 bugs)
    console.log('🐛 Tạo bugs...');
    const bugs = [];
    for (let i = 0; i < 100; i++) {
      const bug = new Bug({
        title: SAMPLE_BUGS[i % SAMPLE_BUGS.length],
        description: `Mô tả chi tiết cho bug ${i + 1}`,
        code: `BUG${String(i + 1).padStart(3, '0')}`,
        project: projects[Math.floor(Math.random() * projects.length)]._id,
        module: modules[Math.floor(Math.random() * modules.length)]._id,
        status: ['open', 'in-progress', 'testing', 'resolved', 'closed', 'reopened'][Math.floor(Math.random() * 6)],
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        type: ['functional', 'performance', 'security', 'ui-ux', 'compatibility', 'data', 'other'][Math.floor(Math.random() * 7)],
        environment: ['development', 'staging', 'production'][Math.floor(Math.random() * 3)],
        assignedTo: users[Math.floor(Math.random() * users.length)]._id,
        reportedBy: users[Math.floor(Math.random() * users.length)]._id,
        createdBy: users[Math.floor(Math.random() * users.length)]._id
      });
      bugs.push(await bug.save());
    }
    console.log(`✅ Đã tạo ${bugs.length} bugs`);

    // Tạo Module Requests (50 requests)
    console.log('📝 Tạo module requests...');
    const moduleRequests = [];
    for (let i = 0; i < 50; i++) {
      const moduleRequest = new ModuleRequest({
        name: `Yêu cầu module ${i + 1}`,
        description: `Mô tả chi tiết cho yêu cầu module ${i + 1}`,
        code: `MR${String(i + 1).padStart(3, '0')}`,
        partner: partners[Math.floor(Math.random() * partners.length)]._id,
        project: projects[Math.floor(Math.random() * projects.length)]._id,
        status: ['pending', 'approved', 'rejected', 'in-progress', 'completed'][Math.floor(Math.random() * 5)],
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        estimatedHours: Math.floor(Math.random() * 80) + 20,
        requestedBy: users[Math.floor(Math.random() * users.length)]._id,
        createdBy: users[Math.floor(Math.random() * users.length)]._id
      });
      moduleRequests.push(await moduleRequest.save());
    }
    console.log(`✅ Đã tạo ${moduleRequests.length} module requests`);

    console.log('🎉 Hoàn thành tạo dữ liệu mẫu!');
    console.log('📊 Tổng kết:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🤝 Partners: ${partners.length}`);
    console.log(`   📋 Projects: ${projects.length}`);
    console.log(`   📦 Modules: ${modules.length}`);
    console.log(`   🏃 Sprints: ${sprints.length}`);
    console.log(`   📖 User Stories: ${userStories.length}`);
    console.log(`   ✅ Tasks: ${tasks.length}`);
    console.log(`   🐛 Bugs: ${bugs.length}`);
    console.log(`   📝 Module Requests: ${moduleRequests.length}`);

  } catch (error) {
    console.error('❌ Lỗi tạo dữ liệu mẫu:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Đã đóng kết nối MongoDB');
  }
}

createMassiveSampleData(); 