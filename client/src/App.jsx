// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { FileUploadProvider } from './context/FileUploadContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastContainer';
import LoginPage from './pages/LoginPage';
import PartnerLoginPage from './pages/PartnerLoginPage';
import PartnerLandingPage from './pages/PartnerLandingPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import SprintsPage from './pages/SprintsPage';
import SprintDetailPage from './pages/SprintDetailPage';
import UserStoriesPage from './pages/UserStoriesPage';
import UserStoryDetailPage from './pages/UserStoryDetailPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import BugsPage from './pages/BugsPage';
import BugDetailPage from './pages/BugDetailPage';
import UsersPage from './pages/UsersPage';
import PartnerPortalPage from './pages/PartnerPortalPage';
import PartnersPage from './pages/PartnersPage';
import Layout from './components/Layout';
import ModuleRequestsPage from './pages/ModuleRequestsPage';
import PartnerProjectDetail from './components/PartnerProjectDetail';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/partner" element={<PartnerLandingPage />} />
        <Route path="/partner/login" element={<PartnerLoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="modules/:id" element={<ModuleDetailPage />} />
          <Route path="sprints" element={<SprintsPage />} />
          <Route path="sprints/:id" element={<SprintDetailPage />} />
          <Route path="user-stories" element={<UserStoriesPage />} />
          <Route path="user-stories/:id" element={<UserStoryDetailPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="module-requests" element={<ModuleRequestsPage />} />
          <Route path="module-requests/:id" element={<ModuleDetailPage />} />
          {/* Bugs management */}
          <Route path="bugs" element={<BugsPage />} />
          <Route path="bugs/:id" element={<BugDetailPage />} />
        </Route>

        {/* Partner Portal - Protected route */}
        <Route path="/partner/portal" element={
          <ProtectedRoute>
            <PartnerPortalPage />
          </ProtectedRoute>
        } />

        {/* Partner Portal - Nested routes */}
        <Route path="/partner/portal" element={
          <ProtectedRoute>
            <PartnerPortalPage />
          </ProtectedRoute>
        }>
          <Route path="projects/:projectId" element={<PartnerProjectDetail />} />
          {/* Có thể thêm route module chi tiết ở đây nếu muốn */}
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <ToastProvider>
        <FileUploadProvider>
          <AppContent />
        </FileUploadProvider>
      </ToastProvider>
    </NotificationProvider>
  );
}

export default App;
