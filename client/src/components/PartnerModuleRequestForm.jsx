import React, { useState } from 'react';
import { useToast } from './ToastContainer';

export default function PartnerModuleRequestForm({ selectedProject }) {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState({
    name: '',
    code: '',
    description: '',
    priority: 'medium',
    estimatedHours: '',
    startDate: '',
    endDate: '',
    technicalRequirements: '',
    businessRequirements: '',
    attachments: [],
    gitRepoUrl: '',
    gitCommit: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setRequestData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) {
      showError('Vui lòng chọn dự án trước khi gửi yêu cầu');
      return;
    }

    if (!requestData.name || !requestData.description) {
      showError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);

      // Tạo FormData để upload files
      const formData = new FormData();
      console.log('selectedProject:', selectedProject);
      console.log('project gửi lên:', selectedProject._id || selectedProject.id);
      formData.append('project', selectedProject._id || selectedProject.id);
      formData.append('name', requestData.name);
      formData.append('code', requestData.code);
      formData.append('description', requestData.description);
      formData.append('priority', requestData.priority);
      formData.append('estimatedHours', requestData.estimatedHours);
      formData.append('startDate', requestData.startDate);
      formData.append('endDate', requestData.endDate);
      formData.append('technicalRequirements', requestData.technicalRequirements);
      formData.append('businessRequirements', requestData.businessRequirements);
      formData.append('gitRepoUrl', requestData.gitRepoUrl);
      formData.append('gitCommit', requestData.gitCommit);

      // Append attachment files
      if (requestData.attachments && requestData.attachments.length > 0) {
        requestData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch('/api/module-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        showSuccess('Yêu cầu tạo module đã được gửi thành công!');
        
        // Reset form
        setRequestData({
          name: '',
          code: '',
          description: '',
          priority: 'medium',
          estimatedHours: '',
          startDate: '',
          endDate: '',
          technicalRequirements: '',
          businessRequirements: '',
          attachments: [],
          gitRepoUrl: '',
          gitCommit: ''
        });
      } else {
        let errorMsg = 'Lỗi khi gửi yêu cầu';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            if (error.errors && Array.isArray(error.errors)) {
              // Lấy thông báo lỗi chi tiết từ validation
              errorMsg = error.errors.map(e => e.msg).join('; ');
            } else {
              errorMsg = error.message || errorMsg;
            }
          } catch { /* ignore */ }
        }
        showError(errorMsg);
      }
    } catch (error) {
      console.error('Request error:', error);
      showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
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
          Vui lòng chọn một dự án từ tab "Dự án" để gửi yêu cầu tạo module
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Yêu cầu tạo Module mới</h2>
        <p className="text-sm text-gray-600 mb-4">
          Gửi yêu cầu tạo module mới cho dự án. Yêu cầu sẽ được review bởi team nội bộ.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Dự án: {selectedProject.name}</h3>
              <p className="text-sm text-blue-700">Mã: {selectedProject.code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên Module *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={requestData.name}
                onChange={handleInputChange}
                required
                placeholder="Ví dụ: User Management Module"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Mã Module (tùy chọn)
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={requestData.code}
                onChange={handleInputChange}
                placeholder="Ví dụ: USER_MGMT"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả Module *
            </label>
            <textarea
              id="description"
              name="description"
              value={requestData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Mô tả chi tiết chức năng và yêu cầu của module..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Git Repo & Commit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gitRepoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Git Repository URL
              </label>
              <input
                type="text"
                id="gitRepoUrl"
                name="gitRepoUrl"
                value={requestData.gitRepoUrl}
                onChange={handleInputChange}
                placeholder="https://git.example.com/your-repo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="gitCommit" className="block text-sm font-medium text-gray-700 mb-2">
                Commit Hash
              </label>
              <input
                type="text"
                id="gitCommit"
                name="gitCommit"
                value={requestData.gitCommit}
                onChange={handleInputChange}
                placeholder="Nhập commit hash liên quan (nếu có)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Priority and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Độ ưu tiên
              </label>
              <select
                id="priority"
                name="priority"
                value={requestData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="critical">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu mong muốn
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={requestData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Ngày hoàn thành mong muốn
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={requestData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Technical Requirements */}
          <div>
            <label htmlFor="technicalRequirements" className="block text-sm font-medium text-gray-700 mb-2">
              Yêu cầu kỹ thuật
            </label>
            <textarea
              id="technicalRequirements"
              name="technicalRequirements"
              value={requestData.technicalRequirements}
              onChange={handleInputChange}
              rows={3}
              placeholder="Mô tả yêu cầu kỹ thuật, công nghệ, framework, database..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Business Requirements */}
          <div>
            <label htmlFor="businessRequirements" className="block text-sm font-medium text-gray-700 mb-2">
              Yêu cầu nghiệp vụ
            </label>
            <textarea
              id="businessRequirements"
              name="businessRequirements"
              value={requestData.businessRequirements}
              onChange={handleInputChange}
              rows={3}
              placeholder="Mô tả yêu cầu nghiệp vụ, quy trình, luồng xử lý..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estimated Hours */}
          <div>
            <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
              Số giờ ước tính (tùy chọn)
            </label>
            <input
              type="number"
              id="estimatedHours"
              name="estimatedHours"
              value={requestData.estimatedHours}
              onChange={handleInputChange}
              placeholder="Ví dụ: 80"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Attachments */}
          <div>
            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
              Tài liệu đính kèm (tùy chọn)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="mt-4">
                  <label htmlFor="attachments" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload tài liệu
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PDF, DOC, DOCX, hoặc các file tài liệu khác
                    </span>
                  </label>
                  <input
                    id="attachments"
                    name="attachments"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
              </div>
              {requestData.attachments && requestData.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Files đã chọn:</h4>
                  <ul className="space-y-1">
                    {requestData.attachments.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setRequestData({
                  name: '',
                  code: '',
                  description: '',
                  priority: 'medium',
                  estimatedHours: '',
                  startDate: '',
                  endDate: '',
                  technicalRequirements: '',
                  businessRequirements: '',
                  attachments: [],
                  gitRepoUrl: '',
                  gitCommit: ''
                });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Làm mới
            </button>
            <button
              type="submit"
              disabled={loading || !requestData.name || !requestData.description}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gửi...
                </div>
              ) : (
                'Gửi yêu cầu'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Information Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Quy trình xử lý</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>1. Yêu cầu sẽ được gửi đến team nội bộ để review</p>
              <p>2. Team sẽ đánh giá tính khả thi và ước tính thời gian</p>
              <p>3. Bạn sẽ nhận được thông báo khi yêu cầu được chấp nhận hoặc từ chối</p>
              <p>4. Nếu được chấp nhận, module sẽ được tạo và bạn có thể theo dõi tiến độ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}