import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newModule, setNewModule] = useState({
    name: '',
    code: '',
    description: '',
    project: '',
    status: 'planning',
    priority: 'medium',
    estimatedHours: '',
    startDate: '',
    endDate: '',
    version: '',
    deliveryCommit: '',
    deliveryTime: '',
    deliveryNote: '',
    deliveredBy: '',
    deliveryFiles: []
  });

  useEffect(() => {
    fetchData(projectFilter);
  }, [projectFilter]);

  const fetchData = async (currentProjectFilter) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      let modulesUrl = '/api/modules';
      if (currentProjectFilter && currentProjectFilter !== 'all') {
        modulesUrl += `?projectId=${currentProjectFilter}`;
      }

      const [modulesRes, projectsRes] = await Promise.all([
        fetch(modulesUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const modulesData = await modulesRes.json();
      const projectsData = await projectsRes.json();

      if (modulesData.success) {
        setModules(modulesData.data.modules);
      }
      if (projectsData.success) {
        setProjects(projectsData.data.projects);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newModule)
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchData(projectFilter); // Tải lại dữ liệu để cập nhật danh sách
      setShowCreateModal(false);
      setNewModule({
        name: '',
        code: '',
        description: '',
        project: '',
        status: 'planning',
        priority: 'medium',
        estimatedHours: '',
        startDate: '',
          endDate: '',
          version: '',
          deliveryCommit: '',
          deliveryTime: '',
          deliveryNote: '',
          deliveredBy: '',
          deliveryFiles: []
        });
      } else {
        // Xử lý lỗi từ server (ví dụ: hiển thị thông báo)
        console.error('Error creating module:', data.message);
      }
    } catch (error) {
      console.error('Error creating module:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      'in-development': 'bg-blue-100 text-blue-800',
      testing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      onHold: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      planning: 'Lập kế hoạch',
      'in-development': 'Đang phát triển',
      testing: 'Đang test',
      completed: 'Hoàn thành',
      onHold: 'Tạm dừng'
    };
    return texts[status] || status;
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || module.status === statusFilter;
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
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Module</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý và theo dõi các module trong dự án
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm module
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
              placeholder="Tìm theo tên hoặc mã module..."
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
              <option value="in-development">Đang phát triển</option>
              <option value="testing">Đang test</option>
              <option value="completed">Hoàn thành</option>
              <option value="onHold">Tạm dừng</option>
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
              <option value="all">Tất cả dự án</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
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

      {/* Modules Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dự án
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đối tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredModules.map((module) => (
                <tr key={module._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{module.name}</div>
                      <div className="text-sm text-gray-500">{module.code}</div>
                      <div className="text-xs text-gray-400 mt-1" title={module.description}>
                        {module.description && module.description.length > 50
                          ? module.description.slice(0, 50) + '...'
                          : module.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link 
                      to={`/projects/${module.project?._id}`} 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {module.project?.name || 'N/A'}
                      </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(module.status)}`}>
                        {getStatusText(module.status)}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {module.delivery?.partner?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/modules/${module._id}`} className="text-indigo-600 hover:text-indigo-900">
                      Xem chi tiết
                      </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Module Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm module mới</h3>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên module *
                  </label>
                  <input
                    type="text"
                    required
                    value={newModule.name}
                    onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã module *
                  </label>
                  <input
                    type="text"
                    required
                    value={newModule.code}
                    onChange={(e) => setNewModule({...newModule, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dự án *
                  </label>
                  <select
                    id="project"
                    name="project"
                    value={newModule.project}
                    onChange={(e) => setNewModule({ ...newModule, project: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Chọn dự án</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newModule.description}
                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
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
                      value={newModule.startDate}
                      onChange={(e) => setNewModule({...newModule, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={newModule.endDate}
                      onChange={(e) => setNewModule({...newModule, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ ước tính
                    </label>
                    <input
                      type="number"
                      value={newModule.estimatedHours}
                      onChange={(e) => setNewModule({...newModule, estimatedHours: e.target.value})}
                      placeholder="Giờ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Độ ưu tiên
                    </label>
                    <select
                      value={newModule.priority}
                      onChange={(e) => setNewModule({...newModule, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phiên bản
                  </label>
                  <input
                    type="text"
                    value={newModule.version}
                    onChange={(e) => setNewModule({...newModule, version: e.target.value})}
                    placeholder="v1.0, v1.1, ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commit Hash bàn giao
                  </label>
                  <input
                    type="text"
                    value={newModule.deliveryCommit}
                    onChange={(e) => setNewModule({...newModule, deliveryCommit: e.target.value})}
                    placeholder="Commit hash"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian bàn giao
                  </label>
                  <input
                    type="datetime-local"
                    value={newModule.deliveryTime}
                    onChange={(e) => setNewModule({...newModule, deliveryTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú bàn giao
                  </label>
                  <textarea
                    value={newModule.deliveryNote}
                    onChange={(e) => setNewModule({...newModule, deliveryNote: e.target.value})}
                    placeholder="Ghi chú"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người bàn giao
                  </label>
                  <input
                    type="text"
                    value={newModule.deliveredBy}
                    onChange={(e) => setNewModule({...newModule, deliveredBy: e.target.value})}
                    placeholder="ID hoặc tên người bàn giao"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File bàn giao
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setNewModule({...newModule, deliveryFiles: Array.from(e.target.files)})}
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
                    Tạo module
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