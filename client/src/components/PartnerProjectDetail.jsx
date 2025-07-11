import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import PartnerDeliveryForm from './PartnerDeliveryForm';
import PartnerModuleDetail from './PartnerModuleDetail';
import { useParams } from 'react-router-dom';

export default function PartnerProjectDetail({ onBack }) {
  const { projectId } = useParams();
  const { showSuccess } = useNotifications();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showModuleDetail, setShowModuleDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Lấy project demo theo id (hoặc fetch nếu cần)
  const project = {
    id: projectId,
    name: 'Dự án Đối tác Demo 1',
    code: 'DA01',
    status: 'active',
    description: 'Dự án mẫu cho đối tác',
    timeline: { startDate: '2023-01-01', endDate: '2023-12-31' },
    team: { developers: [{ fullName: 'Dev Demo' }] },
    modules: [{ name: 'Module Demo', status: 'completed' }],
    progress: 80
  };

  useEffect(() => {
    if (projectId) {
      fetchModules();
    }
  }, [projectId]);

  const fetchModules = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/partners/me/projects/${projectId}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data.data.modules);
      } else {
        // Fallback demo nếu không lấy được dữ liệu
        setModules([
          {
            _id: 'mod1',
            name: 'Module Demo 1',
            code: 'MD01',
            status: 'completed',
            deliveryStatus: 'accepted',
            assignedTo: { fullName: 'Dev Demo' },
            qa: { fullName: 'QA Demo' },
            reviewer: { fullName: 'Reviewer Demo' },
            deliveredBy: { fullName: 'DevOps Demo' }
          }
        ]);
      }
    } catch {
      // Fallback demo nếu lỗi API
      setModules([
        {
          _id: 'mod1',
          name: 'Module Demo 1',
          code: 'MD01',
          status: 'completed',
          deliveryStatus: 'accepted',
          assignedTo: { fullName: 'Dev Demo' },
          qa: { fullName: 'QA Demo' },
          reviewer: { fullName: 'Reviewer Demo' },
          deliveredBy: { fullName: 'DevOps Demo' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setShowModuleDetail(true);
    showSuccess(`Đã chọn module: ${module.name}`);
  };

  const handleDelivery = (module) => {
    setSelectedModule(module);
    setShowDeliveryForm(true);
  };

  const handleDeliverySuccess = () => {
    setShowDeliveryForm(false);
    setSelectedModule(null);
    fetchModules(); // Refresh modules after delivery
    showSuccess('Bàn giao module thành công!');
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

  if (showModuleDetail && selectedModule) {
    return (
      <PartnerModuleDetail
        module={selectedModule}
        project={project}
        onBack={() => {
          setShowModuleDetail(false);
          setSelectedModule(null);
        }}
        onDeliverySuccess={handleDeliverySuccess}
      />
    );
  }

  if (showDeliveryForm && selectedModule) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDeliveryForm(false)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h2 className="text-lg font-medium text-gray-900">
              Bàn giao Module: {selectedModule.name}
            </h2>
          </div>
        </div>
        
        <PartnerDeliveryForm
          module={selectedModule}
          project={project}
          onSuccess={handleDeliverySuccess}
          onCancel={() => setShowDeliveryForm(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách dự án
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-600">Mã dự án: {project.code}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin dự án</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Mô tả:</p>
            <p className="text-gray-900">{project.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Thời gian:</p>
            <p className="text-gray-900">
              {new Date(project.timeline?.startDate).toLocaleDateString('vi-VN')} - 
              {new Date(project.timeline?.endDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* Module Statistics */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê Module</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
            <div className="text-sm text-gray-600">Tổng module</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {modules.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Hoàn thành</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {modules.filter(m => m.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600">Đang thực hiện</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {modules.filter(m => m.deliveryStatus === 'accepted').length}
            </div>
            <div className="text-sm text-gray-600">Đã bàn giao</div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Danh sách Module</h3>
            <p className="text-sm text-gray-600">
              Tổng cộng {modules.length} module trong dự án này
            </p>
          </div>
          {selectedModule && !showModuleDetail && (
            <div className="mt-4 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Đã chọn: {selectedModule.name}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        {/* Modules Grid */}
        {filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredModules.map((module) => (
              <div
                key={module._id}
                className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
                  selectedModule && selectedModule.id === module._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {/* Module Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-1">
                        {module.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        Mã module: {module.code}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(module.status)}`}>
                        {getStatusText(module.status)}
                      </span>
                      {module.deliveryStatus && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(module.deliveryStatus)}`}>
                          {getDeliveryStatusText(module.deliveryStatus)}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {module.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Tiến độ hoàn thành</span>
                      <span>{module.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${module.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                                  {/* Module Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Deadline: {new Date(module.deadline).toLocaleDateString('vi-VN')}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Thời gian: {module.estimatedHours || 'N/A'} giờ</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Developer: {module.assignedTo?.name || 'Chưa phân công'}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>JIRA ID: {module.jiraId || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Tài liệu: {module.documents?.length || 0} files</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>Source code: {module.sourceCode ? 'Có' : 'Chưa có'}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                          <span>Git commit: {module.gitCommitHash ? module.gitCommitHash.substring(0, 8) : 'N/A'}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Test status: {module.testStatus || 'Chưa test'}</span>
                        </div>
                      </div>
                    </div>

                    {/* CI/CD Status */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Trạng thái CI/CD</h5>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${module.buildStatus === 'success' ? 'bg-green-500' : module.buildStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                          <span className="text-gray-600">Build: {module.buildStatus || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${module.deployStatus === 'success' ? 'bg-green-500' : module.deployStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                          <span className="text-gray-600">Deploy: {module.deployStatus || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${module.sonarStatus === 'passed' ? 'bg-green-500' : module.sonarStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                          <span className="text-gray-600">SonarQube: {module.sonarStatus || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                  {/* Delivery Information */}
                  {module.deliveryStatus && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Thông tin bàn giao</h5>
                      <div className="space-y-2 text-sm">
                        {module.deliveryDate && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Ngày bàn giao: {new Date(module.deliveryDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                        {module.deliveryNotes && (
                          <div className="text-gray-600">
                            <span className="font-medium">Ghi chú: </span>
                            {module.deliveryNotes}
                          </div>
                        )}
                        {module.reviewNotes && (
                          <div className="text-gray-600">
                            <span className="font-medium">Phản hồi: </span>
                            {module.reviewNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleModuleSelect({
                        id: module._id,
                        name: module.name,
                        code: module.code,
                        status: module.status,
                        description: module.description,
                        deadline: module.deadline,
                        deliveryStatus: module.deliveryStatus,
                        progress: module.progress,
                        estimatedHours: module.estimatedHours,
                        assignedTo: module.assignedTo,
                        requirements: module.requirements,
                        documents: module.documents,
                        sourceCode: module.sourceCode,
                        deliveryDate: module.deliveryDate,
                        deliveryNotes: module.deliveryNotes,
                        reviewNotes: module.reviewNotes,
                        createdAt: module.createdAt,
                        jiraId: module.jiraId,
                        gitCommitHash: module.gitCommitHash,
                        testStatus: module.testStatus,
                        buildStatus: module.buildStatus,
                        deployStatus: module.deployStatus,
                        sonarStatus: module.sonarStatus,
                        taskType: module.taskType,
                        priority: module.priority,
                        gitBranch: module.gitBranch,
                        pullRequestId: module.pullRequestId
                      })}
                      className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                    
                    {module.status === 'completed' && module.deliveryStatus !== 'accepted' && (
                      <button
                        onClick={() => handleDelivery({
                          id: module._id,
                          name: module.name,
                          code: module.code,
                          status: module.status,
                          description: module.description,
                          deadline: module.deadline,
                          deliveryStatus: module.deliveryStatus,
                          progress: module.progress,
                          estimatedHours: module.estimatedHours,
                          assignedTo: module.assignedTo,
                          requirements: module.requirements,
                          documents: module.documents,
                          sourceCode: module.sourceCode,
                          deliveryDate: module.deliveryDate,
                          deliveryNotes: module.deliveryNotes,
                          reviewNotes: module.reviewNotes
                        })}
                        className="flex-1 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                      >
                        Bàn giao
                      </button>
                    )}

                    {module.status === 'in-progress' && (
                      <button
                        className="flex-1 px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors"
                      >
                        Cập nhật tiến độ
                      </button>
                    )}
                  </div>
                </div>
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
          <div className="mt-6 pt-4 border-t border-gray-200">
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
    </div>
  );
} 