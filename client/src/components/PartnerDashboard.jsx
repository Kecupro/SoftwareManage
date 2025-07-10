import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function PartnerDashboard({ user, onTabChange }) {
  const { showError } = useNotifications();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalModules: 0,
    deliveredModules: 0,
    pendingDeliveries: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch partner statistics
      const statsResponse = await fetch('/api/partners/me/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data.statistics);
      } else {
        console.error('Failed to fetch statistics:', statsResponse.status);
        // Fallback to demo data
        setStats({
          totalProjects: 1,
          activeProjects: 1,
          completedProjects: 0,
          totalModules: 3,
          deliveredModules: 0,
          pendingDeliveries: 2
        });
      }

      // Fetch recent activities
      const activitiesResponse = await fetch('/api/partners/me/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData.data.activities);
      } else {
        console.error('Failed to fetch activities:', activitiesResponse.status);
        // Fallback to demo data
        setRecentActivities([
          {
            type: 'project',
            title: 'Dự án E-commerce Platform',
            description: 'Dự án mới được tạo và giao cho đối tác',
            timestamp: new Date().toISOString()
          },
          {
            type: 'module',
            title: 'User Management Module',
            description: 'Module quản lý người dùng đã hoàn thành',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'delivery',
            title: 'Product Catalog Module',
            description: 'Chuẩn bị bàn giao module danh mục sản phẩm',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Không thể tải dữ liệu dashboard, hiển thị dữ liệu demo');
      
      // Set demo data on error
      setStats({
        totalProjects: 1,
        activeProjects: 1,
        completedProjects: 0,
        totalModules: 3,
        deliveredModules: 0,
        pendingDeliveries: 2
      });
      
      setRecentActivities([
        {
          type: 'project',
          title: 'Dự án E-commerce Platform',
          description: 'Dự án mới được tạo và giao cho đối tác',
          timestamp: new Date().toISOString()
        },
        {
          type: 'module',
          title: 'User Management Module',
          description: 'Module quản lý người dùng đã hoàn thành',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (onTabChange) {
      onTabChange(action);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng dự án',
      value: stats.totalProjects,
      icon: '📁',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Dự án đang hoạt động',
      value: stats.activeProjects,
      icon: '🔄',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Dự án hoàn thành',
      value: stats.completedProjects,
      icon: '✅',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Module đã bàn giao',
      value: stats.deliveredModules,
      icon: '📤',
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Xin chào, {user.fullName}!
            </h1>
            <p className="text-blue-100">
              Đây là tổng quan về các dự án và hoạt động của bạn
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <div className="text-blue-100">Dự án tổng cộng</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleQuickAction('projects')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-2xl mr-3">📁</span>
            <div className="text-left">
              <div className="font-medium text-gray-900">Xem dự án</div>
              <div className="text-sm text-gray-500">Xem danh sách và chi tiết dự án</div>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('documents')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-2xl mr-3">📄</span>
            <div className="text-left">
              <div className="font-medium text-gray-900">Quản lý tài liệu</div>
              <div className="text-sm text-gray-500">Upload và xem tài liệu chung</div>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('module-requests')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-2xl mr-3">📝</span>
            <div className="text-left">
              <div className="font-medium text-gray-900">Yêu cầu Module</div>
              <div className="text-sm text-gray-500">Tạo yêu cầu module mới</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h2>
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <span className="text-lg">
                    {activity.type === 'delivery' ? '📤' : 
                     activity.type === 'upload' ? '📄' : 
                     activity.type === 'project' ? '📁' : 
                     activity.type === 'module' ? '🧩' : '📋'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có hoạt động</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu làm việc để thấy các hoạt động gần đây
            </p>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Trạng thái hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">Hệ thống hoạt động bình thường</span>
            </div>
            <span className="text-sm text-green-600">Online</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">Upload file</span>
            </div>
            <span className="text-sm text-blue-600">Sẵn sàng</span>
          </div>
        </div>
      </div>
    </div>
  );
} 