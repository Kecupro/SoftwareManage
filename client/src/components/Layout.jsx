import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { name: 'Dự án', href: '/projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Module', href: '/modules', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Sprint', href: '/sprints', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'User Stories', href: '/user-stories', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Tasks', href: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Bugs', href: '/bugs', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { name: 'Thành viên', href: '/users', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75M12 12a4 4 0 00-4-4h0a4 4 0 014-4h0a4 4 0 014 4h0a4 4 0 01-4 4z' },
    { name: 'Đối tác', href: '/partners', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Yêu cầu Module', href: '/module-requests', icon: 'M15 10l-4 4-4-4' },
  ];

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': 'Quản trị viên',
      'pm': 'Project Manager',
      'po': 'Product Owner',
      'ba': 'Business Analyst',
      'dev': 'Developer',
      'qa': 'Tester',
      'devops': 'DevOps',
      'partner': 'Đối tác'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:flex-shrink-0`}>
        <div className="flex flex-col w-64 h-full">
          <div className="flex flex-col h-0 flex-1 ">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {/* <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg> */}
                  </div>
                  <div className="ml-3">
                    <img src="/viettelsol.png" alt="Logo" className="w-full h-20" />
                  </div>
                </div>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'text-black hover:bg-red-600 hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      onClick={() => { console.log('Click:', item.href); }}
                    >
                      <svg
                        className={`${
                          isActive ? 'text-white' : 'text-red-600 group-hover:text-white'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex bg-red-600 p-4">
              <div className="flex items-center">
                <div>
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-medium text-red-600">
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-gray-300">{getRoleDisplayName(user?.role)}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-5 flex-shrink-0 bg-white p-1 rounded-md text-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <div className="md:hidden">
                <button
                  type="button"
                  className="h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Partner Portal Switch */}
              {user?.role === 'partner' && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Portal:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <Link
                      to="/dashboard"
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        !location.pathname.startsWith('/partner')
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Chính
                    </Link>
                    <Link
                      to="/partner/portal"
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        location.pathname.startsWith('/partner/portal')
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Đối tác
                    </Link>
                  </div>
                </div>
              )}

              {/* Notification Dropdown */}
              <NotificationDropdown />
              
              {/* User Menu */}
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3 hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}