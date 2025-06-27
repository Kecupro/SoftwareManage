const mongoose = require('mongoose');
const User = require('./models/user.model');
const Project = require('./models/project.model');
const Sprint = require('./models/sprint.model');
const UserStory = require('./models/user-story.model');
const Task = require('./models/task.model');
const Partner = require('./models/partner.model');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/software-dev-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createRealData() {
  try {
    console.log('🚀 Bắt đầu tạo dữ liệu thật...');

    // 1. Tạo Users thật
    const users = await createUsers();
    console.log('✅ Đã tạo', users.length, 'users');

    // 2. Tạo Project E-commerce
    const project = await createProject(users[0]._id);
    console.log('✅ Đã tạo project:', project.name);

    // 3. Tạo Sprints
    const sprints = await createSprints(project._id, users[0]._id);
    console.log('✅ Đã tạo', sprints.length, 'sprints');

    // 4. Tạo User Stories
    const userStories = await createUserStories(project._id, sprints, users);
    console.log('✅ Đã tạo', userStories.length, 'user stories');

    // 5. Tạo Tasks
    const tasks = await createTasks(userStories, users);
    console.log('✅ Đã tạo', tasks.length, 'tasks');

    console.log('🎉 Hoàn thành tạo dữ liệu thật!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function createUsers() {
  const usersData = [
    {
      username: 'admin',
      email: 'admin@company.com',
      password: 'admin123456',
      fullName: 'Admin User',
      role: 'admin'
    },
    {
      username: 'product_manager',
      email: 'pm@company.com',
      password: 'pm123456',
      fullName: 'Product Manager',
      role: 'pm'
    },
    {
      username: 'frontend_dev',
      email: 'frontend@company.com',
      password: 'dev123456',
      fullName: 'Frontend Developer',
      role: 'dev'
    },
    {
      username: 'backend_dev',
      email: 'backend@company.com',
      password: 'dev123456',
      fullName: 'Backend Developer',
      role: 'dev'
    },
    {
      username: 'qa_tester',
      email: 'qa@company.com',
      password: 'qa123456',
      fullName: 'QA Tester',
      role: 'qa'
    }
  ];

  const users = [];
  for (const userData of usersData) {
    const existingUser = await User.findOne({ username: userData.username });
    if (!existingUser) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    } else {
      users.push(existingUser);
    }
  }
  return users;
}

async function createPartner(createdBy) {
  const partnerData = {
    name: 'Ecom Partner',
    code: 'PARTNER-ECOM',
    description: 'Đối tác dự án E-commerce',
    contact: {
      primaryContact: {
        name: 'Nguyen Van A',
        email: 'contact@ecom-partner.com',
        phone: '0901234567',
        position: 'Giám đốc'
      },
      address: {
        street: '123 Đường ABC',
        city: 'Hà Nội',
        country: 'Việt Nam'
      },
      website: 'https://ecom-partner.com'
    },
    business: {
      type: 'enterprise',
      industry: 'E-commerce',
      size: '51-200',
      foundedYear: 2015
    },
    status: 'active',
    createdBy
  };
  let partner = await Partner.findOne({ code: partnerData.code });
  if (!partner) {
    partner = new Partner(partnerData);
    await partner.save();
  }
  return partner;
}

async function createProject(createdBy) {
  // Tạo partner mẫu
  const partner = await createPartner(createdBy);

  const projectData = {
    name: 'E-commerce Website',
    code: 'ECOMM-001',
    description: 'Xây dựng website thương mại điện tử hiện đại với đầy đủ tính năng mua bán, quản lý đơn hàng, thanh toán online',
    status: 'active',
    priority: 'high',
    partner: {
      id: partner._id,
      name: partner.name,
      contactPerson: partner.contact.primaryContact.name,
      email: partner.contact.primaryContact.email,
      phone: partner.contact.primaryContact.phone
    },
    team: {},
    gitConfig: {
      repository: 'https://github.com/example/ecommerce',
      branch: 'main'
    },
    timeline: {
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30')
    },
    createdBy: createdBy
  };

  const existingProject = await Project.findOne({ code: projectData.code });
  if (existingProject) {
    return existingProject;
  }

  const project = new Project(projectData);
  await project.save();
  return project;
}

async function createSprints(projectId, createdBy) {
  const sprintsData = [
    {
      name: 'Sprint 1: Foundation',
      code: 'SPR-001',
      project: projectId,
      goal: 'Thiết lập cơ sở hạ tầng và authentication system',
      timeline: {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-28'),
        duration: 14
      },
      status: 'completed',
      velocity: 20,
      capacity: 25,
      createdBy: createdBy
    },
    {
      name: 'Sprint 2: Product Catalog',
      code: 'SPR-002',
      project: projectId,
      goal: 'Xây dựng hệ thống quản lý sản phẩm và danh mục',
      timeline: {
        startDate: new Date('2024-01-29'),
        endDate: new Date('2024-02-11'),
        duration: 14
      },
      status: 'active',
      velocity: 18,
      capacity: 25,
      createdBy: createdBy
    },
    {
      name: 'Sprint 3: Shopping Cart',
      code: 'SPR-003',
      project: projectId,
      goal: 'Phát triển giỏ hàng và quy trình thanh toán',
      timeline: {
        startDate: new Date('2024-02-12'),
        endDate: new Date('2024-02-25'),
        duration: 14
      },
      status: 'planning',
      velocity: 0,
      capacity: 25,
      createdBy: createdBy
    }
  ];

  const sprints = [];
  for (const sprintData of sprintsData) {
    const existingSprint = await Sprint.findOne({ code: sprintData.code });
    if (!existingSprint) {
      const sprint = new Sprint(sprintData);
      await sprint.save();
      sprints.push(sprint);
    } else {
      sprints.push(existingSprint);
    }
  }
  return sprints;
}

async function createUserStories(projectId, sprints, users) {
  const userStoriesData = [
    // Sprint 1: Foundation
    {
      title: 'User Authentication System',
      code: 'US-001',
      description: 'Hệ thống đăng nhập, đăng ký và quản lý tài khoản người dùng',
      project: projectId,
      sprint: sprints[0]._id,
      assignedTo: users[2]._id, // Frontend dev
      userStory: {
        asA: 'Customer',
        iWant: 'to register and login to my account',
        soThat: 'I can access personalized features and track my orders'
      },
      acceptanceCriteria: [
        { description: 'User can register with email and password', isMet: false },
        { description: 'User can login with valid credentials', isMet: false },
        { description: 'User can reset password via email', isMet: false },
        { description: 'User profile shows personal information', isMet: false }
      ],
      priority: 'high',
      status: 'completed',
      estimation: {
        storyPoints: 8,
        timeEstimate: 16
      },
      createdBy: users[1]._id // Product Manager
    },
    {
      title: 'Admin Dashboard',
      code: 'US-002',
      description: 'Giao diện quản trị cho admin quản lý website',
      project: projectId,
      sprint: sprints[0]._id,
      assignedTo: users[2]._id, // Frontend dev
      userStory: {
        asA: 'Admin',
        iWant: 'to access admin dashboard',
        soThat: 'I can manage products, orders, and users'
      },
      acceptanceCriteria: [
        { description: 'Admin can login with special credentials', isMet: false },
        { description: 'Dashboard shows key metrics and statistics', isMet: false },
        { description: 'Admin can navigate to different management sections', isMet: false },
        { description: 'Dashboard is responsive and user-friendly', isMet: false }
      ],
      priority: 'high',
      status: 'completed',
      estimation: {
        storyPoints: 5,
        timeEstimate: 12
      },
      createdBy: users[1]._id
    },
    // Sprint 2: Product Catalog
    {
      title: 'Product Management',
      code: 'US-003',
      description: 'Hệ thống quản lý sản phẩm cho admin',
      project: projectId,
      sprint: sprints[1]._id,
      assignedTo: users[3]._id, // Backend dev
      userStory: {
        asA: 'Admin',
        iWant: 'to manage products in the catalog',
        soThat: 'I can add, edit, and organize products for customers'
      },
      acceptanceCriteria: [
        { description: 'Admin can add new products with images and details', isMet: false },
        { description: 'Admin can edit existing product information', isMet: false },
        { description: 'Admin can categorize products', isMet: false },
        { description: 'Admin can set product status (active/inactive)', isMet: false }
      ],
      priority: 'high',
      status: 'in-progress',
      estimation: {
        storyPoints: 13,
        timeEstimate: 24
      },
      createdBy: users[1]._id
    },
    {
      title: 'Product Catalog Display',
      code: 'US-004',
      description: 'Hiển thị danh sách sản phẩm cho khách hàng',
      project: projectId,
      sprint: sprints[1]._id,
      assignedTo: users[2]._id, // Frontend dev
      userStory: {
        asA: 'Customer',
        iWant: 'to browse products in the catalog',
        soThat: 'I can find and view products I want to buy'
      },
      acceptanceCriteria: [
        { description: 'Products are displayed in a grid layout', isMet: false },
        { description: 'Each product shows image, name, price, and rating', isMet: false },
        { description: 'Customer can filter products by category', isMet: false },
        { description: 'Customer can search products by name', isMet: false }
      ],
      priority: 'high',
      status: 'in-progress',
      estimation: {
        storyPoints: 8,
        timeEstimate: 16
      },
      createdBy: users[1]._id
    },
    // Sprint 3: Shopping Cart
    {
      title: 'Shopping Cart',
      code: 'US-005',
      description: 'Giỏ hàng cho khách hàng thêm và quản lý sản phẩm',
      project: projectId,
      sprint: sprints[2]._id,
      assignedTo: users[2]._id, // Frontend dev
      userStory: {
        asA: 'Customer',
        iWant: 'to add products to my shopping cart',
        soThat: 'I can collect items before making a purchase'
      },
      acceptanceCriteria: [
        { description: 'Customer can add products to cart', isMet: false },
        { description: 'Cart shows total items and total price', isMet: false },
        { description: 'Customer can update quantities in cart', isMet: false },
        { description: 'Customer can remove items from cart', isMet: false }
      ],
      priority: 'high',
      status: 'backlog',
      estimation: {
        storyPoints: 5,
        timeEstimate: 12
      },
      createdBy: users[1]._id
    },
    {
      title: 'Checkout Process',
      code: 'US-006',
      description: 'Quy trình thanh toán và đặt hàng',
      project: projectId,
      sprint: sprints[2]._id,
      assignedTo: users[3]._id, // Backend dev
      userStory: {
        asA: 'Customer',
        iWant: 'to complete my purchase',
        soThat: 'I can buy products and receive confirmation'
      },
      acceptanceCriteria: [
        { description: 'Customer can enter shipping information', isMet: false },
        { description: 'Customer can choose payment method', isMet: false },
        { description: 'System validates payment information', isMet: false },
        { description: 'Customer receives order confirmation', isMet: false }
      ],
      priority: 'high',
      status: 'backlog',
      estimation: {
        storyPoints: 13,
        timeEstimate: 24
      },
      createdBy: users[1]._id
    }
  ];

  const userStories = [];
  for (const storyData of userStoriesData) {
    const existingStory = await UserStory.findOne({ code: storyData.code });
    if (!existingStory) {
      const story = new UserStory(storyData);
      await story.save();
      userStories.push(story);
    } else {
      userStories.push(existingStory);
    }
  }
  return userStories;
}

async function createTasks(userStories, users) {
  const tasksData = [
    // Tasks for US-001: User Authentication
    {
      code: 'TASK-001',
      title: 'Design login/register UI',
      description: 'Tạo giao diện đăng nhập và đăng ký',
      project: userStories[0].project,
      userStory: userStories[0]._id,
      assignee: users[2]._id, // Frontend dev
      status: 'done',
      priority: 'high',
      actualHours: 5,
      reporter: users[1]._id
    },
    {
      code: 'TASK-002',
      title: 'Implement authentication API',
      description: 'Xây dựng API xác thực người dùng',
      project: userStories[0].project,
      userStory: userStories[0]._id,
      assignee: users[3]._id, // Backend dev
      status: 'done',
      priority: 'high',
      actualHours: 12,
      reporter: users[1]._id
    },
    // Tasks for US-002: Admin Dashboard
    {
      code: 'TASK-003',
      title: 'Create admin dashboard layout',
      description: 'Thiết kế layout dashboard admin',
      project: userStories[1].project,
      userStory: userStories[1]._id,
      assignee: users[2]._id, // Frontend dev
      status: 'done',
      priority: 'medium',
      actualHours: 4,
      reporter: users[1]._id
    },
    {
      code: 'TASK-004',
      title: 'Implement dashboard metrics',
      description: 'Hiển thị các chỉ số thống kê',
      project: userStories[1].project,
      userStory: userStories[1]._id,
      assignee: users[3]._id, // Backend dev
      status: 'done',
      priority: 'medium',
      actualHours: 8,
      reporter: users[1]._id
    },
    // Tasks for US-003: Product Management
    {
      code: 'TASK-005',
      title: 'Design product management UI',
      description: 'Giao diện quản lý sản phẩm',
      project: userStories[2].project,
      userStory: userStories[2]._id,
      assignee: users[2]._id, // Frontend dev
      status: 'in-progress',
      priority: 'high',
      actualHours: 6,
      reporter: users[1]._id
    },
    {
      code: 'TASK-006',
      title: 'Create product CRUD API',
      description: 'API thêm, sửa, xóa sản phẩm',
      project: userStories[2].project,
      userStory: userStories[2]._id,
      assignee: users[3]._id, // Backend dev
      status: 'in-progress',
      priority: 'high',
      actualHours: 10,
      reporter: users[1]._id
    },
    // Tasks for US-004: Product Catalog Display
    {
      code: 'TASK-007',
      title: 'Design product catalog UI',
      description: 'Giao diện hiển thị danh sách sản phẩm',
      project: userStories[3].project,
      userStory: userStories[3]._id,
      assignee: users[2]._id, // Frontend dev
      status: 'in-progress',
      priority: 'high',
      actualHours: 8,
      reporter: users[1]._id
    },
    {
      code: 'TASK-008',
      title: 'Implement product filtering',
      description: 'Tính năng lọc và tìm kiếm sản phẩm',
      project: userStories[3].project,
      userStory: userStories[3]._id,
      assignee: users[3]._id, // Backend dev
      status: 'todo',
      priority: 'medium',
      actualHours: 0,
      reporter: users[1]._id
    }
  ];

  const tasks = [];
  for (const taskData of tasksData) {
    const task = new Task(taskData);
    await task.save();
    tasks.push(task);
  }
  return tasks;
}

createRealData(); 