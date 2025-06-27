import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SprintsPage() {
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: '',
    projectId: '',
    startDate: '',
    endDate: '',
    goal: '',
    velocity: '',
    capacity: ''
  });

  useEffect(() => {
    fetchData(projectFilter);
  }, [projectFilter]);

  const fetchData = async (currentProjectFilter) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Lấy projects
      const resProjects = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataProjects = await resProjects.json();
      if (dataProjects.success) {
      setProjects(dataProjects.data.projects);
      }

      // Lấy sprints
      let sprintsUrl = '/api/sprints';
      if (currentProjectFilter && currentProjectFilter !== 'all') {
        sprintsUrl += `?projectId=${currentProjectFilter}`;
      }
      const resSprints = await fetch(sprintsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataSprints = await resSprints.json();
      if (dataSprints.success) {
      setSprints(dataSprints.data.sprints);
      }
    } catch {/* ignore */}
    finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Tính duration
      const duration = Math.ceil((new Date(newSprint.endDate) - new Date(newSprint.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      // Tạo code tự động nếu không có input
      const code = newSprint.code || `SPR-${Date.now()}`;
      const sprintData = {
        ...newSprint,
        project: newSprint.projectId, // projectId là _id thực tế
        code,
        timeline: {
          startDate: newSprint.startDate,
          endDate: newSprint.endDate,
          duration
        }
      };
      delete sprintData.projectId;
      delete sprintData.startDate;
      delete sprintData.endDate;
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sprintData)
      });
      if (!res.ok) throw new Error('Tạo sprint thất bại');
      setShowCreateModal(false);
      setNewSprint({
        name: '',
        projectId: '',
        startDate: '',
        endDate: '',
        goal: '',
        velocity: '',
        capacity: '',
        code: ''
      });
      fetchData(projectFilter); // Reload lại danh sách
    } catch {/* ignore */}
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      planning: 'Lập kế hoạch',
      'in-progress': 'Đang thực hiện',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getVelocityColor = (velocity, capacity) => {
    const ratio = capacity > 0 ? velocity / capacity : 0;
    if (ratio >= 0.9) return 'text-green-600';
    if (ratio >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredSprints = sprints.filter(sprint => {
    const matchesSearch = sprint.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Sprint</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý và theo dõi các sprint trong dự án
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo sprint
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên sprint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option key="all" value="all">Tất cả</option>
              <option key="planning" value="planning">Lập kế hoạch</option>
              <option key="in-progress" value="in-progress">Đang thực hiện</option>
              <option key="completed" value="completed">Hoàn thành</option>
              <option key="cancelled" value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dự án
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option key="all" value="all">Tất cả dự án</option>
              {projects.map(project => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setProjectFilter('all');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Sprints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSprints.map((sprint) => (
          <div key={sprint._id || sprint.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sprint.name}</h3>
                  <p className="text-sm text-gray-500">{sprint.project?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sprint.status)}`}>
                  {getStatusText(sprint.status)}
                </span>
              </div>

              {/* Goal */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{sprint.goals?.join(', ')}</p>

              {/* Dates */}
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>Bắt đầu: {sprint.timeline?.startDate ? new Date(sprint.timeline.startDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                <span>Kết thúc: {sprint.timeline?.endDate ? new Date(sprint.timeline.endDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Tiến độ</span>
                  <span>{calculateProgress(sprint.statistics?.completedStoryPoints, sprint.statistics?.plannedStoryPoints)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(sprint.statistics?.completedStoryPoints, sprint.statistics?.plannedStoryPoints)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{sprint.statistics?.completedStoryPoints || 0}/{sprint.statistics?.plannedStoryPoints || 0}</div>
                  <div className="text-xs text-gray-500">Story Points</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getVelocityColor(sprint.statistics?.velocity, sprint.capacity)}`}>
                    {sprint.statistics?.velocity || 0}/{sprint.capacity || 0}
                  </div>
                  <div className="text-xs text-gray-500">Velocity</div>
                </div>
              </div>

              {/* Team & Items */}
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  {sprint.team?.length || 0} thành viên
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {sprint.statistics?.totalUserStories || 0} stories
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {sprint.statistics?.totalBugs || 0} bugs
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <Link
                  to={`/sprints/${sprint._id || sprint.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Xem chi tiết
                </Link>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Sprint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo sprint mới</h3>
              <form onSubmit={handleCreateSprint} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sprint *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSprint.name}
                    onChange={(e) => setNewSprint({...newSprint, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dự án *
                  </label>
                  <select
                    required
                    value={newSprint.projectId}
                    onChange={e => setNewSprint({ ...newSprint, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option key="default" value="">Chọn dự án</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mục tiêu sprint
                  </label>
                  <textarea
                    value={newSprint.goal}
                    onChange={(e) => setNewSprint({...newSprint, goal: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu *
                    </label>
                    <input
                      type="date"
                      required
                      value={newSprint.startDate}
                      onChange={(e) => setNewSprint({...newSprint, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc *
                    </label>
                    <input
                      type="date"
                      required
                      value={newSprint.endDate}
                      onChange={(e) => setNewSprint({...newSprint, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Velocity ước tính
                    </label>
                    <input
                      type="number"
                      value={newSprint.velocity}
                      onChange={(e) => setNewSprint({...newSprint, velocity: e.target.value})}
                      placeholder="Story points"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={newSprint.capacity}
                      onChange={(e) => setNewSprint({...newSprint, capacity: e.target.value})}
                      placeholder="Story points"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                    Tạo sprint
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