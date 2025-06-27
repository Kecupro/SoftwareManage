const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/software-dev-management');
  console.log('Connected to MongoDB');

  const Task = require('./models/task.model');
  const Bug = require('./models/bug.model');
  const UserStory = require('./models/user-story.model');
  const Module = require('./models/module.model');
  const Sprint = require('./models/sprint.model');
  const Project = require('./models/project.model');
  const Partner = require('./models/partner.model');
  const User = require('./models/user.model');

  // Xóa dữ liệu theo thứ tự phụ thuộc
  await Task.deleteMany({});
  console.log('Deleted all tasks');
  await Bug.deleteMany({});
  console.log('Deleted all bugs');
  await UserStory.deleteMany({});
  console.log('Deleted all user stories');
  await Module.deleteMany({});
  console.log('Deleted all modules');
  await Sprint.deleteMany({});
  console.log('Deleted all sprints');
  await Project.deleteMany({});
  console.log('Deleted all projects');
  await Partner.deleteMany({});
  console.log('Deleted all partners');
  await User.deleteMany({});
  console.log('Deleted all users');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(err => {
  console.error('Error deleting data:', err);
  process.exit(1);
}); 