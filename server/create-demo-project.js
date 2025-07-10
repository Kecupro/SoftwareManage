const mongoose = require('mongoose');
const Project = require('./models/project.model');
const Module = require('./models/module.model');
const Sprint = require('./models/sprint.model');
const UserStory = require('./models/user-story.model');
const Task = require('./models/task.model');
const Bug = require('./models/bug.model');
const User = require('./models/user.model');
const Partner = require('./models/partner.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/software-dev-management';

async function createDemoData() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // 1. Tạo user mẫu (nếu chưa có)
  let user = await User.findOne({ username: 'demo_admin' });
  if (!user) {
    user = await User.create({ username: 'demo_admin', fullName: 'Demo Admin', role: 'admin', email: 'demo@demo.com', password: '123456' });
  }

  // 2. Tạo partner mẫu
  let partner = await Partner.findOne({ code: 'PARTNER_DEMO' });
  if (!partner) {
    partner = await Partner.create({
      name: 'Đối tác Demo',
      code: 'PARTNER_DEMO',
      description: 'Đối tác mẫu cho dự án demo',
      contact: { primaryContact: { name: 'Người liên hệ', email: 'partner@demo.com', phone: '0123456789' } },
      business: { type: 'enterprise' },
      status: 'active',
      createdBy: user._id
    });
  }

  // 3. Xóa project demo cũ nếu có
  await Project.deleteOne({ code: 'DEMO_FINISHED' });

  // 4. Xóa sprint demo cũ nếu có
  await Sprint.deleteMany({ code: { $in: ['SPRINT1', 'SPRINT2'] } });

  // 5. Tạo project
  const project = await Project.create({
    name: 'Dự án Demo Hoàn thành',
    code: 'DEMO_FINISHED',
    description: 'Dự án mẫu để demo hệ thống',
    status: 'completed',
    createdBy: user._id,
    timeline: { startDate: new Date('2024-01-01'), endDate: new Date('2024-03-31') },
    priority: 'high',
    partner: { id: partner._id },
    gitConfig: { repository: 'https://github.com/demo/demo-project.git' }
  });

  // 6. Tạo sprint
  const sprints = [];
  for (let i = 1; i <= 2; i++) {
    sprints.push(await Sprint.create({
      name: `Sprint ${i}`,
      code: `SPRINT${i}`,
      project: project._id,
      status: 'completed',
      createdBy: user._id,
      timeline: { startDate: new Date(`2024-01-0${i}`), endDate: new Date(`2024-01-1${i}`), duration: 10 },
      goals: [`Hoàn thành các user story sprint ${i}`],
      notes: `Sprint ${i} demo`,
    }));
  }

  // 7. Xóa module demo cũ nếu có
  await Module.deleteMany({ code: { $in: ['MODULE_DEMO_1', 'MODULE_DEMO_2', 'MODULE_DEMO_3'] } });

  // 8. Tạo module
  const modules = [];
  for (let i = 1; i <= 3; i++) {
    modules.push(await Module.create({
      name: `Module Demo ${i}`,
      code: `MODULE_DEMO_${i}`,
      project: project._id,
      status: 'completed',
      sprint: sprints[i % 2]._id,
      createdBy: user._id,
      description: `Module demo số ${i}`,
      assignedTo: user._id,
      qa: user._id,
      reviewer: user._id,
      devOps: user._id,
      progress: 100,
      deliveryStatus: 'accepted',
      technicalInfo: { technology: ['Node.js', 'React'], framework: ['Express'], database: 'MongoDB' },
      gitInfo: { repository: 'https://github.com/demo/demo-project.git', branch: 'main' },
    }));
  }

  // 8. Xóa user story demo cũ nếu có
  await UserStory.deleteMany({ code: { $in: ['US_DEMO_1', 'US_DEMO_2', 'US_DEMO_3', 'US_DEMO_4', 'US_DEMO_5', 'US_DEMO_6'] } });

  // 9. Xóa task demo cũ nếu có
  await Task.deleteMany({ code: { $in: [
    'TASK_DEMO_1', 'TASK_DEMO_2', 'TASK_DEMO_3', 'TASK_DEMO_4', 'TASK_DEMO_5', 'TASK_DEMO_6',
    'TASK_DEMO_7', 'TASK_DEMO_8', 'TASK_DEMO_9', 'TASK_DEMO_10', 'TASK_DEMO_11', 'TASK_DEMO_12'
  ] } });

  // 10. Xóa bug demo cũ nếu có
  await Bug.deleteMany({ code: { $in: [
    'BUG_DEMO_1', 'BUG_DEMO_2', 'BUG_DEMO_3', 'BUG_DEMO_4', 'BUG_DEMO_5'
  ] } });

  // 11. Tạo user story
  const userStories = [];
  for (let i = 1; i <= 6; i++) {
    userStories.push(await UserStory.create({
      title: `User Story Demo ${i}`,
      code: `US_DEMO_${i}`,
      project: project._id,
      module: modules[i % 3]._id,
      sprint: sprints[i % 2]._id,
      status: 'completed',
      createdBy: user._id,
      assignedTo: user._id,
      description: `User story demo số ${i}`,
      userStory: {
        asA: 'Người dùng demo',
        iWant: `Chức năng demo ${i}`,
        soThat: 'Tôi có thể kiểm thử hệ thống'
      },
      estimation: { storyPoints: 5, timeEstimate: 8, actualTime: 8 },
      progress: 100,
      acceptanceCriteria: [{ description: 'Đạt yêu cầu demo', isMet: true }],
      definitionOfDone: [{ item: 'Code hoàn thành', isCompleted: true }],
      technicalInfo: { complexity: 'medium', tags: ['demo'] },
      deliveryStatus: 'accepted',
    }));
  }

  // 12. Tạo task
  const tasks = [];
  for (let i = 1; i <= 12; i++) {
    tasks.push(await Task.create({
      title: `Task Demo ${i}`,
      code: `TASK_DEMO_${i}`,
      project: project._id,
      module: modules[i % 3]._id,
      sprint: sprints[i % 2]._id,
      userStory: userStories[i % 6]._id,
      status: 'done',
      assignee: user._id,
      reporter: user._id,
      createdBy: user._id,
      progress: 100,
      priority: 'high',
      type: 'feature',
    }));
  }

  // 13. Tạo bug
  const bugs = [];
  for (let i = 1; i <= 5; i++) {
    bugs.push(await Bug.create({
      title: `Bug Demo ${i}`,
      code: `BUG_DEMO_${i}`,
      project: project._id,
      module: modules[i % 3]._id,
      sprint: sprints[i % 2]._id,
      userStory: userStories[i % 6]._id,
      task: tasks[i % 12]._id,
      status: 'resolved',
      severity: 'medium',
      priority: 'medium',
      type: 'functional',
      reportedBy: user._id,
      assignedTo: user._id,
      description: `Bug demo số ${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  console.log('Demo project, modules, sprints, user stories, tasks, bugs đã được tạo!');
  mongoose.disconnect();
}

createDemoData(); 