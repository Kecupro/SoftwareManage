import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios';
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
    priority: 'medium',
    partnerId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [projectsRes, partnersRes] = await Promise.all([
        fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/partners', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const projectsData = await projectsRes.json();
      const partnersData = await partnersRes.json();

      if (projectsData.success) {
        setProjects(projectsData.data.projects);
      }
      if (partnersData.success) {
        setPartners(partnersData.data.partners);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSamplePartner = async () => {
    const token = localStorage.getItem('token');
    const samplePartner = {
      name: "Công ty Đối tác Mẫu",
      code: `PARTNER_${Date.now().toString().slice(-4)}`,
      description: "Một đối tác công nghệ chiến lược.",
      contact: { primaryContact: { name: "Người liên hệ A", email: "contact@partner.com" } },
      business: { type: "enterprise" }
    };
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(samplePartner)
      });
      const data = await res.json();
      if (data.success) {
        alert('Tạo đối tác mẫu thành công! Giờ bạn có thể chọn nó khi tạo dự án.');
        fetchData(); // Tải lại dữ liệu để có partner mới
      } else {
        alert('Lỗi khi tạo đối tác mẫu: ' + data.message);
      }
    } catch {
      alert('Lỗi nghiêm trọng khi tạo đối tác mẫu.');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProject.name,
          code: newProject.code,
          description: newProject.description,
          priority: newProject.priority,
          partner: { id: newProject.partnerId },
          timeline: {
            startDate: newProject.startDate,
            endDate: newProject.endDate
          },
          gitConfig: { repository: "http://example.com/repo.git" }
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData(); // Tải lại danh sách
      setShowCreateModal(false);
      setNewProject({
        name: '',
        code: '',
        description: '',
        status: 'planning',
        startDate: '',
        endDate: '',
          priority: 'medium',
          partnerId: ''
      });
      } else {
        console.error('Failed to create project:', data.message);
        alert('Tạo dự án thất bại: ' + (data.errors ? data.errors.map(e => e.msg).join(', ') : data.message));
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      onHold: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      planning: 'Lập kế hoạch',
      active: 'Đang thực hiện',
      completed: 'Hoàn thành',
      onHold: 'Tạm dừng'
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
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
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Dự án</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý và theo dõi tất cả các dự án
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCreateSamplePartner}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            Tạo Đối tác Mẫu
          </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm dự án
        </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã dự án..."
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
              <option value="all">Tất cả</option>
              <option value="planning">Lập kế hoạch</option>
              <option value="active">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="onHold">Tạm dừng</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500">{project.code}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                    {getPriorityText(project.priority)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Tiến độ</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Ngày bắt đầu:</span>
                  <p>{project.timeline?.startDate ? new Date(project.timeline.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <span className="font-medium">Ngày kết thúc:</span>
                  <p>{project.timeline?.endDate ? new Date(project.timeline.endDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <span className="font-medium">Team size:</span>
                  <p>{project.team ? Object.values(project.team).flat().filter(Boolean).length : 0} người</p>
                </div>
                <div>
                  <span className="font-medium">Đối tác:</span>
                  <p>{project.partner?.name || 'Chưa có đối tác'}</p>
                </div>
              </div>

              {/* Git Repository Info */}
              {project.gitConfig?.repository && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="truncate">{project.gitConfig.repository}</span>
                  </div>
                </div>
              )}

              {/* Creator Info */}
              <div className="text-xs text-gray-500 mb-4">
                Tạo bởi: {project.createdBy?.fullName || project.createdBy?.username || 'Unknown'} 
                {project.createdAt && ` vào ${new Date(project.createdAt).toLocaleDateString('vi-VN')}`}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <Link to={`/projects/${project._id}`} className="text-blue-600 hover:text-blue-800 font-semibold">
                  Xem chi tiết
                </Link>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-md transition-colors"
                      title="Chỉnh sửa dự án"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors"
                      title="Xóa dự án"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-md transition-colors"
                      title="Thêm tùy chọn"
                    >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm dự án mới</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên dự án *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã dự án *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.code}
                    onChange={(e) => setNewProject({...newProject, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Độ ưu tiên
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700">
                    Đối tác *
                  </label>
                  <select
                    id="partnerId"
                    name="partnerId"
                    required
                    value={newProject.partnerId}
                    onChange={(e) => setNewProject({ ...newProject, partnerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn đối tác</option>
                    {partners.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
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
                    Tạo dự án
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