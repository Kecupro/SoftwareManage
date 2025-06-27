import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import FileManager from '../components/FileManager';
import PartnerProjectList from '../components/PartnerProjectList';
import PartnerModuleList from '../components/PartnerModuleList';
import PartnerModuleRequestForm from '../components/PartnerModuleRequestForm';
import PartnerDashboard from '../components/PartnerDashboard';
import NotificationDropdown from '../components/NotificationDropdown';

export default function PartnerPortalPage() {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // Kiểm tra quyền đối tác
  useEffect(() => {
    if (user && user.role !== 'partner') {
      showError('Bạn không có quyền truy cập trang đối tác');
    }
  }, [user, showError]);

  if (!user || user.role !== 'partner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-600">Trang này chỉ dành cho đối tác</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'projects', name: 'Dự án', icon: '📁' },
    { id: 'modules', name: 'Module', icon: '🧩' },
    { id: 'module-requests', name: 'Yêu cầu Module', icon: '📝' },
    { id: 'documents', name: 'Tài liệu', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal Đối tác</h1>
              <p className="text-sm text-gray-600">
                Xin chào, {user.fullName} - {user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Đối tác
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <PartnerDashboard user={user} />
        )}

        {activeTab === 'projects' && (
          <PartnerProjectList 
            user={user}
            onProjectSelect={setSelectedProject}
            selectedProject={selectedProject}
          />
        )}

        {activeTab === 'modules' && (
          <PartnerModuleList 
            user={user}
            selectedProject={selectedProject}
            onModuleSelect={setSelectedModule}
            selectedModule={selectedModule}
          />
        )}

        {activeTab === 'module-requests' && (
          <PartnerModuleRequestForm 
            user={user}
            selectedProject={selectedProject}
          />
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Quản lý tài liệu
              </h2>
              <p className="text-gray-600 mb-4">
                Upload và quản lý tài liệu liên quan đến dự án của bạn
              </p>
              
              {selectedProject ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-900">
                      Tài liệu dự án: {selectedProject.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Project ID: {selectedProject.id}
                    </span>
                  </div>
                  <FileManager 
                    entityType="project"
                    entityId={selectedProject.id}
                    description="Tài liệu dự án đối tác"
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa chọn dự án</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vui lòng chọn một dự án từ tab "Dự án" để quản lý tài liệu
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 