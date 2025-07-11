import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FileManager from '../components/FileManager';
import PartnerProjectList from '../components/PartnerProjectList';
import PartnerProjectDetail from '../components/PartnerProjectDetail';
import PartnerModuleRequestForm from '../components/PartnerModuleRequestForm';
import PartnerDashboard from '../components/PartnerDashboard';
import NotificationDropdown from '../components/NotificationDropdown';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function PartnerPortalPage() {
  const { user: realUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewingProjectDetail, setViewingProjectDetail] = useState(false);

  // Fake user demo nếu chưa đăng nhập
  const user = realUser && realUser.role === 'partner' ? realUser : {
    id: 'partner-demo',
    fullName: 'Đối tác Demo',
    email: 'partner@example.com',
    role: 'partner',
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'projects', name: 'Dự án', icon: '📁' },
    { id: 'module-requests', name: 'Yêu cầu Module', icon: '📝' },
    { id: 'documents', name: 'Tài liệu', icon: '📄' }
  ];

  // Khi chọn dự án, đổi URL
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    navigate(`/partner/portal/projects/${project.id}`);
  };

  // Khi chọn module, đổi URL (nếu có tab module)
  // const handleModuleSelect = (module) => {
  //   navigate(`/partner/portal/modules/${module.id}`);
  // };

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
        {/* Render nội dung tab hoặc Outlet */}
        {location.pathname.startsWith('/partner/portal/projects/') || location.pathname.startsWith('/partner/portal/modules/') ? (
          <Outlet />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <PartnerDashboard user={user} />
            )}

            {activeTab === 'projects' && (
              <PartnerProjectList 
                user={user}
                onProjectSelect={handleProjectSelect}
                selectedProject={selectedProject}
                onViewDetail={handleProjectSelect}
              />
            )}

            {activeTab === 'projects' && viewingProjectDetail && selectedProject && (
              <PartnerProjectDetail
                project={selectedProject}
                onBack={() => setViewingProjectDetail(false)}
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
                    Upload và quản lý tài liệu chung của đối tác
                  </p>
                  
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-medium text-gray-900">
                        Tài liệu chung
                        </h3>
                        <span className="text-sm text-gray-500">
                        Partner ID: {user.id}
                        </span>
                      </div>
                      <FileManager 
                      entityType="partner"
                      entityId={user.id}
                      description="Tài liệu chung của đối tác"
                      />
                    </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 