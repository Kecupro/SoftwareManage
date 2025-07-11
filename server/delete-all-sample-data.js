const mongoose = require('mongoose');
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

async function deleteAllSampleData() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    console.log('🗑️ Bắt đầu xóa tất cả dữ liệu mẫu...');

    // Xóa tất cả dữ liệu
    const results = await Promise.all([
      User.deleteMany({}),
      Partner.deleteMany({}),
      Project.deleteMany({}),
      Module.deleteMany({}),
      Sprint.deleteMany({}),
      UserStory.deleteMany({}),
      Task.deleteMany({}),
      Bug.deleteMany({}),
      ModuleRequest.deleteMany({})
    ]);

    console.log('✅ Đã xóa tất cả dữ liệu mẫu!');
    console.log('📊 Kết quả xóa:');
    console.log(`   👥 Users: ${results[0].deletedCount} records`);
    console.log(`   🤝 Partners: ${results[1].deletedCount} records`);
    console.log(`   📋 Projects: ${results[2].deletedCount} records`);
    console.log(`   📦 Modules: ${results[3].deletedCount} records`);
    console.log(`   🏃 Sprints: ${results[4].deletedCount} records`);
    console.log(`   📖 User Stories: ${results[5].deletedCount} records`);
    console.log(`   ✅ Tasks: ${results[6].deletedCount} records`);
    console.log(`   🐛 Bugs: ${results[7].deletedCount} records`);
    console.log(`   📝 Module Requests: ${results[8].deletedCount} records`);

    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);
    console.log(`🎯 Tổng cộng: ${totalDeleted} records đã được xóa`);

  } catch (error) {
    console.error('❌ Lỗi xóa dữ liệu:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Đã đóng kết nối MongoDB');
  }
}

deleteAllSampleData(); 