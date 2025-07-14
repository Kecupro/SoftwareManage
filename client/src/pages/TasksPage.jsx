import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [modules, setModules] = useState([]);
  const [userStories, setUserStories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    code: '',
    description: '',
    project: '',
    sprint: '',
    module: '',
    userStory: '',
    assignee: '',
    priority: 'medium',
    status: 'todo',
    type: 'feature',
    estimatedHours: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [tasksRes, projectsRes, sprintsRes, storiesRes, usersRes, modulesRes] = await Promise.all([
        fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/sprints', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user-stories', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/modules', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      const tasksData = await tasksRes.json();
      const projectsData = await projectsRes.json();
      const sprintsData = await sprintsRes.json();
      const storiesData = await storiesRes.json();
      const usersData = await usersRes.json();
      const modulesData = await modulesRes.json();

      if (tasksData.success) setTasks(tasksData.data.tasks || []);
      if (projectsData.success) setProjects(projectsData.data.projects || []);
      if (sprintsData.success) setSprints(sprintsData.data.sprints || []);
      if (storiesData.success) setUserStories(storiesData.data.userStories || []);
      if (usersData.success) setUsers(usersData.data.users || []);
      if (modulesData.success) setModules(modulesData.data.modules || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.project) {
      alert('Vui lòng chọn một dự án.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const taskToCreate = {
        ...newTask,
        code: `TASK-${Date.now().toString().slice(-6).toUpperCase()}`
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskToCreate)
      });

      const data = await res.json();

      if (data.success) {
        fetchData();
      setShowCreateModal(false);
      setNewTask({
        title: '',
          code: '',
        description: '',
          project: '',
          sprint: '',
          module: '',
          userStory: '',
        assignee: '',
        priority: 'medium',
          status: 'todo',
          type: 'feature',
          estimatedHours: ''
      });
      } else {
        alert('Lỗi khi tạo task: ' + (data.errors ? data.errors.map(e => e.msg).join(', ') : data.message));
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Đã xảy ra lỗi nghiêm trọng khi tạo task.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-200 text-gray-800',
      'in-progress': 'bg-blue-200 text-blue-800',
      'in-review': 'bg-purple-200 text-purple-800',
      done: 'bg-green-200 text-green-800',
      blocked: 'bg-red-200 text-red-800'
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTaskTypeColor = (type) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      testing: 'bg-green-100 text-green-800',
      documentation: 'bg-yellow-100 text-yellow-800',
      bugfix: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      todo: 'Chưa bắt đầu',
      'in-progress': 'Đang thực hiện',
      'in-review': 'Đang review',
      done: 'Hoàn thành',
      blocked: 'Bị chặn'
    };
    return texts[status] || status;
  };

  const getPriorityText = (priority) => {
    const texts = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    };
    return texts[priority] || priority;
  };

  const getTaskTypeText = (type) => {
    const texts = {
      development: 'Development',
      design: 'Design',
      testing: 'Testing',
      documentation: 'Documentation',
      bugfix: 'Bug Fix'
    };
    return texts[type] || type;
  };

  const calculateProgress = (actual, estimated) => {
    if (!estimated || estimated === 0) return 0;
    return Math.round(((actual || 0) / estimated) * 100);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (task.code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.project?._id === projectFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee?._id === assigneeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý và theo dõi các tasks trong dự án
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo task
        </button>
      </div>

      {/* Filters */}
                  <div className="bg-white p-4 rounded-xl shadow-lg border border-white/50">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã task..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dự án
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người thực hiện
            </label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả người dùng</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              <option value="todo">Chưa bắt đầu</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="in-review">Đang review</option>
              <option value="done">Hoàn thành</option>
              <option value="blocked">Bị chặn</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Độ ưu tiên
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tất cả</option>
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setProjectFilter('all');
              setAssigneeFilter('all');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Tasks Table */}
                  <div className="bg-white shadow-lg rounded-xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dự án/Sprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiến độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giờ làm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200/50">
              {filteredTasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        <Link to={`/tasks/${task._id}`} className="font-medium text-blue-600 hover:text-blue-800">
                        {task.title}
                        </Link>
                        <p className="text-sm text-gray-500">{task.code}</p>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {task.userStory?.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskTypeColor(task.type)}`}>
                          {getTaskTypeText(task.type)}
                        </span>
                        {task.tags?.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{task.project?.name}</div>
                      <div className="text-sm text-gray-500">{task.sprint?.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateProgress(task.actualHours, task.estimatedHours)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{calculateProgress(task.actualHours, task.estimatedHours)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {task.actualHours}/{task.estimatedHours}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{task.assignee?.fullName || 'Chưa gán'}</div>
                    <div className="text-xs text-gray-500">
                      {task.comments?.length || 0} comments
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/tasks/${task._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Chi tiết
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-xl bg-white/90 backdrop-blur-sm border-white/50">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo task mới</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Nhập title của task..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                    placeholder="Mô tả chi tiết về task..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dự án *
                    </label>
                    <select
                      required
                      value={newTask.project}
                      onChange={(e) => setNewTask({...newTask, project: e.target.value, sprint: '', userStory: '', module: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn dự án</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sprint
                    </label>
                    <select
                      value={newTask.sprint}
                      onChange={(e) => setNewTask({...newTask, sprint: e.target.value, userStory: ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!newTask.project}
                    >
                      <option value="">Chọn Sprint</option>
                      {sprints.filter(s => s.project?._id === newTask.project).map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Module
                    </label>
                    <select
                      value={newTask.module}
                      onChange={(e) => setNewTask({...newTask, module: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!newTask.project}
                    >
                      <option value="">Chọn Module</option>
                      {modules.filter(m => m.project?._id === newTask.project).map(m => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                      ))}
                    </select>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Story
                  </label>
                  <select
                      value={newTask.userStory}
                      onChange={(e) => setNewTask({...newTask, userStory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!newTask.sprint}
                    >
                      <option value="">Chọn User Story</option>
                      {userStories.filter(us => us.sprint?._id === newTask.sprint).map(us => (
                        <option key={us._id} value={us._id}>
                          {us.title}
                      </option>
                    ))}
                  </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignee
                    </label>
                    <select
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Gán cho</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Độ ưu tiên
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại task
                    </label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="feature">Feature</option>
                      <option value="bugfix">Bug Fix</option>
                      <option value="design">Design</option>
                      <option value="testing">Testing</option>
                      <option value="documentation">Documentation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ ước tính
                  </label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                    placeholder="Giờ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tạo task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 