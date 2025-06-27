const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/software-dev-management');
  console.log('Connected to MongoDB');

  const Partner = require('./models/partner.model');
  const User = require('./models/user.model');
  const Project = require('./models/project.model');
  const Module = require('./models/module.model');
  const Sprint = require('./models/sprint.model');
  const UserStory = require('./models/user-story.model');
  const Task = require('./models/task.model');
  const Bug = require('./models/bug.model');

  // 1. Tạo nhiều Partner và user partner
  const partners = [];
  const partnerUsers = [];
  // Tạo admin trước để lấy _id
  const admin = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // Plain text - model sẽ tự hash
    fullName: 'Quản trị viên',
    role: 'admin',
    isActive: true
  });
  console.log('Created admin:', admin._id);

  // Thêm user nội bộ cho các vai trò PM, PO, BA, DEV, QA, DevOps
  const pm = await User.create({
    username: 'pm1',
    email: 'pm1@example.com',
    password: 'pm1234',
    fullName: 'Project Manager 1',
    role: 'pm',
    isActive: true
  });
  const po = await User.create({
    username: 'po1',
    email: 'po1@example.com',
    password: 'po1234',
    fullName: 'Product Owner 1',
    role: 'po',
    isActive: true
  });
  const ba = await User.create({
    username: 'ba1',
    email: 'ba1@example.com',
    password: 'ba1234',
    fullName: 'Business Analyst 1',
    role: 'ba',
    isActive: true
  });
  const dev = await User.create({
    username: 'dev1',
    email: 'dev1@example.com',
    password: 'dev1234',
    fullName: 'Developer 1',
    role: 'dev',
    isActive: true
  });
  const qa = await User.create({
    username: 'qa1',
    email: 'qa1@example.com',
    password: 'qa1234',
    fullName: 'Tester 1',
    role: 'qa',
    isActive: true
  });
  const devops = await User.create({
    username: 'devops1',
    email: 'devops1@example.com',
    password: 'devops123',
    fullName: 'DevOps 1',
    role: 'devops',
    isActive: true
  });

  // 1. Tạo 1 Partner và user partner
  const partner = await Partner.create({
    name: 'Công ty Đối tác 1',
    code: 'PARTNER_1',
    description: 'Đối tác phát triển phần mềm số 1',
    contact: {
      primaryContact: {
        name: 'Nguyễn Văn A',
        email: 'partner1@example.com',
        phone: '0901234511'
      }
    },
    business: { type: 'enterprise' },
    status: 'active',
    createdBy: admin._id
  });
  partners.push(partner);
  const partnerUser = await User.create({
    username: 'partneruser1',
    email: 'partner1@example.com',
    password: 'partner123', // Plain text - model sẽ tự hash
    fullName: 'Nguyễn Văn A',
    role: 'partner',
    partnerId: partner._id,
    isActive: true
  });
  partnerUsers.push(partnerUser);
  console.log('Created partners and partner users:', partners.map(p => p._id));

  // 2. Tạo 1 Project cho Partner
  const projects = [];
  const project = await Project.create({
    name: 'Dự án 1 của Công ty Đối tác 1',
    code: 'PRJ_1_1',
    description: 'Phần mềm số 1 của đối tác Công ty Đối tác 1',
    partner: {
      id: partner._id,
      name: partner.name
    },
    team: {
      projectManager: admin._id
    },
    gitConfig: {
      repository: 'https://github.com/example/partner1-project1.git',
      branch: 'main'
    },
    timeline: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 31*24*60*60*1000)
    },
    status: 'active',
    createdBy: admin._id
  });
  projects.push({ project, partner, partnerUser });
  console.log('Created projects:', projects.map(p => p.project._id));

  // 3. Tạo 1 Module cho Project, gán delivery.partner đúng
  const modules = [];
  const module = await Module.create({
    name: 'Module 1 của Dự án 1 của Công ty Đối tác 1',
    code: 'MOD_PRJ_1_1_1',
    description: 'Module số 1 thuộc dự án Dự án 1 của Công ty Đối tác 1',
    project: project._id,
    status: 'planning',
    priority: 'high',
    delivery: {
      partner: partner._id
    },
    createdBy: admin._id
  });
  modules.push({ module, project, partner, partnerUser });
  console.log('Created modules:', modules.map(m => m.module._id));

  // 4. Tạo 1 Sprint, 1 UserStory, 1 Task, 1 Bug cho module
  for (const { module, project, partnerUser } of modules) {
    const sprintStart = new Date();
    const sprintEnd = new Date(Date.now() + 7*24*60*60*1000);
    const sprint = await Sprint.create({
      name: 'Sprint 1 cho Module 1 của Dự án 1 của Công ty Đối tác 1',
      code: 'SPRINT_MOD_PRJ_1_1_1_1',
      project: project._id,
      timeline: {
        startDate: sprintStart,
        endDate: sprintEnd,
        duration: 7
      },
      status: 'active',
      createdBy: admin._id
    });

    const userStory = await UserStory.create({
      title: 'User Story 1 cho Module 1 của Dự án 1 của Công ty Đối tác 1',
      code: 'US_MOD_PRJ_1_1_1_1_1',
      description: 'Chức năng 1 cho Module 1 của Dự án 1 của Công ty Đối tác 1',
      project: project._id,
      module: module._id,
      sprint: sprint._id,
      userStory: {
        asA: 'Người dùng',
        iWant: 'sử dụng chức năng 1 của Module 1 của Dự án 1 của Công ty Đối tác 1',
        soThat: 'đạt được mục tiêu nghiệp vụ'
      },
      status: 'backlog',
      priority: 'high',
      acceptanceCriteria: [
        { description: 'Có thể sử dụng chức năng 1 thành công', isMet: false }
      ],
      estimation: {
        storyPoints: 5,
        timeEstimate: 8
      },
      createdBy: admin._id
    });

    const task = await Task.create({
      title: 'Task 1 cho User Story 1',
      code: 'TASK_MOD_PRJ_1_1_1_1_1_1',
      project: project._id,
      module: module._id,
      sprint: sprint._id,
      userStory: userStory._id,
      status: 'todo',
      assignee: partnerUser._id,
      reporter: admin._id,
      createdBy: admin._id
    });

    const bug = await Bug.create({
      title: 'Bug 1 cho User Story 1',
      code: 'BUG_MOD_PRJ_1_1_1_1_1_1',
      description: 'Lỗi 1 phát sinh trong User Story 1 của Module 1 của Dự án 1 của Công ty Đối tác 1',
      project: project._id,
      module: module._id,
      sprint: sprint._id,
      userStory: userStory._id,
      status: 'open',
      reportedBy: admin._id,
      createdBy: admin._id
    });
  }
  console.log('Created sprints, user stories, tasks, bugs cho mỗi module.');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(err => {
  console.error('Error creating sample data:', err);
  process.exit(1);
}); 