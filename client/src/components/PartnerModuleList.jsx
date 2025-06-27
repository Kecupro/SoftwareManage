import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function PartnerModuleList({ selectedProject, onModuleSelect, selectedModule }) {
  const { showError, showSuccess } = useNotifications();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (selectedProject) {
      fetchModules();
    } else {
      setModules([]);
    }
  }, [selectedProject]);

  const fetchModules = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/partners/me/projects/${selectedProject.id}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data.data.modules);
      } else {
        showError('Không thể tải danh sách module');
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module) => {
    onModuleSelect(module);
    showSuccess(`Đã chọn module: ${module.name}`);
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || module.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-indigo-100 text-indigo-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'planning': return 'Lập kế hoạch';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'delivered': return 'Đã bàn giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ phê duyệt';
      case 'accepted': return 'Đã phê duyệt';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  if (!selectedProject) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa chọn dự án</h3>
        <p className="mt-1 text-sm text-gray-500">
          Vui lòng chọn một dự án từ tab "Dự án" để xem danh sách module
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Danh sách Module</h2>
          <p className="text-sm text-gray-600">
            Dự án: {selectedProject.name} ({selectedProject.code})
          </p>
        </div>
        {selectedModule && (
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Đã chọn: {selectedModule.name}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc mã module..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="planning">Lập kế hoạch</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="delivered">Đã bàn giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <div
              key={module._id}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedModule && selectedModule.id === module._id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleModuleSelect({
                id: module._id,
                name: module.name,
                code: module.code,
                status: module.status,
                description: module.description,
                deliveryStatus: module.deliveryStatus
              })}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {module.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {module.code}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                    {getStatusText(module.status)}
                  </span>
                  {module.deliveryStatus && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeliveryStatusColor(module.deliveryStatus)}`}>
                      {getDeliveryStatusText(module.deliveryStatus)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {module.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {module.timeline?.startDate && new Date(module.timeline.startDate).toLocaleDateString('vi-VN')} - 
                    {module.timeline?.endDate && new Date(module.timeline.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>
                    {module.tasks?.length || 0} tasks
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {module.technicalInfo?.estimatedEffort || 0}h ước tính
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Tiến độ: {module.progress || 0}%
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${module.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              {module.delivery && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Bàn giao:</span>
                      <span>
                        {module.delivery.deliveryDate 
                          ? new Date(module.delivery.deliveryDate).toLocaleDateString('vi-VN')
                          : 'Chưa bàn giao'
                        }
                      </span>
                    </div>
                    {module.delivery.deliveryFiles && module.delivery.deliveryFiles.length > 0 && (
                      <div className="flex items-center justify-between mt-1">
                        <span>Files:</span>
                        <span>{module.delivery.deliveryFiles.length} files</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy module</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Thử thay đổi bộ lọc tìm kiếm'
              : 'Dự án này chưa có module nào'
            }
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredModules.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Hiển thị {filteredModules.length} trong tổng số {modules.length} module
            </span>
            <span>
              {selectedModule ? 'Đã chọn 1 module' : 'Chưa chọn module nào'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 