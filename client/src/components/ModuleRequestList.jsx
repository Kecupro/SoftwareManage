import React, { useState, useEffect } from 'react';
import { useToast } from './ToastContainer';
import { Link } from 'react-router-dom';

export default function ModuleRequestList() {
  const { showError, showSuccess } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    action: 'approve',
    reviewNote: '',
    estimatedEffort: '',
    technicalFeasibility: 'feasible',
    recommendedTechnologies: '',
    risks: '',
    suggestions: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = '/api/module-requests';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        setRequests(data.data.requests || []);
      } else {
        showError('Không thể tải danh sách yêu cầu');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem('token');
      const url = `/api/module-requests/${selectedRequest._id}/${reviewData.action}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(result.message);
        setShowReviewModal(false);
        setSelectedRequest(null);
        setReviewData({
          action: 'approve',
          reviewNote: '',
          estimatedEffort: '',
          technicalFeasibility: 'feasible',
          recommendedTechnologies: '',
          risks: '',
          suggestions: ''
        });
        fetchRequests(); // Refresh list
      } else {
        const error = await response.json();
        showError(error.message || 'Lỗi khi xử lý yêu cầu');
      }
    } catch (error) {
      console.error('Review error:', error);
      showError('Lỗi kết nối server');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'approved': return 'Đã phê duyệt';
      case 'rejected': return 'Đã từ chối';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (request.name || '').toLowerCase().includes(term) ||
      (request.code || '').toLowerCase().includes(term) ||
      (request.partner?.name || '').toLowerCase().includes(term);
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Yêu cầu Module</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review và xử lý yêu cầu tạo module từ đối tác
          </p>
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
              placeholder="Tìm theo tên, mã module hoặc đối tác..."
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
              <option value="pending">Chờ xử lý</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="rejected">Đã từ chối</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchRequests}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yêu cầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đối tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dự án
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày yêu cầu
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.name}
                      </div>
                      {request.code && (
                        <div className="text-sm text-gray-500">
                          {request.code}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mt-1 max-w-xs truncate" title={request.description}>
                        {request.description}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.partner?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.project?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/module-requests/${request._id}`} className="text-indigo-600 hover:text-indigo-900">
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {reviewData.action === 'approve' ? 'Phê duyệt' : 'Từ chối'} Yêu cầu Module
              </h3>
              
              {/* Request Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin yêu cầu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tên:</span>
                    <span className="ml-2 font-medium">{selectedRequest.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã:</span>
                    <span className="ml-2 font-medium">{selectedRequest.code || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Đối tác:</span>
                    <span className="ml-2 font-medium">{selectedRequest.partner?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dự án:</span>
                    <span className="ml-2 font-medium">{selectedRequest.project?.name}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600">Mô tả:</span>
                  <p className="mt-1 text-sm">{selectedRequest.description}</p>
                </div>
              </div>

              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú review *
                  </label>
                  <textarea
                    value={reviewData.reviewNote}
                    onChange={(e) => setReviewData({ ...reviewData, reviewNote: e.target.value })}
                    required
                    rows={3}
                    placeholder="Nhập ghi chú review..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {reviewData.action === 'approve' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số giờ ước tính
                        </label>
                        <input
                          type="number"
                          value={reviewData.estimatedEffort}
                          onChange={(e) => setReviewData({ ...reviewData, estimatedEffort: e.target.value })}
                          placeholder="Giờ"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tính khả thi kỹ thuật
                        </label>
                        <select
                          value={reviewData.technicalFeasibility}
                          onChange={(e) => setReviewData({ ...reviewData, technicalFeasibility: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="feasible">Khả thi</option>
                          <option value="challenging">Thách thức</option>
                          <option value="not-feasible">Không khả thi</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Công nghệ đề xuất
                      </label>
                      <input
                        type="text"
                        value={reviewData.recommendedTechnologies}
                        onChange={(e) => setReviewData({ ...reviewData, recommendedTechnologies: e.target.value })}
                        placeholder="React, Node.js, MongoDB..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rủi ro
                      </label>
                      <textarea
                        value={reviewData.risks}
                        onChange={(e) => setReviewData({ ...reviewData, risks: e.target.value })}
                        rows={2}
                        placeholder="Mô tả các rủi ro có thể gặp..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đề xuất
                      </label>
                      <textarea
                        value={reviewData.suggestions}
                        onChange={(e) => setReviewData({ ...reviewData, suggestions: e.target.value })}
                        rows={2}
                        placeholder="Đề xuất cải tiến hoặc thay đổi..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-md ${
                      reviewData.action === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {reviewData.action === 'approve' ? 'Phê duyệt' : 'Từ chối'}
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