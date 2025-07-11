const express = require('express');
const Project = require('../models/project.model');
const Module = require('../models/module.model');
const Sprint = require('../models/sprint.model');
const UserStory = require('../models/user-story.model');
const Task = require('../models/task.model');
const Bug = require('../models/bug.model');

const router = express.Router();



// GET /api/dashboard/overview - Tổng quan dashboard
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Tạo filter theo vai trò
    let projectFilter = {};
    if (userRole === 'partner') {
      projectFilter = { 'partner.id': { $in: (req.user.dataScope && req.user.dataScope.partners) ? req.user.dataScope.partners : [] } };
    } else if (userRole !== 'admin') {
      projectFilter = { _id: { $in: (req.user.dataScope && req.user.dataScope.projects) ? req.user.dataScope.projects : [] } };
    }

    // Thống kê dự án
    const projectStats = await Project.aggregate([
      { $match: projectFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          planning: { $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] } }
        }
      }
    ]);

    // Thống kê module
    const moduleStats = await Module.aggregate([
      { $match: { project: { $in: (await Project.find(projectFilter).select('_id')).map(p => p._id) } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inDevelopment: { $sum: { $cond: [{ $eq: ['$status', 'in-development'] }, 1, 0] } },
          testing: { $sum: { $cond: [{ $eq: ['$status', 'testing'] }, 1, 0] } }
        }
      }
    ]);

    // Thống kê sprint
    const sprintStats = await Sprint.aggregate([
      { $match: { project: { $in: (await Project.find(projectFilter).select('_id')).map(p => p._id) } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]);

    // Thống kê user stories
    const userStoryStats = await UserStory.aggregate([
      { $match: { project: { $in: (await Project.find(projectFilter).select('_id')).map(p => p._id) } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          backlog: { $sum: { $cond: [{ $eq: ['$status', 'backlog'] }, 1, 0] } }
        }
      }
    ]);

    // Thống kê tasks
    let taskFilter = {};
    if (userRole === 'dev' || userRole === 'qa') {
      taskFilter = { assignedTo: userId };
    } else if (userRole !== 'admin') {
      taskFilter = { project: { $in: (req.user.dataScope && req.user.dataScope.projects) ? req.user.dataScope.projects : [] } };
    }

    const taskStats = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } }
        }
      }
    ]);

    // Thống kê bugs
    let bugFilter = {};
    if (userRole === 'qa') {
      bugFilter = { reportedBy: userId };
    } else if (userRole === 'dev') {
      bugFilter = { assignedTo: userId };
    } else if (userRole !== 'admin') {
      bugFilter = { project: { $in: (req.user.dataScope && req.user.dataScope.projects) ? req.user.dataScope.projects : [] } };
    }

    const bugStats = await Bug.aggregate([
      { $match: bugFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } }
        }
      }
    ]);

    // Dự án gần đây
    const recentProjects = await Project.find(projectFilter)
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name code status updatedAt');

    // Tasks của user (nếu là dev/qa)
    let myTasks = [];
    if (userRole === 'dev' || userRole === 'qa') {
      myTasks = await Task.find({ assignedTo: userId, status: { $ne: 'completed' } })
        .populate('project', 'name code')
        .populate('userStory', 'title')
        .sort({ priority: -1, createdAt: -1 })
        .limit(10);
    }

    // Bugs gần đây
    const recentBugs = await Bug.find(bugFilter)
      .populate('project', 'name code')
      .populate('module', 'name code')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          projects: projectStats[0] || { total: 0, active: 0, completed: 0, planning: 0 },
          modules: moduleStats[0] || { total: 0, completed: 0, inDevelopment: 0, testing: 0 },
          sprints: sprintStats[0] || { total: 0, active: 0, completed: 0 },
          userStories: userStoryStats[0] || { total: 0, completed: 0, inProgress: 0, backlog: 0 },
          tasks: taskStats[0] || { total: 0, completed: 0, inProgress: 0, todo: 0 },
          bugs: bugStats[0] || { total: 0, open: 0, resolved: 0, critical: 0 }
        },
        recentProjects,
        myTasks,
        recentBugs
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/dashboard/project/:id - Dashboard cho dự án cụ thể
router.get('/project/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && !req.user.canAccessData('project', projectId)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập dự án này'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }

    // Cập nhật thống kê dự án
    await project.updateStatistics();

    // Lấy modules của dự án
    const modules = await Module.find({ project: projectId })
      .select('name code status priority completionRate testPassRate');

    // Lấy sprints của dự án
    const sprints = await Sprint.find({ project: projectId })
      .select('name code status timeline completionRate');

    // Lấy user stories của dự án
    const userStories = await UserStory.find({ project: projectId })
      .populate('module', 'name code')
      .populate('assignedTo', 'username fullName')
      .select('title code status priority estimation.storyPoints completionRate');

    // Lấy tasks của dự án
    const tasks = await Task.find({ project: projectId })
      .populate('module', 'name code')
      .populate('assignedTo', 'username fullName')
      .select('title code status type assignedTo');

    // Lấy bugs của dự án
    const bugs = await Bug.find({ project: projectId })
      .populate('module', 'name code')
      .populate('assignedTo', 'username fullName')
      .select('title code status severity priority assignedTo');

    res.json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          code: project.code,
          status: project.status,
          statistics: project.statistics,
          completionRate: project.completionRate,
          userStoryCompletionRate: project.userStoryCompletionRate
        },
        modules,
        sprints,
        userStories,
        tasks,
        bugs
      }
    });
  } catch (error) {
    console.error('Project dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// GET /api/dashboard/stats - Thống kê tổng quan
router.get('/stats', async (req, res) => {
  try {
    // Demo data cho testing
    res.json({
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
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 