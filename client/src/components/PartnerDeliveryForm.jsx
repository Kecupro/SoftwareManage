import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import FileManager from './FileManager';

export default function PartnerDeliveryForm({ user, selectedProject, selectedModule }) {
  const { showError, showSuccess } = useNotifications();
  const [deliveryData, setDeliveryData] = useState({
    moduleId: '',
    deliveryNote: '',
    deliveryCommit: '',
    sourceCode: null,
    documentation: null,
    additionalFiles: []
  });
  const [loading, setLoading] = useState(false);
  const [availableModules, setAvailableModules] = useState([]);

  useEffect(() => {
    if (selectedProject) {
      fetchAvailableModules();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedModule) {
      setDeliveryData(prev => ({
        ...prev,
        moduleId: selectedModule.id
      }));
    }
  }, [selectedModule]);

  const fetchAvailableModules = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/partners/me/projects/${selectedProject.id}/modules?status=completed`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableModules(data.data.modules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, field) => {
    const files = Array.from(e.target.files);
    setDeliveryData(prev => ({
      ...prev,
      [field]: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deliveryData.moduleId) {
      showError('Vui lòng chọn module để bàn giao');
      return;
    }

    try {
      setLoading(true);

      // Tạo FormData để upload files
      const formData = new FormData();
      formData.append('moduleId', deliveryData.moduleId);
      formData.append('deliveryNote', deliveryData.deliveryNote);
      formData.append('deliveryCommit', deliveryData.deliveryCommit);

      // Append source code files
      if (deliveryData.sourceCode) {
        deliveryData.sourceCode.forEach(file => {
          formData.append('sourceCode', file);
        });
      }

      // Append documentation files
      if (deliveryData.documentation) {
        deliveryData.documentation.forEach(file => {
          formData.append('documentation', file);
        });
      }

      // Append additional files
      if (deliveryData.additionalFiles) {
        deliveryData.additionalFiles.forEach(file => {
          formData.append('additionalFiles', file);
        });
      }

      const response = await fetch('/api/partners/me/deliver', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess('Bàn giao module thành công!');
        
        // Reset form
        setDeliveryData({
          moduleId: '',
          deliveryNote: '',
          deliveryCommit: '',
          sourceCode: null,
          documentation: null,
          additionalFiles: []
        });
      } else {
        const error = await response.json();
        showError(error.message || 'Lỗi khi bàn giao module');
      }
    } catch (error) {
      console.error('Delivery error:', error);
      showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedModule = () => {
    if (selectedModule) return selectedModule;
    if (deliveryData.moduleId) {
      return availableModules.find(m => m._id === deliveryData.moduleId);
    }
    return null;
  };

  const selectedModuleData = getSelectedModule();

  if (!selectedProject) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa chọn dự án</h3>
        <p className="mt-1 text-sm text-gray-500">
          Vui lòng chọn một dự án từ tab "Dự án" để thực hiện bàn giao
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Bàn giao Module</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload source code và tài liệu bàn giao cho module đã hoàn thành
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

      {/* Delivery Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module Selection */}
          <div>
            <label htmlFor="moduleId" className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Module *
            </label>
            <select
              id="moduleId"
              name="moduleId"
              value={deliveryData.moduleId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn module --</option>
              {availableModules.map(module => (
                <option key={module._id} value={module._id}>
                  {module.name} ({module.code}) - {module.status}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Module Info */}
          {selectedModuleData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin Module</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tên:</span>
                  <span className="ml-2 font-medium">{selectedModuleData.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mã:</span>
                  <span className="ml-2 font-medium">{selectedModuleData.code}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="ml-2 font-medium">{selectedModuleData.status}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tiến độ:</span>
                  <span className="ml-2 font-medium">{selectedModuleData.progress || 0}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Note */}
          <div>
            <label htmlFor="deliveryNote" className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú bàn giao
            </label>
            <textarea
              id="deliveryNote"
              name="deliveryNote"
              value={deliveryData.deliveryNote}
              onChange={handleInputChange}
              rows={3}
              placeholder="Mô tả chi tiết về những gì đã được bàn giao..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Git Commit */}
          <div>
            <label htmlFor="deliveryCommit" className="block text-sm font-medium text-gray-700 mb-2">
              Git Commit Hash (tùy chọn)
            </label>
            <input
              type="text"
              id="deliveryCommit"
              name="deliveryCommit"
              value={deliveryData.deliveryCommit}
              onChange={handleInputChange}
              placeholder="abc123def456..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload Sections */}
          <div className="space-y-6">
            {/* Source Code Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Source Code</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="sourceCode" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload source code
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        ZIP, RAR, hoặc folder chứa source code
                      </span>
                    </label>
                    <input
                      id="sourceCode"
                      name="sourceCode"
                      type="file"
                      multiple
                      accept=".zip,.rar,.7z,.tar,.gz"
                      onChange={(e) => handleFileChange(e, 'sourceCode')}
                      className="sr-only"
                    />
                  </div>
                </div>
                {deliveryData.sourceCode && deliveryData.sourceCode.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Files đã chọn:</h4>
                    <ul className="space-y-1">
                      {deliveryData.sourceCode.map((file, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          📁 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Documentation Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tài liệu bàn giao</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="documentation" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload tài liệu
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, DOC, DOCX, hoặc các file tài liệu khác
                      </span>
                    </label>
                    <input
                      id="documentation"
                      name="documentation"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.md"
                      onChange={(e) => handleFileChange(e, 'documentation')}
                      className="sr-only"
                    />
                  </div>
                </div>
                {deliveryData.documentation && deliveryData.documentation.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Files đã chọn:</h4>
                    <ul className="space-y-1">
                      {deliveryData.documentation.map((file, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Files Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Files bổ sung (tùy chọn)</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="additionalFiles" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload files khác
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        Các file bổ sung khác nếu cần
                      </span>
                    </label>
                    <input
                      id="additionalFiles"
                      name="additionalFiles"
                      type="file"
                      multiple
                      onChange={(e) => handleFileChange(e, 'additionalFiles')}
                      className="sr-only"
                    />
                  </div>
                </div>
                {deliveryData.additionalFiles && deliveryData.additionalFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Files đã chọn:</h4>
                    <ul className="space-y-1">
                      {deliveryData.additionalFiles.map((file, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setDeliveryData({
                  moduleId: '',
                  deliveryNote: '',
                  deliveryCommit: '',
                  sourceCode: null,
                  documentation: null,
                  additionalFiles: []
                });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Làm mới
            </button>
            <button
              type="submit"
              disabled={loading || !deliveryData.moduleId}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang bàn giao...
                </div>
              ) : (
                'Bàn giao Module'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* File Manager for selected module */}
      {selectedModuleData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tài liệu đã upload cho module: {selectedModuleData.name}
          </h3>
          <FileManager 
            entityType="module"
            entityId={selectedModuleData._id}
            description="Tài liệu bàn giao module"
          />
        </div>
      )}
    </div>
  );
} 